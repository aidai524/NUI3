import { useEffect, useId, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { useNuiLocale } from './i18n.js';
import { DataTable, type Column } from './surfaces.js';
import { Badge } from './surfaces.js';

/* ------------------------------------------------------------ OrderBook */

export type BookLevel = [price: number, size: number];

export interface OrderBookProps {
  /** Best first: highest bid first. */
  bids: BookLevel[];
  /** Best first: lowest ask first. */
  asks: BookLevel[];
  /** Rows per side. Default 8. */
  rows?: number;
  priceDecimals?: number;
  sizeDecimals?: number;
  /** Last trade price, shown between the sides. */
  last?: number;
  lastDirection?: 'up' | 'down';
  baseSymbol?: string;
  quoteSymbol?: string;
  /** Click a level to prefill an order form. */
  onSelectPrice?: (price: number) => void;
  className?: string;
}
export function OrderBook({ bids, asks, rows = 8, priceDecimals = 2, sizeDecimals = 3, last, lastDirection, baseSymbol, quoteSymbol, onSelectPrice, className }: OrderBookProps) {
  const { m, locale } = useNuiLocale();
  const fmt = (v: number, d: number) => v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });
  const cum = (side: BookLevel[]) => {
    let t = 0;
    return side.slice(0, rows).map(([p, s]) => ({ p, s, t: (t += s) }));
  };
  const b = cum(bids), a = cum(asks);
  const maxT = Math.max(b[b.length - 1]?.t ?? 0, a[a.length - 1]?.t ?? 0) || 1;
  const spread = asks[0] && bids[0] ? asks[0][0] - bids[0][0] : undefined;
  const row = (lv: { p: number; s: number; t: number }, side: 'bid' | 'ask') => (
    <button
      key={`${side}${lv.p}`}
      type="button"
      className={`nui-book__row nui-book__row--${side}`}
      style={{ '--_depth': `${(lv.t / maxT) * 100}%` } as CSSProperties}
      onClick={onSelectPrice ? () => onSelectPrice(lv.p) : undefined}
      tabIndex={onSelectPrice ? 0 : -1}
      aria-label={`${side === 'bid' ? m.bids : m.asks} ${fmt(lv.p, priceDecimals)}, ${m.size} ${fmt(lv.s, sizeDecimals)}`}
    >
      <span className="nui-book__price">{fmt(lv.p, priceDecimals)}</span>
      <span>{fmt(lv.s, sizeDecimals)}</span>
      <span>{fmt(lv.t, sizeDecimals)}</span>
    </button>
  );
  return (
    <div className={cx('nui-book', className)}>
      <div className="nui-book__head">
        <span>{m.price}{quoteSymbol ? ` (${quoteSymbol})` : ''}</span>
        <span>{m.size}{baseSymbol ? ` (${baseSymbol})` : ''}</span>
        <span>{m.total}</span>
      </div>
      <div className="nui-book__side nui-book__side--asks">{[...a].reverse().map((lv) => row(lv, 'ask'))}</div>
      <div className="nui-book__mid">
        {last !== undefined && <strong className={cx(lastDirection && `nui-book__last--${lastDirection}`)}>{fmt(last, priceDecimals)}</strong>}
        {spread !== undefined && <span>{m.spread} {fmt(spread, priceDecimals)}</span>}
      </div>
      <div className="nui-book__side">{b.map((lv) => row(lv, 'bid'))}</div>
    </div>
  );
}

