import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { useNuiLocale } from './i18n.js';

// Dependency-free SVG charts. Colors come from --nui-chart-1..5, so every theme restyles them.

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const seriesColor = (i: number, color?: string) => color ?? `var(--nui-chart-${(i % 5) + 1})`;

/** Measure container width; falls back when ResizeObserver is unavailable (SSR, tests). */
function useWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || fallback);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}

/** Round tick values covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const d = Math.abs(min) * 0.1 || 1;
    min -= d;
    max += d;
  }
  const raw = (max - min) / Math.max(count, 1);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
  const ticks: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

const defaultFormat = (v: number) => (Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(Number(v.toPrecision(4))));

/** Build an SVG path, breaking the line on NaN gaps. */
function linePath(points: Array<[number, number]>, step = false) {
  let d = '';
  let pen = false;
  for (const [x, y] of points) {
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    if (!pen) d += `M${x},${y}`;
    else d += step ? `H${x}V${y}` : `L${x},${y}`;
    pen = true;
  }
  return d;
}

function useHoverIndex(count: number) {
  const [index, setIndex] = useState<number | null>(null);
  const onKeyDown = (e: KeyboardEvent) => {
    if (!count) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setIndex((i) => Math.min(count - 1, Math.max(0, (i ?? count - 1) + (e.key === 'ArrowRight' ? 1 : -1))));
    }
    if (e.key === 'Home') setIndex(0);
    if (e.key === 'End') setIndex(count - 1);
    if (e.key === 'Escape') setIndex(null);
  };
  return { index, setIndex, onKeyDown };
}

function Empty({ height, className }: { height: number; className?: string }) {
  const { m } = useNuiLocale();
  return <div className={cx('nui-chart__empty', className)} style={{ height }}>{m.chartEmpty}</div>;
}

function Tip({ x, width, children }: { x: number; width: number; children: ReactNode }) {
  // Keep the tooltip inside the chart box.
  const left = Math.min(Math.max(x, 70), Math.max(width - 70, 70));
  return <div className="nui-chart__tip" style={{ left }}>{children}</div>;
}

/* ------------------------------------------------------------ LineChart */

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
  /** Fill below the line with a fade. */
  area?: boolean;
  dashed?: boolean;
}

export interface LineChartProps {
  series: ChartSeries[];
  /** X label per index (dates, block heights, supply). */
  labels?: string[];
  /** Accessible summary of what the chart shows. */
  label: string;
  height?: number;
  yFormat?: (v: number) => string;
  yTicks?: number;
  xTicks?: number;
  yMin?: number;
  yMax?: number;
  curve?: 'linear' | 'step';
  /** Horizontal reference lines (price targets, liquidation, 50%). */
  referenceY?: Array<{ value: number; label?: string }>;
  /** Vertical reference lines (listing date, "now"). */
  referenceX?: Array<{ index: number; label?: string }>;
  /** Dots on a series point. */
  markers?: Array<{ index: number; series?: number; label?: string }>;
  legend?: boolean;
  className?: string;
}

