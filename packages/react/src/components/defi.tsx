import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { formatAmount, formatUnits, sanitizeAmountInput, type Numeric } from '../utils/units.js';
import { useFieldProps } from './forms.js';
import { Dialog } from './overlays.js';
import { SearchIcon, SwapIcon } from './icons.js';
import { TokenIcon } from './zcash.js';
import { useNuiLocale } from './i18n.js';

export interface TokenInfo {
  symbol: string;
  name?: string;
  decimals: number;
  icon?: string;
  /** Chain / network label for bridge pickers. */
  chain?: string;
  /** Balance in base units. */
  balance?: Numeric;
  /** Any id you route by (address, asset id). Defaults to symbol. */
  id?: string;
}

/* ------------------------------------------------------------ TokenAmountInput */

export interface TokenAmountInputProps {
  /** Decimal string as typed, e.g. "1.25". Convert with parseUnits(value, token.decimals). */
  value: string;
  onChange?: (value: string) => void;
  token?: TokenInfo | null;
  /** Open your TokenPicker. Omit for a fixed token. */
  onTokenClick?: () => void;
  /** Top-left label: "You pay", "From Zcash", "Collateral". */
  label?: ReactNode;
  /** Top-right slot, e.g. <ChainBadge> or <PrivacyBadge>. */
  aside?: ReactNode;
  /** Fiat estimate shown bottom-left. */
  fiat?: ReactNode;
  /** Shows balance + MAX. Called with the full balance as a decimal string. */
  onMax?: (value: string) => void;
  readOnly?: boolean;
  invalid?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
}
/** Amount + token selector + balance. The building block for Swap, Bridge, Lend, Perps margin. */
export function TokenAmountInput({ value, onChange, token, onTokenClick, label, aside, fiat, onMax, readOnly, invalid, id, placeholder = '0', className }: TokenAmountInputProps) {
  const fieldProps = useFieldProps<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: unknown }>({ id });
  const { m, locale } = useNuiLocale();
  const decimals = token?.decimals ?? 18;
  const balanceText = token?.balance !== undefined ? formatAmount(token.balance, { decimals, maxFractionDigits: 6, locale }) : null;
  const isInvalid = invalid || Boolean(fieldProps['aria-invalid']);
  return (
    <div className={cx('nui-token-input', className)} data-invalid={isInvalid || undefined}>
      {(label || aside) && (
        <div className="nui-token-input__top">
          {label && <span className="nui-token-input__label">{label}</span>}
          {aside}
        </div>
      )}
      <div className="nui-token-input__main">
        <input
          className="nui-token-input__amount"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-label={typeof label === 'string' ? `${label} ${m.amount.toLowerCase()}` : m.amount}
          {...fieldProps}
          aria-invalid={isInvalid || undefined}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(sanitizeAmountInput(e.target.value, decimals))}
        />
        {onTokenClick ? (
          <button type="button" className={cx('nui-token-select', !token && 'nui-token-select--empty')} onClick={onTokenClick} aria-haspopup="dialog">
            {token ? (
              <>
                <TokenIcon symbol={token.symbol} src={token.icon} />
                {token.symbol}
              </>
            ) : (
              m.selectToken
            )}
          </button>
        ) : (
          token && (
            <span className="nui-token">
              <TokenIcon symbol={token.symbol} src={token.icon} />
              <span className="nui-token__symbol">{token.symbol}</span>
            </span>
          )
        )}
      </div>
      {(fiat || balanceText !== null) && (
        <div className="nui-token-input__bottom">
          <span>{fiat}</span>
          {balanceText !== null && (
            <span className="nui-token-input__balance">
              {m.balance} {balanceText}
              {onMax && !readOnly && token?.balance !== undefined && (
                <button type="button" className="nui-token-input__max" onClick={() => onMax(formatUnits(token.balance!, decimals))}>
                  {m.max}
                </button>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Flip button between two TokenAmountInputs. */
export function SwapSwitch({ onClick, label: labelProp }: { onClick: () => void; label?: string }) {
  const { m } = useNuiLocale();
  const label = labelProp ?? m.switchTokens;
  return (
    <button type="button" className="nui-swap-switch" aria-label={label} title={label} onClick={onClick}>
      <SwapIcon />
    </button>
  );
}

/* ------------------------------------------------------------ TokenPicker */

export interface TokenPickerProps {
  open: boolean;
  onClose: () => void;
  tokens: TokenInfo[];
  onSelect: (token: TokenInfo) => void;
  selected?: TokenInfo | null;
  /** Tokens that cannot be picked (e.g. the other side of the pair). */
  disabled?: TokenInfo[];
  title?: ReactNode;
  /** Quick-pick row. */
  popular?: TokenInfo[];
}
const tokenKey = (t: TokenInfo) => t.id ?? `${t.chain ?? ''}:${t.symbol}`;

export function TokenPicker({ open, onClose, tokens, onSelect, selected, disabled = [], title, popular = [] }: TokenPickerProps) {
  const { m, locale } = useNuiLocale();
  const [query, setQuery] = useState('');
  const disabledKeys = useMemo(() => new Set(disabled.map(tokenKey)), [disabled]);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => [t.symbol, t.name, t.chain, t.id].some((f) => f?.toLowerCase().includes(q)));
  }, [tokens, query]);

  const pick = (t: TokenInfo) => {
    if (disabledKeys.has(tokenKey(t))) return;
    onSelect(t);
    setQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={title ?? m.selectToken} width={440}>
      <div className="nui-input-group" style={{ marginBottom: 14 }}>
        <span className="nui-input-group__addon"><SearchIcon /></span>
        <input className="nui-input" autoFocus placeholder={m.searchTokensPlaceholder} aria-label={m.searchTokens} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {popular.length > 0 && !query && (
        <div className="nui-cluster" style={{ marginBottom: 14, gap: 8 }}>
          {popular.map((t) => (
            <button key={tokenKey(t)} type="button" className="nui-token-select" style={{ minHeight: 34 }} disabled={disabledKeys.has(tokenKey(t))} onClick={() => pick(t)}>
              <TokenIcon symbol={t.symbol} src={t.icon} size="sm" />
              {t.symbol}
            </button>
          ))}
        </div>
      )}
      <ul className="nui-token-list" role="listbox" aria-label={m.tokens} style={{ margin: '0 -12px', maxHeight: 360, overflowY: 'auto' }}>
        {list.length === 0 && <li style={{ padding: '24px 12px', color: 'var(--nui-text-muted)', fontSize: 14 }}>{m.noTokensMatch} “{query}”.</li>}
        {list.map((t) => {
          const key = tokenKey(t);
          const isDisabled = disabledKeys.has(key);
          return (
            <li key={key}>
              <button
                type="button"
                role="option"
                className="nui-token-list__item"
                aria-selected={selected ? tokenKey(selected) === key : false}
                aria-disabled={isDisabled || undefined}
                onClick={() => pick(t)}
              >
                <TokenIcon symbol={t.symbol} src={t.icon} size="lg" />
                <span>
                  <span className="nui-token__symbol" style={{ display: 'block', fontWeight: 600 }}>{t.symbol}</span>
                  <span className="nui-token__name">{[t.name, t.chain].filter(Boolean).join(' · ')}</span>
                </span>
                {t.balance !== undefined && <span className="nui-token-list__meta">{formatAmount(t.balance, { decimals: t.decimals, maxFractionDigits: 6, locale })}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

/* ------------------------------------------------------------ HealthFactor */

export interface HealthFactorProps {
  /** Health factor (collateral-adjusted / debt). Infinity = no debt. */
  value: number;
  /** At or below = liquidation. Default 1. */
  liquidation?: number;
  /** Below = warning zone. Default 1.5. */
  warning?: number;
  /** Upper end of the scale. Default 3. */
  max?: number;
  label?: string;
  className?: string;
}
/** Lending health / perps margin meter with liquidation and warning zones. */
export function HealthFactor({ value, liquidation = 1, warning = 1.5, max = 3, label: labelProp, className }: HealthFactorProps) {
  const { m } = useNuiLocale();
  const label = labelProp ?? m.healthFactor;
  const finite = Number.isFinite(value);
  const zone = !finite || value >= warning ? 'safe' : value > liquidation ? 'warning' : 'danger';
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  const position = finite ? Math.min(100, Math.max(0, (value / max) * 100)) : 100;
  const display = finite ? value.toFixed(2) : '∞';
  const zoneText = { safe: m.zoneSafe, warning: m.zoneWarning, danger: m.zoneDanger }[zone];
  return (
    <div className={cx('nui-health', className)} data-zone={zone}>
      <div className="nui-health__row">
        <span className="nui-health__label">{label}</span>
        <span className="nui-health__value">{display}</span>
      </div>
      <div
        className="nui-health__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={finite ? value : max}
        aria-valuetext={`${display}, ${zoneText}`}
        style={{ '--nui-health-danger': pct(liquidation), '--nui-health-warn': pct(warning) } as CSSProperties}
      >
        <span className="nui-health__marker" style={{ '--nui-value': position } as CSSProperties} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ DetailList */

/** Compact label/value rows under a form: rate, fee, slippage, route, ETA. */
export function DetailList({ items, className }: { items: Array<{ label: ReactNode; value: ReactNode }>; className?: string }) {
  return (
    <dl className={cx('nui-detail-list', className)}>
      {items.map((it, i) => (
        <div key={i}>
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