/* ------------------------------------------------------------ Slider */

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Tick marks with labels under the track. */
  marks?: number[];
  format?: (v: number) => string;
  label: string;
  tone?: 'accent' | 'warning' | 'negative';
}
export function Slider({ value, onChange, min = 0, max = 100, step = 1, marks = [], format = String, label, tone = 'accent', className, ...rest }: SliderProps) {
  const pct = ((value - min) / (max - min || 1)) * 100;
  return (
    <div className={cx('nui-slider', tone !== 'accent' && `nui-slider--${tone}`, className)} style={{ '--_pct': `${pct}%` } as CSSProperties}>
      <input
        type="range"
        className="nui-slider__input"
        aria-label={label}
        aria-valuetext={format(value)}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
      {marks.length > 0 && (
        <div className="nui-slider__marks" aria-hidden="true">
          {marks.map((mk) => (
            <button key={mk} type="button" tabIndex={-1} className="nui-slider__mark" data-active={value >= mk} style={{ left: `${((mk - min) / (max - min || 1)) * 100}%` }} onClick={() => onChange(mk)}>
              {format(mk)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface LeverageSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  /** Turns warning above this leverage. Default 10. */
  warnAbove?: number;
  label?: string;
  className?: string;
}
export function LeverageSlider({ value, onChange, max = 50, warnAbove = 10, label, className }: LeverageSliderProps) {
  const { m } = useNuiLocale();
  // Evenly spaced ticks: 1×, then 5 steps up to max.
  const marks = Array.from(new Set([1, ...Array.from({ length: 5 }, (_, k) => Math.round(((k + 1) * max) / 5))]));
  const tone = value >= max * 0.8 ? 'negative' : value > warnAbove ? 'warning' : 'accent';
  return (
    <div className={cx('nui-leverage', className)}>
      <div className="nui-leverage__head">
        <span className="nui-field__label">{label ?? m.leverage}</span>
        <span className={cx('nui-leverage__value', tone !== 'accent' && `nui-leverage__value--${tone}`)}>{value}×</span>
      </div>
      <Slider label={label ?? m.leverage} value={value} onChange={onChange} min={1} max={max} step={1} marks={marks} format={(v) => `${v}×`} tone={tone} />
    </div>
  );
}

/* ------------------------------------------------------------ PnL */

export interface PnLProps {
  /** Absolute value in quote currency. */
  value: number;
  /** Percent, e.g. 4.2 = +4.2%. */
  percent?: number;
  currency?: string;
  className?: string;
}
export function PnL({ value, percent, currency = 'USD', className }: PnLProps) {
  const { locale } = useNuiLocale();
  const tone = value > 0 ? 'positive' : value < 0 ? 'negative' : undefined;
  const abs = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(Math.abs(value));
  return (
    <span className={cx('nui-pnl', tone && `nui-pnl--${tone}`, className)}>
      {value > 0 ? '+' : value < 0 ? '−' : ''}{abs}
      {percent !== undefined && <small>({percent > 0 ? '+' : ''}{percent.toFixed(2)}%)</small>}
    </span>
  );
}

/* ------------------------------------------------------------ PositionTable */

export interface Position {
  id: string;
  market: string;
  side: 'long' | 'short';
  /** Base units, display string. */
  size: string;
  entry: number;
  mark: number;
  liq: number;
  leverage: number;
  pnl: number;
  pnlPercent?: number;
  margin?: string;
}
export interface PositionTableProps {
  positions: Position[];
  onClose?: (p: Position) => void;
  priceDecimals?: number;
  empty?: ReactNode;
  className?: string;
}
export function PositionTable({ positions, onClose, priceDecimals = 2, empty, className }: PositionTableProps) {
  const { m, locale } = useNuiLocale();
  const px = (v: number) => v.toLocaleString(locale, { minimumFractionDigits: priceDecimals, maximumFractionDigits: priceDecimals });
  const columns: Column<Position>[] = [
    { key: 'market', header: m.market, cell: (p) => <strong>{p.market}</strong> },
    { key: 'side', header: m.side, cell: (p) => <Badge tone={p.side === 'long' ? 'positive' : 'negative'} solid>{p.side === 'long' ? m.long : m.short} {p.leverage}×</Badge> },
    { key: 'size', header: m.size, numeric: true, cell: (p) => p.size },
    { key: 'entry', header: m.entry, numeric: true, cell: (p) => px(p.entry) },
    { key: 'mark', header: m.mark, numeric: true, cell: (p) => px(p.mark) },
    { key: 'liq', header: m.liqPrice, numeric: true, cell: (p) => <span style={{ color: 'var(--nui-warning)' }}>{px(p.liq)}</span> },
    { key: 'pnl', header: m.pnl, numeric: true, cell: (p) => <PnL value={p.pnl} percent={p.pnlPercent} />, sortValue: (p) => p.pnl },
  ];
  if (onClose) columns.push({ key: 'close', header: '', numeric: true, cell: (p) => <button type="button" className="nui-btn nui-btn--subtle nui-btn--sm" onClick={() => onClose(p)}>{m.closePosition}</button> });
  return <DataTable className={className} columns={columns} rows={positions} rowKey={(p) => p.id} empty={empty} />;
}

/* ------------------------------------------------------------ LiveValue */

export interface LiveValueProps {
  value: number;
  format?: (v: number) => string;
  /** Color the text by the last move, not only flash. */
  colored?: boolean;
  className?: string;
}
/** Number that flashes green/red when it changes (tickers, mark price, odds). */
export function LiveValue({ value, format = String, colored, className }: LiveValueProps) {
  const prev = useRef(value);
  const [dir, setDir] = useState<'up' | 'down' | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (value === prev.current) return;
    setDir(value > prev.current ? 'up' : 'down');
    setTick((t) => t + 1);
    prev.current = value;
  }, [value]);
  return (
    <span key={tick} className={cx('nui-live', dir && tick > 0 && `nui-live--${dir}`, colored && dir && `nui-live--colored-${dir}`, className)}>
      {format(value)}
    </span>
  );
}

/* ------------------------------------------------------------ Countdown */

export interface CountdownProps {
  /** Target time (ms epoch or Date). */
  to: number | Date;
  onEnd?: () => void;
  /** Hide seconds above one day. Default true. */
  compact?: boolean;
  className?: string;
}
export function Countdown({ to, onEnd, compact = true, className }: CountdownProps) {
  const { m } = useNuiLocale();
  const target = typeof to === 'number' ? to : to.getTime();
  const [now, setNow] = useState(() => Date.now());
  const ended = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, target - now);
  useEffect(() => {
    if (left === 0 && !ended.current) {
      ended.current = true;
      onEnd?.();
    }
  }, [left, onEnd]);
  if (left === 0) return <span className={cx('nui-countdown', className)}>{m.ended}</span>;
  const s = Math.floor(left / 1000);
  const parts: Array<[number, string]> = [[Math.floor(s / 86400), m.days], [Math.floor((s % 86400) / 3600), m.hours], [Math.floor((s % 3600) / 60), m.minutes], [s % 60, m.seconds]];
  const shown = parts.filter(([, u], k) => !(compact && parts[0]![0] > 0 && k === 3) && !(u === m.days && parts[0]![0] === 0));
  return (
    <time className={cx('nui-countdown', className)} dateTime={new Date(target).toISOString()} aria-live="off">
      {shown.map(([v, u], k) => (
        <span key={k}><b>{String(v).padStart(k === 0 ? 1 : 2, '0')}</b>{u}</span>
      ))}
    </time>
  );
}

/* ------------------------------------------------------------ Meter */

export interface MeterProps {
  value: number;
  max: number;
  label: ReactNode;
  /** Right side of the header, e.g. "62,000 / 100,000 USDC". */
  valueLabel?: ReactNode;
  /** Tick marks on the track (soft cap, quota warning). */
  marks?: Array<{ value: number; label: string }>;
  tone?: 'accent' | 'positive' | 'warning' | 'negative';
  className?: string;
}
/** Quota, raise progress, utilization. */
export function Meter({ value, max, label, valueLabel, marks = [], tone = 'accent', className }: MeterProps) {
  const id = useId();
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  return (
    <div className={cx('nui-meter', tone !== 'accent' && `nui-meter--${tone}`, className)}>
      <div className="nui-meter__head">
        <span id={id} className="nui-meter__label">{label}</span>
        <span className="nui-meter__value">{valueLabel ?? `${pct.toFixed(0)}%`}</span>
      </div>
      <div className="nui-meter__track" role="meter" aria-labelledby={id} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} style={{ '--_pct': `${pct}%` } as CSSProperties}>
        <span className="nui-meter__fill" />
        {marks.map((mk) => <span key={mk.label} className="nui-meter__mark" style={{ left: `${(mk.value / (max || 1)) * 100}%` }} title={mk.label} />)}
      </div>
      {marks.length > 0 && (
        <div className="nui-meter__marks">
          {marks.map((mk) => <span key={mk.label} style={{ left: `${(mk.value / (max || 1)) * 100}%` }}>{mk.label}</span>)}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ UptimeBar */

export interface UptimeDay {
  date: string;
  status: 'operational' | 'degraded' | 'outage' | 'none';
  note?: string;
}
export function UptimeBar({ days, label, className }: { days: UptimeDay[]; label: string; className?: string }) {
  const { m } = useNuiLocale();
  const text = { operational: m.operational, degraded: m.degraded, outage: m.outage, none: m.noData };
  const counted = days.filter((d) => d.status !== 'none');
  const ok = counted.filter((d) => d.status === 'operational').length + counted.filter((d) => d.status === 'degraded').length * 0.5;
  const uptime = counted.length ? (ok / counted.length) * 100 : 100;
  return (
    <div className={cx('nui-uptime', className)}>
      <div className="nui-uptime__head">
        <span>{label}</span>
        <strong>{uptime.toFixed(2)}%</strong>
      </div>
      <div className="nui-uptime__bar" role="img" aria-label={`${label}: ${uptime.toFixed(2)}%`}>
        {days.map((d) => <span key={d.date} className="nui-uptime__day" data-status={d.status} title={`${d.date} · ${text[d.status]}${d.note ? ` · ${d.note}` : ''}`} />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Prediction */

export interface OutcomeButtonProps {
  label: ReactNode;
  /** 0–1 */
  probability: number;
  selected?: boolean;
  onClick?: () => void;
  tone?: 'positive' | 'negative' | 'neutral';
  className?: string;
}
/** Outcome with implied price in cents (Polymarket-style). */
export function OutcomeButton({ label, probability, selected, onClick, tone = 'neutral', className }: OutcomeButtonProps) {
  const pct = Math.round(probability * 100);
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cx('nui-outcome', tone !== 'neutral' && `nui-outcome--${tone}`, className)} style={{ '--_pct': `${pct}%` } as CSSProperties}>
      <span className="nui-outcome__label">{label}</span>
      <span className="nui-outcome__price">{(probability * 100).toFixed(1)}¢</span>
    </button>
  );
}

export function ProbabilityBar({ outcomes, label, className }: { outcomes: Array<{ label: string; probability: number; color?: string }>; label: string; className?: string }) {
  const total = outcomes.reduce((s, o) => s + o.probability, 0) || 1;
  return (
    <div className={cx('nui-probbar', className)}>
      <div className="nui-probbar__track" role="img" aria-label={`${label}: ${outcomes.map((o) => `${o.label} ${Math.round((o.probability / total) * 100)}%`).join(', ')}`}>
        {outcomes.map((o, k) => <span key={o.label} style={{ width: `${(o.probability / total) * 100}%`, background: o.color ?? `var(--nui-chart-${(k % 5) + 1})` }} />)}
      </div>
      <div className="nui-probbar__legend">
        {outcomes.map((o, k) => (
          <span key={o.label}><i style={{ background: o.color ?? `var(--nui-chart-${(k % 5) + 1})` }} />{o.label} <b>{Math.round((o.probability / total) * 100)}%</b></span>
        ))}
      </div>
    </div>
  );
}