export function LineChart({
  series, labels, label, height = 240, yFormat = defaultFormat, yTicks = 4, xTicks = 5, yMin, yMax, curve = 'linear',
  referenceY = [], referenceX = [], markers = [], legend, className,
}: LineChartProps) {
  const gid = useId().replace(/:/g, '');
  const [ref, width] = useWidth();
  const n = Math.max(0, ...series.map((s) => s.data.length));
  const hover = useHoverIndex(n);

  const geo = useMemo(() => {
    const values = series.flatMap((s) => s.data).concat(referenceY.map((r) => r.value)).filter(Number.isFinite);
    const lo = yMin ?? Math.min(...values);
    const hi = yMax ?? Math.max(...values);
    const pad = yMin === undefined && yMax === undefined ? (hi - lo) * 0.06 : 0;
    const ticks = niceTicks(lo - pad, hi + pad, yTicks).filter((t) => (yMin === undefined || t >= yMin) && (yMax === undefined || t <= yMax));
    const y0 = yMin ?? ticks[0] ?? lo;
    const y1 = yMax ?? ticks[ticks.length - 1] ?? hi;
    const left = Math.max(...ticks.map((t) => yFormat(t).length)) * 6.6 + 10;
    const pt = 12, pr = 12, pb = 24;
    const iw = Math.max(width - left - pr, 10);
    const ih = height - pt - pb;
    const x = (i: number) => left + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v: number) => pt + (1 - (v - y0) / (y1 - y0 || 1)) * ih;
    return { ticks, x, y, left, pt, pb, iw, ih, bottom: pt + ih };
  }, [series, referenceY, yMin, yMax, yTicks, yFormat, width, height, n]);

  if (n === 0) return <Empty height={height} className={className} />;

  const xLabelIdx = labels ? Array.from(new Set(Array.from({ length: Math.min(xTicks, n) }, (_, k) => Math.round((k * (n - 1)) / Math.max(Math.min(xTicks, n) - 1, 1))))) : [];

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    hover.setIndex(Math.min(n - 1, Math.max(0, Math.round(((px - geo.left) / geo.iw) * (n - 1)))));
  };

  const i = hover.index;
  return (
    <div ref={ref} className={cx('nui-chart', className)} tabIndex={0} onKeyDown={hover.onKeyDown} onBlur={() => hover.setIndex(null)}>
      <svg width={width} height={height} role="img" aria-label={label}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`${gid}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColor(si, s.color)} stopOpacity="0.22" />
              <stop offset="100%" stopColor={seriesColor(si, s.color)} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {geo.ticks.map((t) => (
          <g key={t}>
            <line className="nui-chart__grid" x1={geo.left} x2={geo.left + geo.iw} y1={geo.y(t)} y2={geo.y(t)} />
            <text className="nui-chart__axis" x={geo.left - 8} y={geo.y(t)} dy="0.32em" textAnchor="end">{yFormat(t)}</text>
          </g>
        ))}
        {xLabelIdx.map((k) => (
          <text key={k} className="nui-chart__axis" x={geo.x(k)} y={height - 6} textAnchor={k === 0 ? 'start' : k === n - 1 ? 'end' : 'middle'}>{labels![k]}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((v, k) => [geo.x(k), geo.y(v)] as [number, number]);
          const d = linePath(pts, curve === 'step');
          const first = pts.findIndex(([, v]) => Number.isFinite(v));
          return (
            <g key={si}>
              {s.area && first !== -1 && <path d={`${d}V${geo.bottom}H${pts[first]![0]}Z`} fill={`url(#${gid}-${si})`} stroke="none" />}
              <path d={d} fill="none" stroke={seriesColor(si, s.color)} strokeWidth={1.75} strokeDasharray={s.dashed ? '4 4' : undefined} strokeLinejoin="round" />
            </g>
          );
        })}
        {referenceY.map((r, k) => (
          <g key={`ry${k}`}>
            <line className="nui-chart__ref" x1={geo.left} x2={geo.left + geo.iw} y1={geo.y(r.value)} y2={geo.y(r.value)} />
            {r.label && <text className="nui-chart__ref-label" x={geo.left + geo.iw - 4} y={geo.y(r.value) - 5} textAnchor="end">{r.label}</text>}
          </g>
        ))}
        {referenceX.map((r, k) => (
          <g key={`rx${k}`}>
            <line className="nui-chart__ref" x1={geo.x(r.index)} x2={geo.x(r.index)} y1={geo.pt} y2={geo.bottom} />
            {r.label && <text className="nui-chart__ref-label" x={geo.x(r.index) + 5} y={geo.pt + 10}>{r.label}</text>}
          </g>
        ))}
        {markers.map((mk, k) => {
          const v = series[mk.series ?? 0]?.data[mk.index];
          if (v === undefined || !Number.isFinite(v)) return null;
          return (
            <g key={`m${k}`}>
              <circle cx={geo.x(mk.index)} cy={geo.y(v)} r={4.5} fill="var(--nui-surface)" stroke={seriesColor(mk.series ?? 0, series[mk.series ?? 0]?.color)} strokeWidth={2} />
              {mk.label && <text className="nui-chart__ref-label" x={geo.x(mk.index)} y={geo.y(v) - 10} textAnchor="middle">{mk.label}</text>}
            </g>
          );
        })}
        {i !== null && (
          <g>
            <line className="nui-chart__crosshair" x1={geo.x(i)} x2={geo.x(i)} y1={geo.pt} y2={geo.bottom} />
            {series.map((s, si) => Number.isFinite(s.data[i]) && <circle key={si} cx={geo.x(i)} cy={geo.y(s.data[i]!)} r={3.5} fill={seriesColor(si, s.color)} />)}
          </g>
        )}
        <rect x={geo.left} y={geo.pt} width={geo.iw} height={geo.ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => hover.setIndex(null)} />
      </svg>
      {i !== null && (
        <Tip x={geo.x(i)} width={width}>
          {labels?.[i] && <div className="nui-chart__tip-title">{labels[i]}</div>}
          {series.map((s, si) => Number.isFinite(s.data[i]) && (
            <div key={si} className="nui-chart__tip-row">
              <span><span className="nui-chart__swatch" style={{ '--_c': seriesColor(si, s.color) } as CSSProperties} />{s.name}</span>
              <strong>{yFormat(s.data[i]!)}</strong>
            </div>
          ))}
        </Tip>
      )}
      {legend && <Legend items={series.map((s, si) => ({ label: s.name, color: seriesColor(si, s.color) }))} />}
    </div>
  );
}

