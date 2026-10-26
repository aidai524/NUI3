// Batch payments (payroll, airdrops): CSV parsing and validation.
import { isValidAddress, parseAddress, type ZcashNetwork } from './address.js';
import { isMemoValid } from './memo.js';
import { tryParseUnits } from './units.js';

export interface PaymentRow {
  name?: string;
  address: string;
  /** Decimal string as entered. */
  amount: string;
  memo?: string;
}

export type PaymentIssue = 'address' | 'amount' | 'memoNotAllowed' | 'memoTooLong' | 'duplicate';

export interface ValidatedPayment extends PaymentRow {
  line: number;
  issues: PaymentIssue[];
  /** Base units, null when amount is invalid. */
  units: bigint | null;
  shielded: boolean;
}

/** Minimal RFC 4180 CSV parser: quotes, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const HEADERS: Record<keyof PaymentRow, string[]> = {
  name: ['name', 'recipient', 'employee', '姓名', '收款人'],
  address: ['address', 'addr', 'wallet', '地址'],
  amount: ['amount', 'zec', 'value', '金额'],
  memo: ['memo', 'note', 'reference', '备注'],
};

/** CSV with a header row (name, address, amount, memo — any order), or headerless address,amount[,memo]. */
export function parsePaymentCsv(text: string): PaymentRow[] {
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (!rows.length) return [];
  const head = rows[0]!.map((h) => h.trim().toLowerCase());
  const col = (key: keyof PaymentRow) => head.findIndex((h) => HEADERS[key].includes(h));
  const hasHeader = col('address') !== -1;
  const idx = hasHeader
    ? { name: col('name'), address: col('address'), amount: col('amount'), memo: col('memo') }
    : { name: -1, address: 0, amount: 1, memo: 2 };
  return rows.slice(hasHeader ? 1 : 0).map((r) => ({
    name: idx.name >= 0 ? r[idx.name]?.trim() || undefined : undefined,
    address: (r[idx.address] ?? '').trim(),
    amount: (r[idx.amount] ?? '').trim().replace(/,/g, ''),
    memo: idx.memo >= 0 ? r[idx.memo]?.trim() || undefined : undefined,
  }));
}

export function validatePayments(rows: PaymentRow[], { decimals = 8, network }: { decimals?: number; network?: ZcashNetwork } = {}) {
  const seen = new Map<string, number>();
  const list: ValidatedPayment[] = rows.map((r, k) => {
    const issues: PaymentIssue[] = [];
    const info = parseAddress(r.address);
    if (!isValidAddress(r.address, network)) issues.push('address');
    const units = tryParseUnits(r.amount || '', decimals);
    if (units === null || units <= 0n) issues.push('amount');
    if (r.memo) {
      if (info && !info.shielded) issues.push('memoNotAllowed');
      else if (!isMemoValid(r.memo)) issues.push('memoTooLong');
    }
    const key = r.address.toLowerCase();
    if (seen.has(key)) issues.push('duplicate');
    else seen.set(key, k);
    return { ...r, line: k + 1, issues, units: units !== null && units > 0n ? units : null, shielded: Boolean(info?.shielded) };
  });
  const total = list.reduce((s, r) => s + (r.issues.length === 0 && r.units ? r.units : 0n), 0n);
  return { rows: list, total, valid: list.filter((r) => r.issues.length === 0).length, invalid: list.filter((r) => r.issues.length > 0).length };
}
