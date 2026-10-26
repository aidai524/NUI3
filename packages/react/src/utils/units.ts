// Fixed-point helpers. Amounts are bigint base units (zatoshi for ZEC) so no float rounding ever happens.

export const ZEC_DECIMALS = 8;
export const ZATOSHI_PER_ZEC = 100_000_000n;

export type Numeric = bigint | number | string;

function toBigInt(value: Numeric): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new RangeError(`Base-unit amount must be a safe integer, got ${value}`);
    return BigInt(value);
  }
  if (!/^-?\d+$/.test(value.trim())) throw new RangeError(`Base-unit amount must be an integer string, got "${value}"`);
  return BigInt(value.trim());
}

/** 123450000n, 8 -> "1.2345" (exact, trailing zeros trimmed). */
export function formatUnits(value: Numeric, decimals: number): string {
  const v = toBigInt(value);
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = (abs % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`;
}

/** "1.2345", 8 -> 123450000n. Throws on more decimals than allowed or invalid input. */
export function parseUnits(input: string, decimals: number): bigint {
  const s = input.trim().replace(/[,_\s]/g, '');
  const m = /^(-)?(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || (!m[2] && !m[3])) throw new RangeError(`Invalid amount "${input}"`);
  const [, sign, whole = '', frac = ''] = m;
  if (frac.length > decimals) throw new RangeError(`Too many decimals: max ${decimals}`);
  const v = BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(frac.padEnd(decimals, '0') || '0');
  return sign ? -v : v;
}

/** Non-throwing variant for live input validation. */
export function tryParseUnits(input: string, decimals: number): bigint | null {
  try {
    return parseUnits(input, decimals);
  } catch {
    return null;
  }
}

export const zatoshiToZec = (zat: Numeric) => formatUnits(zat, ZEC_DECIMALS);
export const zecToZatoshi = (zec: string) => parseUnits(zec, ZEC_DECIMALS);

/** Keep only characters valid while typing an amount; caps decimals. */
export function sanitizeAmountInput(raw: string, decimals: number): string {
  let s = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, decimals);
  if (/^0\d/.test(s)) s = s.replace(/^0+(?=\d)/, '');
  return s;
}

export interface FormatAmountOptions {
  decimals?: number;
  /** Max fraction digits to display (default: 4, or all when `exact`). */
  maxFractionDigits?: number;
  minFractionDigits?: number;
  /** Show every significant digit. Use in confirmations and receipts. */
  exact?: boolean;
  /** 1.2K / 3.4M. */
  compact?: boolean;
  locale?: string;
}

/**
 * Human formatting with grouping. Never rounds a non-zero amount down to "0":
 * returns "<0.0001" instead, so users don't think a balance is empty.
 */
export function formatAmount(value: Numeric, opts: FormatAmountOptions = {}): string {
  const { decimals = ZEC_DECIMALS, exact = false, compact = false, locale = 'en-US' } = opts;
  const exactStr = formatUnits(value, decimals);
  const neg = exactStr.startsWith('-');
  const [whole = '0', frac = ''] = exactStr.replace('-', '').split('.');
  const maxFrac = exact ? decimals : (opts.maxFractionDigits ?? 4);
  const minFrac = opts.minFractionDigits ?? 0;

  if (compact && whole.length > 4) {
    const n = Number(exactStr);
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
  }

  let shown = frac.slice(0, maxFrac);
  if (!exact && whole === '0' && frac && !/[1-9]/.test(shown)) {
    return `${neg ? '>-' : '<'}0.${'0'.repeat(Math.max(maxFrac - 1, 0))}1`;
  }
  shown = shown.replace(/0+$/, '').padEnd(minFrac, '0');
  const grouped = BigInt(whole).toLocaleString(locale);
  return `${neg ? '-' : ''}${grouped}${shown ? `.${shown}` : ''}`;
}

/** Fiat formatting for a number of fiat units (not base units). */
export function formatFiat(value: number, currency = 'USD', locale = 'en-US'): string {
  const abs = Math.abs(value);
  const digits = abs > 0 && abs < 0.01 ? 4 : 2;
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: Math.min(2, digits) }).format(value);
}

export function formatPercent(value: number, { fractionDigits = 2, signed = false, locale = 'en-US' } = {}): string {
  const s = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: fractionDigits, minimumFractionDigits: 0 }).format(value / 100);
  return signed && value > 0 ? `+${s}` : s;
}

export function formatCompact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 2 }).format(value);
}