export function Legend({ items, className }: { items: Array<{ label: ReactNode; color: string; value?: ReactNode }>; className?: string }) {
  return (
    <ul className={cx('nui-chart__legend', className)}>
      {items.map((it, k) => (
        <li key={k}>
          <span className="nui-chart__swatch" style={{ '--_c': it.color } as CSSProperties} />
          {it.label}
          {it.value !== undefined && <strong style={{ marginLeft: 6 }}>{it.value}</strong>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ PriceChart */

export interface PricePoint {
  /** Time label shown on the x-axis and in the tooltip. */
  t: string;
  value: number;
}
export interface PriceChartProps extends Omit<LineChartProps, 'series' | 'labels' | 'yFormat'> {
  data: PricePoint[];
  /** Series name in the tooltip. Defaults to the accessible chart label. */
  name?: string;
  priceFormat?: (v: number) => string;
  area?: boolean;
  color?: string;
}
/** Time-series adapter for apps that already have { t, value } price points. Use CandleChart for OHLCV data. */
export function PriceChart({ data, label, name, priceFormat = defaultFormat, area = true, color, ...rest }: PriceChartProps) {
  return (
    <LineChart
      {...rest}
      label={label}
      labels={data.map((p) => p.t)}
      yFormat={priceFormat}
      series={[{ name: name ?? label, data: data.map((p) => p.value), area, color }]}
    />
  );
}

/* ------------------------------------------------------------ Sparkline */

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** auto = positive if last >= first. */
  tone?: 'auto' | 'neutral' | 'positive' | 'negative';
  area?: boolean;
  label?: string;
  className?: string;
}
export function Sparkline({ data, width = 96, height = 28, tone = 'auto', area = true, label, className }: SparklineProps) {
  const gid = useId().replace(/:/g, '');
  if (data.length < 2) return <svg width={width} height={height} className={className} aria-hidden="true" />;
  const lo = Math.min(...data), hi = Math.max(...data);
  const x = (i: number) => (i / (data.length - 1)) * (width - 2) + 1;
  const y = (v: number) => 2 + (1 - (v - lo) / (hi - lo || 1)) * (height - 4);
  const t = tone === 'auto' ? (data[data.length - 1]! >= data[0]! ? 'positive' : 'negative') : tone;
  const color = t === 'neutral' ? 'var(--nui-chart-1)' : `var(--nui-${t})`;
  const d = linePath(data.map((v, i) => [x(i), y(v)]));
  return (
    <svg width={width} height={height} className={cx('nui-sparkline', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={`${d}V${height}H${x(0)}Z`} fill={`url(#${gid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------ CandleChart */

export interface Candle {
  /** Time label. */
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}
export interface CandleChartProps {
  candles: Candle[];
  label: string;
  height?: number;
  yFormat?: (v: number) => string;
  volume?: boolean;
  /** Dashed line at the live price. */
  lastPrice?: number;
  className?: string;
}
export function CandleChart({ candles, label, height = 320, yFormat = defaultFormat, volume = true, lastPrice, className }: CandleChartProps) {
  const [ref, width] = useWidth();
  const n = candles.length;
  const hover = useHoverIndex(n);
  const { m } = useNuiLocale();
  if (n === 0) return <Empty height={height} className={className} />;

  const lo = Math.min(...candles.map((c) => c.l)), hi = Math.max(...candles.map((c) => c.h));
  const ticks = niceTicks(lo, hi, 5).filter((t) => t >= lo - (hi - lo) * 0.2 && t <= hi + (hi - lo) * 0.2);
  const y0 = Math.min(lo, ticks[0] ?? lo), y1 = Math.max(hi, ticks[ticks.length - 1] ?? hi);
  const left = 8, right = Math.max(...ticks.map((t) => yFormat(t).length)) * 6.6 + 14;
  const pt = 10, pb = 24;
  const volH = volume ? Math.round(height * 0.16) : 0;
  const iw = Math.max(width - left - right, 10);
  const ih = height - pt - pb - volH - (volume ? 8 : 0);
  const slot = iw / n;
  const bw = Math.max(1, Math.min(14, slot * 0.62));
  const x = (i: number) => left + slot * (i + 0.5);
  const y = (v: number) => pt + (1 - (v - y0) / (y1 - y0 || 1)) * ih;
  const vmax = Math.max(1, ...candles.map((c) => c.v ?? 0));
  const vTop = pt + ih + 8;
  const i = hover.index;
  const c = i !== null ? candles[i] : candles[n - 1];
  const xIdx = Array.from(new Set(Array.from({ length: 6 }, (_, k) => Math.round((k * (n - 1)) / 5))));

  return (
    <div ref={ref} className={cx('nui-chart', className)} tabIndex={0} onKeyDown={hover.onKeyDown} onBlur={() => hover.setIndex(null)}>
      {c && (
        <div className="nui-chart__ohlc" aria-live="off">
          <span>O <b>{yFormat(c.o)}</b></span><span>H <b>{yFormat(c.h)}</b></span><span>L <b>{yFormat(c.l)}</b></span>
          <span>C <b className={c.c >= c.o ? 'nui-chart__up' : 'nui-chart__down'}>{yFormat(c.c)}</b></span>
          {c.v !== undefined && <span>V <b>{defaultFormat(c.v)}</b></span>}
        </div>
      )}
      <svg width={width} height={height} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="nui-chart__grid" x1={left} x2={left + iw} y1={y(t)} y2={y(t)} />
            <text className="nui-chart__axis" x={left + iw + 8} y={y(t)} dy="0.32em">{yFormat(t)}</text>
          </g>
        ))}
        {xIdx.map((k) => <text key={k} className="nui-chart__axis" x={x(k)} y={height - 6} textAnchor="middle">{candles[k]!.t}</text>)}
        {candles.map((cd, k) => {
          const up = cd.c >= cd.o;
          const color = up ? 'var(--nui-positive)' : 'var(--nui-negative)';
          const top = y(Math.max(cd.o, cd.c));
          const h = Math.max(1, Math.abs(y(cd.o) - y(cd.c)));
          return (
            <g key={k} opacity={i !== null && i !== k ? 0.55 : 1}>
              <line x1={x(k)} x2={x(k)} y1={y(cd.h)} y2={y(cd.l)} stroke={color} strokeWidth={1} />
              <rect x={x(k) - bw / 2} y={top} width={bw} height={h} fill={color} fillOpacity={0.9} />
              {volume && cd.v !== undefined && <rect x={x(k) - bw / 2} y={vTop + volH - (cd.v / vmax) * volH} width={bw} height={(cd.v / vmax) * volH} fill={color} fillOpacity={0.28} />}
            </g>
          );
        })}
        {lastPrice !== undefined && lastPrice >= y0 && lastPrice <= y1 && (
          <g>
            <line className="nui-chart__ref" x1={left} x2={left + iw} y1={y(lastPrice)} y2={y(lastPrice)} />
            <rect x={left + iw + 2} y={y(lastPrice) - 9} width={right - 4} height={18} fill="var(--nui-accent)" />
            <text x={left + iw + 8} y={y(lastPrice)} dy="0.32em" className="nui-chart__axis nui-chart__axis--on-accent">{yFormat(lastPrice)}</text>
          </g>
        )}
        {i !== null && <line className="nui-chart__crosshair" x1={x(i)} x2={x(i)} y1={pt} y2={height - pb} />}
        <rect
          x={left} y={pt} width={iw} height={height - pt - pb} fill="transparent"
          onPointerMove={(e) => {
            const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
            hover.setIndex(Math.min(n - 1, Math.max(0, Math.floor((e.clientX - rect.left - left) / slot))));
          }}
          onPointerLeave={() => hover.setIndex(null)}
        />
      </svg>
      <span className="nui-sr-only">{m.lastPrice}: {yFormat(candles[n - 1]!.c)}</span>
    </div>
  );
}

/* ------------------------------------------------------------ BarChart */

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}
export interface BarChartProps {
  data: BarDatum[];
  label: string;
  height?: number;
  yFormat?: (v: number) => string;
  /** Color bars by sign (funding rates, PnL). */
  signed?: boolean;
  xTicks?: number;
  className?: string;
}
export function BarChart({ data, label, height = 200, yFormat = defaultFormat, signed, xTicks = 6, className }: BarChartProps) {
  const [ref, width] = useWidth();
  const n = data.length;
  const hover = useHoverIndex(n);
  if (n === 0) return <Empty height={height} className={className} />;
  const lo = Math.min(0, ...data.map((d) => d.value)), hi = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(lo, hi, 4);
  const y0 = ticks[0]!, y1 = ticks[ticks.length - 1]!;
  const left = Math.max(...ticks.map((t) => yFormat(t).length)) * 6.6 + 10;
  const pt = 10, pb = 24, pr = 8;
  const iw = Math.max(width - left - pr, 10), ih = height - pt - pb;
  const slot = iw / n, bw = Math.max(1, slot * 0.68);
  const y = (v: number) => pt + (1 - (v - y0) / (y1 - y0 || 1)) * ih;
  const xIdx = Array.from(new Set(Array.from({ length: Math.min(xTicks, n) }, (_, k) => Math.round((k * (n - 1)) / Math.max(Math.min(xTicks, n) - 1, 1)))));
  const i = hover.index;
  return (
    <div ref={ref} className={cx('nui-chart', className)} tabIndex={0} onKeyDown={hover.onKeyDown} onBlur={() => hover.setIndex(null)}>
      <svg width={width} height={height} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="nui-chart__grid" x1={left} x2={left + iw} y1={y(t)} y2={y(t)} />
            <text className="nui-chart__axis" x={left - 8} y={y(t)} dy="0.32em" textAnchor="end">{yFormat(t)}</text>
          </g>
        ))}
        {data.map((d, k) => {
          const color = d.color ?? (signed ? (d.value >= 0 ? 'var(--nui-positive)' : 'var(--nui-negative)') : 'var(--nui-chart-1)');
          const top = y(Math.max(0, d.value));
          return <rect key={k} x={left + slot * k + (slot - bw) / 2} y={top} width={bw} height={Math.max(1, Math.abs(y(d.value) - y(0)))} fill={color} opacity={i !== null && i !== k ? 0.45 : 0.9} />;
        })}
        <line x1={left} x2={left + iw} y1={y(0)} y2={y(0)} stroke="var(--nui-border-strong)" />
        {xIdx.map((k) => <text key={k} className="nui-chart__axis" x={left + slot * (k + 0.5)} y={height - 6} textAnchor="middle">{data[k]!.label}</text>)}
        <rect
          x={left} y={pt} width={iw} height={ih} fill="transparent"
          onPointerMove={(e) => {
            const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
            hover.setIndex(Math.min(n - 1, Math.max(0, Math.floor((e.clientX - rect.left - left) / slot))));
          }}
          onPointerLeave={() => hover.setIndex(null)}
        />
      </svg>
      {i !== null && (
        <Tip x={left + slot * (i + 0.5)} width={width}>
          <div className="nui-chart__tip-title">{data[i]!.label}</div>
          <strong>{yFormat(data[i]!.value)}</strong>
        </Tip>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ DonutChart */

export interface DonutChartProps {
  data: BarDatum[];
  label: string;
  size?: number;
  thickness?: number;
  /** Content in the hole, e.g. total TVL. */
  center?: ReactNode;
  legend?: boolean;
  format?: (v: number, share: number) => string;
  className?: string;
}
export function DonutChart({ data, label, size = 168, thickness = 18, center, legend = true, format, className }: DonutChartProps) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const fmt = format ?? ((_v: number, share: number) => `${(share * 100).toFixed(1)}%`);
  return (
    <div className={cx('nui-donut', className)}>
      <div className="nui-donut__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={label} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--nui-chart-grid)" strokeWidth={thickness} />
          {data.map((d, k) => {
            const len = (Math.max(0, d.value) / total) * C;
            const el = <circle key={k} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seriesColor(k, d.color)} strokeWidth={thickness} strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </svg>
        {center && <div className="nui-donut__center">{center}</div>}
      </div>
      {legend && <Legend items={data.map((d, k) => ({ label: d.label, color: seriesColor(k, d.color), value: fmt(d.value, Math.max(0, d.value) / total) }))} className="nui-donut__legend" />}
    </div>
  );
}

/* ------------------------------------------------------------ DepthChart */

export interface DepthChartProps {
  /** [price, size], best first (bids descending, asks ascending). */
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  label: string;
  height?: number;
  priceFormat?: (v: number) => string;
  className?: string;
}
export function DepthChart({ bids, asks, label, height = 200, priceFormat = defaultFormat, className }: DepthChartProps) {
  const [ref, width] = useWidth();
  if (!bids.length || !asks.length) return <Empty height={height} className={className} />;
  const cum = (side: Array<[number, number]>) => {
    let t = 0;
    return side.map(([p, s]) => [p, (t += s)] as [number, number]);
  };
  const b = cum(bids), a = cum(asks);
  const pMin = b[b.length - 1]![0], pMax = a[a.length - 1]![0];
  const vMax = Math.max(b[b.length - 1]![1], a[a.length - 1]![1]);
  const pt = 10, pb = 24, pl = 8, pr = 8;
  const iw = width - pl - pr, ih = height - pt - pb;
  const x = (p: number) => pl + ((p - pMin) / (pMax - pMin || 1)) * iw;
  const y = (v: number) => pt + (1 - v / vMax) * ih;
  const bottom = pt + ih;
  const step = (pts: Array<[number, number]>) => pts.reduce((d, [p, v], k) => d + (k === 0 ? `M${x(p)},${bottom}V${y(v)}` : `H${x(p)}V${y(v)}`), '');
  const bidPath = step(b), askPath = step(a);
  const mid = (bids[0]![0] + asks[0]![0]) / 2;
  return (
    <div ref={ref} className={cx('nui-chart', className)}>
      <svg width={width} height={height} role="img" aria-label={label}>
        <path d={`${bidPath}H${x(pMin)}V${bottom}Z`} fill="var(--nui-positive)" fillOpacity={0.14} />
        <path d={bidPath} fill="none" stroke="var(--nui-positive)" strokeWidth={1.5} />
        <path d={`${askPath}H${x(pMax)}V${bottom}Z`} fill="var(--nui-negative)" fillOpacity={0.14} />
        <path d={askPath} fill="none" stroke="var(--nui-negative)" strokeWidth={1.5} />
        <line className="nui-chart__ref" x1={x(mid)} x2={x(mid)} y1={pt} y2={bottom} />
        <text className="nui-chart__axis" x={pl} y={height - 6}>{priceFormat(pMin)}</text>
        <text className="nui-chart__axis" x={x(mid)} y={height - 6} textAnchor="middle">{priceFormat(mid)}</text>
        <text className="nui-chart__axis" x={pl + iw} y={height - 6} textAnchor="end">{priceFormat(pMax)}</text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------ BondingCurve */

export interface BondingCurveProps {
  /** Price at a given supply. */
  price: (supply: number) => number;
  /** Max supply on the curve. */
  maxSupply: number;
  /** Supply sold so far. */
  sold: number;
  label: string;
  height?: number;
  points?: number;
  priceFormat?: (v: number) => string;
  supplyFormat?: (v: number) => string;
  nowLabel?: string;
  className?: string;
}
/** Launch curve: dashed full curve, filled sold portion, marker at the current supply. */
export function BondingCurve({ price, maxSupply, sold, label, height = 240, points = 60, priceFormat, supplyFormat = (v) => defaultFormat(v), nowLabel = 'Now', className }: BondingCurveProps) {
  const supplies = Array.from({ length: points }, (_, k) => (k / (points - 1)) * maxSupply);
  const full = supplies.map(price);
  const cutoff = Math.min(points - 1, Math.round((sold / maxSupply) * (points - 1)));
  const soldSeries = full.map((v, k) => (k <= cutoff ? v : NaN));
  return (
    <LineChart
      className={className}
      label={label}
      height={height}
      yFormat={priceFormat}
      labels={supplies.map(supplyFormat)}
      series={[
        { name: 'Curve', data: full, color: 'var(--nui-chart-5)', dashed: true },
        { name: 'Sold', data: soldSeries, area: true, color: 'var(--nui-chart-1)' },
      ]}
      markers={[{ index: cutoff, series: 1, label: nowLabel }]}
      yMin={0}
    />
  );
}

/** Roadmap-compatible name; identical to BondingCurve. */
export type BondingCurveChartProps = BondingCurveProps;
export const BondingCurveChart = BondingCurve;
