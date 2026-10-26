import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import qrcode from 'qrcode-generator';
import { cx } from '../utils/cx.js';
import { formatAmount, formatFiat, formatUnits, ZEC_DECIMALS, type Numeric } from '../utils/units.js';
import { ADDRESS_KIND_LABEL, parseAddress, truncateMiddle } from '../utils/address.js';
import { memoByteLength, MEMO_MAX_BYTES } from '../utils/memo.js';
import { CheckIcon, CopyIcon, EyeIcon, LockIcon, ShieldIcon } from './icons.js';
import { useFieldProps } from './forms.js';
import { useNuiLocale, type NuiMessages } from './i18n.js';

/* ------------------------------------------------------------ copy */

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout],
  );
  return { copied, copy };
}

export function CopyButton({ value, label, className }: { value: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy();
  const { m } = useNuiLocale();
  const name = copied ? m.copied : (label ?? m.copy);
  return (
    <button type="button" className={cx('nui-copy', className)} aria-label={name} title={name} data-copied={copied} onClick={() => copy(value)}>
      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
      <span className="nui-sr-only" aria-live="polite">{copied ? m.copied : ''}</span>
    </button>
  );
}

/* ------------------------------------------------------------ Address */

export interface AddressProps {
  address: string;
  /** Characters kept at start/end. `false` shows the full address (wraps). Default [10, 8]. */
  truncate?: [number, number] | false;
  copyable?: boolean;
  /** Show the detected type tag (Unified / Sapling / Transparent / TEX). Default true. */
  showKind?: boolean;
  /** Link to an explorer page. */
  href?: string;
  className?: string;
}
/** Zcash address with type tag, middle truncation and copy. The full value is always in `title` and copied verbatim. */
export function Address({ address, truncate = [10, 8], copyable = true, showKind = true, href, className }: AddressProps) {
  const { m } = useNuiLocale();
  const info = useMemo(() => parseAddress(address), [address]);
  const text = truncate ? truncateMiddle(address, truncate[0], truncate[1]) : address;
  return (
    <span className={cx('nui-address', !truncate && 'nui-address--full', className)} data-kind={info?.kind}>
      {showKind && info && <span className="nui-address__type">{ADDRESS_KIND_LABEL[info.kind]}</span>}
      {href ? (
        <a className="nui-address__text" href={href} title={address} style={{ color: 'inherit' }}>{text}</a>
      ) : (
        <span className="nui-address__text" title={address}>{text}</span>
      )}
      {copyable && <CopyButton value={address} label={m.copyAddress} />}
    </span>
  );
}

export interface HashProps {
  value: string;
  href?: string;
  truncate?: [number, number] | false;
  copyable?: boolean;
  className?: string;
}
/** Tx id / block hash / contract id. */
export function Hash({ value, href, truncate = [8, 6], copyable = true, className }: HashProps) {
  const { m } = useNuiLocale();
  const text = truncate ? truncateMiddle(value, truncate[0], truncate[1]) : value;
  return (
    <span className={cx('nui-hash', className)}>
      {href ? <a className="nui-hash__text" href={href} title={value}>{text}</a> : <span className="nui-hash__text" title={value}>{text}</span>}
      {copyable && <CopyButton value={value} label={m.copyHash} />}
    </span>
  );
}

/* ------------------------------------------------------------ Amount */

export interface AmountProps {
  /** Base units (zatoshi for ZEC) as bigint, integer string or safe integer. */
  value: Numeric;
  decimals?: number;
  /** Unit label. Default "ZEC". Pass null to hide. */
  symbol?: string | null;
  /** Show every digit (confirmations, receipts). */
  exact?: boolean;
  maxFractionDigits?: number;
  compact?: boolean;
  /** Fiat value (already converted) shown after the amount. */
  fiat?: number;
  currency?: string;
  /** Privacy mode: mask the number but keep layout. */
  hidden?: boolean;
  /** Color and sign for incoming/outgoing. */
  sign?: 'auto' | 'none';
  size?: 'md' | 'lg';
  className?: string;
}
/** Token amount with exact bigint math. Never displays a non-zero balance as "0". */
export function Amount({ value, decimals = ZEC_DECIMALS, symbol = 'ZEC', exact, maxFractionDigits, compact, fiat, currency = 'USD', hidden, sign = 'none', size = 'md', className }: AmountProps) {
  const { m, locale } = useNuiLocale();
  const exactText = formatUnits(value, decimals);
  const negative = exactText.startsWith('-');
  const isZero = /^-?0$/.test(exactText);
  const text = formatAmount(value, { decimals, exact, maxFractionDigits, compact, locale });
  const signed = sign === 'auto' && !isZero && !negative ? `+${text}` : text;
  return (
    <span
      className={cx('nui-amount', size === 'lg' && 'nui-amount--lg', hidden && 'nui-amount--hidden', sign === 'auto' && !isZero && (negative ? 'nui-amount--negative' : 'nui-amount--positive'), className)}
      title={hidden ? undefined : `${exactText}${symbol ? ` ${symbol}` : ''}`}
    >
      {hidden ? (
        <>
          <span className="nui-amount__value" aria-hidden="true">••••••</span>
          <span className="nui-sr-only">{m.amountHidden}</span>
        </>
      ) : (
        <span className="nui-amount__value">{signed}</span>
      )}
      {symbol && <span className="nui-amount__unit">{symbol}</span>}
      {fiat !== undefined && !hidden && <span className="nui-amount__fiat">≈ {formatFiat(fiat, currency, locale)}</span>}
    </span>
  );
}

/** Percent change with ▲/▼ and positive/negative color. `value` is a percentage (2.5 = 2.5%). */
export function PriceChange({ value, fractionDigits = 2, className }: { value: number; fractionDigits?: number; className?: string }) {
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : null;
  const { m } = useNuiLocale();
  return (
    <span className={cx('nui-delta', dir && `nui-delta--${dir}`, className)}>
      {Math.abs(value).toFixed(fractionDigits)}%
      {dir && <span className="nui-sr-only"> {dir === 'up' ? m.increase : m.decrease}</span>}
    </span>
  );
}

/* ------------------------------------------------------------ Privacy */

export type PrivacyLevel = 'shielded' | 'confidential' | 'public';

/**
 * Canonical wording. These levels are not interchangeable — never call a
 * confidential or public flow "shielded" or "fully private".
 */
export const PRIVACY_LEVELS: Record<PrivacyLevel, { label: string; description: string }> = {
  shielded: {
    label: 'Shielded',
    description: 'Zcash shielded pool. Sender, recipient and amount are encrypted on-chain.',
  },
  confidential: {
    label: 'Confidential',
    description: 'Confidential execution. Balances and positions are hidden from the public, but are processed by the execution environment and are not protected by Zcash shielded cryptography.',
  },
  public: {
    label: 'Public',
    description: 'Public chain or external protocol. Addresses, amounts and history are visible to anyone.',
  },
};

export interface PrivacyBadgeProps {
  level: PrivacyLevel;
  /** Override the label (keep the meaning). */
  label?: string;
  /** Show the description as a native tooltip. Default true. */
  describe?: boolean;
  className?: string;
}
const PRIVACY_KEYS: Record<PrivacyLevel, [keyof NuiMessages, keyof NuiMessages]> = {
  shielded: ['privacyShielded', 'privacyShieldedDesc'],
  confidential: ['privacyConfidential', 'privacyConfidentialDesc'],
  public: ['privacyPublic', 'privacyPublicDesc'],
};
/** Localized label + description for a privacy level. */
export function usePrivacyLevel(level: PrivacyLevel) {
  const { m } = useNuiLocale();
  const [l, d] = PRIVACY_KEYS[level];
  return { label: m[l], description: m[d] };
}

export function PrivacyBadge({ level, label, describe = true, className }: PrivacyBadgeProps) {
  const meta = usePrivacyLevel(level);
  const Icon = level === 'shielded' ? ShieldIcon : level === 'confidential' ? LockIcon : EyeIcon;
  return (
    <span className={cx('nui-privacy', className)} data-level={level} title={describe ? meta.description : undefined}>
      <Icon />
      {label ?? meta.label}
      {describe && <span className="nui-sr-only">: {meta.description}</span>}
    </span>
  );
}

export type Pool = 'orchard' | 'sapling' | 'transparent';
const POOL_KEY: Record<Pool, keyof NuiMessages> = { orchard: 'poolOrchard', sapling: 'poolSapling', transparent: 'poolTransparent' };
/** Zcash value pool indicator. Filled gold = Orchard, ring = Sapling, hollow = transparent. */
export function PoolBadge({ pool, children, className }: { pool: Pool; children?: ReactNode; className?: string }) {
  const { m } = useNuiLocale();
  return <span className={cx('nui-pool', className)} data-pool={pool}>{children ?? m[POOL_KEY[pool]]}</span>;
}

export function ChainBadge({ name, icon, className }: { name: string; icon?: ReactNode; className?: string }) {
  return (
    <span className={cx('nui-chain', className)}>
      {icon ?? <TokenIcon symbol={name} size="sm" />}
      {name}
    </span>
  );
}

/* ------------------------------------------------------------ Token icon */

export interface TokenIconProps {
  symbol: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
/** Round token logo with letter fallback. ZEC renders the gold mark. */
export function TokenIcon({ symbol, src, size = 'md', className }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const isZec = /^(t|w|s)?zec$/i.test(symbol) && !src;
  return (
    <span className={cx('nui-token-icon', size !== 'md' && `nui-token-icon--${size}`, isZec && 'nui-token-icon--zec', className)} aria-hidden="true">
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : isZec ? 'ⓩ' : symbol.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function TokenPair({ base, quote, size = 'md' }: { base: TokenIconProps; quote: TokenIconProps; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className="nui-token-pair" aria-label={`${base.symbol}/${quote.symbol}`}>
      <TokenIcon {...base} size={size} />
      <TokenIcon {...quote} size={size} />
    </span>
  );
}

/* ------------------------------------------------------------ Tx status */

export type TxState = 'pending' | 'confirming' | 'confirmed' | 'failed' | 'expired' | 'refunded';
const TX_KEY: Record<TxState, keyof NuiMessages> = { pending: 'txPending', confirming: 'txConfirming', confirmed: 'txConfirmed', failed: 'txFailed', expired: 'txExpired', refunded: 'txRefunded' };

export function TxStatus({ status, confirmations, required, label, className }: { status: TxState; confirmations?: number; required?: number; label?: string; className?: string }) {
  const { m } = useNuiLocale();
  const progress = status === 'confirming' && confirmations !== undefined ? ` ${confirmations}${required ? `/${required}` : ''}` : '';
  return <span className={cx('nui-tx-status', className)} data-status={status} role="status">{(label ?? m[TX_KEY[status]]) + progress}</span>;
}

/* ------------------------------------------------------------ Sync */

export interface SyncProgressProps {
  /** Scanned height. */
  height: number;
  /** Chain tip. */
  tip: number;
  /** Height the scan started from (wallet birthday). Default 0. */
  from?: number;
  label?: string;
  eta?: string;
  className?: string;
}
/** Light-wallet scan progress. */
export function SyncProgress({ height, tip, from = 0, label: labelProp, eta, className }: SyncProgressProps) {
  const { m, locale } = useNuiLocale();
  const label = labelProp ?? m.syncing;
  const span = Math.max(tip - from, 1);
  const pct = Math.min(100, Math.max(0, ((height - from) / span) * 100));
  const done = height >= tip;
  return (
    <div className={cx('nui-sync', className)}>
      <div className="nui-sync__row">
        <span className="nui-sync__label">{done ? m.synced : label}</span>
        <span>{done ? `#${tip.toLocaleString(locale)}` : `${pct.toFixed(1)}%${eta ? ` · ${eta}` : ''}`}</span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="nui-progress" style={{ '--nui-value': pct } as CSSProperties}>
        <div className="nui-progress__bar" />
      </div>
      {!done && <div className="nui-sync__row"><span>#{height.toLocaleString(locale)}</span><span>#{tip.toLocaleString(locale)}</span></div>}
    </div>
  );
}

/* ------------------------------------------------------------ Memo */

export interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Recipient address. When it's transparent, the memo is disabled (Zcash cannot attach memos to t-addresses). */
  recipient?: string;
  maxBytes?: number;
  placeholder?: string;
  id?: string;
  className?: string;
}
export function MemoInput({ value, onChange, recipient, maxBytes = MEMO_MAX_BYTES, placeholder, className, ...rest }: MemoInputProps) {
  const { m } = useNuiLocale();
  const fieldProps = useFieldProps<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: unknown }>({ id: rest.id });
  const bytes = memoByteLength(value);
  const over = bytes > maxBytes;
  const info = recipient ? parseAddress(recipient) : null;
  const disabled = Boolean(info && !info.shielded);
  return (
    <div className={cx('nui-memo', className)}>
      <textarea
        className="nui-textarea"
        {...fieldProps}
        aria-invalid={over || (fieldProps['aria-invalid'] as boolean | undefined) || undefined}
        value={disabled ? '' : value}
        disabled={disabled}
        placeholder={disabled ? m.memoTransparent : (placeholder ?? m.memoPlaceholder)}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="nui-memo__count" data-over={over} aria-live="polite">{bytes}/{maxBytes} {m.bytes}</span>
    </div>
  );
}

/* ------------------------------------------------------------ QR */

export interface ReceiveQRProps {
  /** Address or ZIP-321 URI (see buildPaymentUri). */
  value: string;
  size?: number;
  caption?: ReactNode;
  /** Accessible description. Default "QR code for <value>". */
  label?: string;
  className?: string;
}
export function ReceiveQR({ value, size = 200, caption, label, className }: ReceiveQRProps) {
  const { m } = useNuiLocale();
  const { path, count } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value, 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { path: d, count: n };
  }, [value]);
  return (
    <figure className={cx('nui-qr', className)} style={{ margin: 0, '--nui-qr-size': `${size}px` } as CSSProperties}>
      <svg viewBox={`0 0 ${count} ${count}`} role="img" aria-label={label ?? `${m.qrFor} ${value}`} shapeRendering="crispEdges">
        <path d={path} fill="#271219" />
      </svg>
      {caption && <figcaption className="nui-qr__caption">{caption}</figcaption>}
    </figure>
  );
}
