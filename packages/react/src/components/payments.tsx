import { useState, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { truncateMiddle, type ZcashNetwork } from '../utils/address.js';
import { parsePaymentCsv, validatePayments, type PaymentIssue, type PaymentRow } from '../utils/payments.js';
import { useNuiLocale, type NuiMessages } from './i18n.js';
import { DataTable, type Column } from './surfaces.js';
import { Amount, PrivacyBadge, TxStatus, type TxState } from './zcash.js';
import { Button, IconButton } from './actions.js';
import { Field, Textarea } from './forms.js';
import { CloseIcon } from './icons.js';

const ISSUE_KEY: Record<PaymentIssue, keyof NuiMessages> = {
  address: 'invalidAddress', amount: 'invalidAmount', memoNotAllowed: 'memoNotAllowed', memoTooLong: 'memoTooLong', duplicate: 'invalidAddress',
};

export interface BatchPaymentsProps {
  rows: PaymentRow[];
  onRemove?: (index: number) => void;
  decimals?: number;
  symbol?: string;
  network?: ZcashNetwork;
  /** Per-row status while a run is executing. */
  statuses?: Array<TxState | undefined>;
  /** Extra content in the summary bar (e.g. "Send" button). */
  actions?: ReactNode;
  className?: string;
}
/** Review table for payroll / batch transfers: validation per row, totals, privacy per recipient. */
export function BatchPayments({ rows, onRemove, decimals = 8, symbol = 'ZEC', network, statuses, actions, className }: BatchPaymentsProps) {
  const { m } = useNuiLocale();
  const result = validatePayments(rows, { decimals, network });
  type R = (typeof result.rows)[number];
  const columns: Column<R>[] = [
    { key: 'line', header: '#', cell: (r) => <span className="nui-text-muted nui-mono">{r.line}</span>, width: 40 },
    {
      key: 'recipient', header: m.recipient, cell: (r) => (
        <div className="nui-batch__recipient">
          {r.name && <strong>{r.name}</strong>}
          <span className="nui-mono" title={r.address} data-invalid={r.issues.includes('address') || undefined}>{truncateMiddle(r.address || '—', 10, 6)}</span>
        </div>
      ),
    },
    { key: 'privacy', header: '', cell: (r) => (r.issues.includes('address') ? null : <PrivacyBadge level={r.shielded ? 'shielded' : 'public'} describe={false} />) },
    { key: 'memo', header: m.memo, cell: (r) => <span className="nui-text-muted nui-batch__memo" title={r.memo}>{r.memo ?? '—'}</span> },
    { key: 'amount', header: m.amount, numeric: true, cell: (r) => (r.units ? <Amount value={r.units} decimals={decimals} symbol={symbol} exact /> : <span style={{ color: 'var(--nui-negative)' }}>{r.amount || '—'}</span>) },
    {
      key: 'status', header: m.status, cell: (r) => {
        const st = statuses?.[r.line - 1];
        if (st) return <TxStatus status={st} />;
        if (r.issues.length) return <span className="nui-batch__issue">{r.issues.includes('duplicate') && !r.issues.includes('address') ? 'Duplicate' : m[ISSUE_KEY[r.issues[0]!]]}</span>;
        return <span className="nui-text-muted">{m.valid}</span>;
      },
    },
  ];
  if (onRemove) columns.push({ key: 'remove', header: '', cell: (r) => <IconButton size="sm" label={`${m.remove} ${r.line}`} onClick={() => onRemove(r.line - 1)}><CloseIcon size={11} /></IconButton> });
  return (
    <div className={cx('nui-batch', className)}>
      <div className="nui-batch__summary">
        <span><b>{result.valid}</b> {m.recipients}</span>
        <span>{m.total} <b><Amount value={result.total} decimals={decimals} symbol={symbol} exact /></b></span>
        {result.invalid > 0 && <span className="nui-batch__issue"><b>{result.invalid}</b> {m.rowsInvalid}</span>}
        {actions && <span style={{ marginLeft: 'auto' }}>{actions}</span>}
      </div>
      <DataTable columns={columns} rows={result.rows} rowKey={(r) => String(r.line)} />
    </div>
  );
}

export interface BatchPaymentTableProps extends Omit<BatchPaymentsProps, 'onRemove'> {
  rows: PaymentRow[];
  /** Controlled row update after CSV import or row removal. */
  onChange: (rows: PaymentRow[]) => void;
  /** Replace the current rows or append imported recipients. Default replace. */
  importMode?: 'replace' | 'append';
  /** Hide the paste area when an app provides its own importer. */
  showImport?: boolean;
}
/** Editable payroll/airdrop workflow: paste CSV, validate every row, review totals and remove recipients. */
export function BatchPaymentTable({ rows, onChange, importMode = 'replace', showImport = true, className, ...tableProps }: BatchPaymentTableProps) {
  const { m } = useNuiLocale();
  const [csv, setCsv] = useState('');
  const [importError, setImportError] = useState(false);

  const importCsv = () => {
    const parsed = parsePaymentCsv(csv);
    if (!parsed.length) {
      setImportError(true);
      return;
    }
    onChange(importMode === 'append' ? [...rows, ...parsed] : parsed);
    setCsv('');
    setImportError(false);
  };

  return (
    <div className={cx('nui-batch-table', className)}>
      {showImport && (
        <div className="nui-batch__import">
          <Field label={m.pasteCsv} hint={m.pasteCsvHint} error={importError ? m.noCsvRows : undefined}>
            <Textarea
              rows={3}
              value={csv}
              placeholder="name,address,amount,memo"
              onChange={(e) => { setCsv(e.target.value); setImportError(false); }}
            />
          </Field>
          <div className="nui-batch__import-actions">
            <Button variant="outline" size="sm" disabled={!csv.trim()} onClick={importCsv}>{m.importCsv}</Button>
          </div>
        </div>
      )}
      <BatchPayments {...tableProps} rows={rows} onRemove={(index) => onChange(rows.filter((_, i) => i !== index))} />
    </div>
  );
}
