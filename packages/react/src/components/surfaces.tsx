import { Fragment, forwardRef, useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { ArrowIcon, ExternalIcon } from './icons.js';
import { useNuiLocale } from './i18n.js';

/* ------------------------------------------------------------ Card */

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section' | 'li';
  /** Gold rule on hover + border emphasis. Use with a stretched link inside. */
  interactive?: boolean;
}
export const Card = forwardRef<HTMLElement, CardProps>(function Card({ as: Tag = 'article', interactive, className, ...rest }, ref) {
  return <Tag ref={ref as never} className={cx('nui-card', interactive && 'nui-card--interactive', className)} {...rest} />;
});

export interface ProjectCardProps {
  name: string;
  description?: ReactNode;
  href: string;
  tags?: string[];
  logo?: ReactNode;
  /** Index number shown top-right in mono, e.g. 1 -> "01". */
  index?: number;
  linkLabel?: string;
  className?: string;
}
/** Directory/index card (z.cash ecosystem style). Whole card is clickable via a stretched link. */
export function ProjectCard({ name, description, href, tags = [], logo, index, linkLabel, className }: ProjectCardProps) {
  const { m } = useNuiLocale();
  const external = /^https?:\/\//.test(href);
  return (
    <Card interactive className={className}>
      {index !== undefined && <span className="nui-card__index" aria-hidden="true">{String(index).padStart(2, '0')}</span>}
      <div className="nui-card__head">
        {logo && <span className="nui-card__logo">{logo}</span>}
        <h3 className="nui-card__title">{name}</h3>
      </div>
      {description && <p className="nui-card__desc">{description}</p>}
      <div className="nui-card__foot">
        <ul className="nui-card__tags">{tags.slice(0, 3).map((t) => <li key={t}>{t.replace(/-/g, ' ')}</li>)}</ul>
        <a className="nui-card__link nui-card__link--stretched" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {linkLabel ?? m.open}
          <span className="nui-sr-only"> {name}{external ? ` (${m.opensInNewTab})` : ''}</span>
          {external ? <ExternalIcon /> : <ArrowIcon size={16} />}
        </a>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ Panel */

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  sunken?: boolean;
  /** Skip body padding (for tables / lists that touch the edges). */
  flush?: boolean;
}
/** App surface for forms, widgets, tables (swap box, position list, tx detail). */
export function Panel({ title, actions, footer, sunken, flush, className, children, ...rest }: PanelProps) {
  return (
    <section className={cx('nui-panel', sunken && 'nui-panel--sunken', className)} {...rest}>
      {(title || actions) && (
        <header className="nui-panel__head">
          {title && <h2 className="nui-panel__title">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={flush ? undefined : 'nui-panel__body'}>{children}</div>
      {footer && <footer className="nui-panel__foot">{footer}</footer>}
    </section>
  );
}

/* ------------------------------------------------------------ Stat */

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** e.g. <PriceChange value={2.4} /> */
  delta?: ReactNode;
  size?: 'md' | 'sm';
}
export function Stat({ label, value, unit, delta, size = 'md' }: StatProps) {
  return (
    <div className={cx('nui-stat', size === 'sm' && 'nui-stat--sm')}>
      <dt className="nui-stat__label">{label}</dt>
      <dd className="nui-stat__value">
        {value}
        {unit && <small>{unit}</small>}
      </dd>
      {delta && <dd style={{ margin: 0, fontSize: 13 }}>{delta}</dd>}
    </div>
  );
}
/** Signature data bar: CURRENT PRICE / TVL / SHIELDED ZEC. */
export function Stats({ divided, className, children, ...rest }: HTMLAttributes<HTMLDListElement> & { divided?: boolean }) {
  return <dl className={cx('nui-stats', divided && 'nui-stats--divided', className)} {...rest}>{children}</dl>;
}

/* ------------------------------------------------------------ Badge / Alert */

export type Tone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info' | 'accent';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  solid?: boolean;
}
export function Badge({ tone = 'neutral', dot, solid, className, ...rest }: BadgeProps) {
  return <span className={cx('nui-badge', tone !== 'neutral' && `nui-badge--${tone}`, dot && 'nui-badge--dot', solid && 'nui-badge--solid', className)} {...rest} />;
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'positive' | 'negative' | 'warning' | 'shielded';
  title?: ReactNode;
  action?: ReactNode;
}
/** Inline notice. Use for risk disclosures (bridges, leverage), privacy notes, errors. */
export function Alert({ tone = 'info', title, action, className, children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'negative' ? 'alert' : 'status'} className={cx('nui-alert', tone !== 'info' && `nui-alert--${tone}`, className)} {...rest}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p className="nui-alert__title">{title}</p>}
        {children && <div className="nui-alert__body">{children}</div>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------ DataTable */

export interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row, index: number) => ReactNode;
  /** Right-aligned tabular numbers. */
  numeric?: boolean;
  /** Return a comparable value to make the column sortable. */
  sortValue?: (row: Row) => string | number | bigint;
  width?: CSSProperties['width'];
}

export interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  caption?: string;
  empty?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: Row) => void;
  defaultSort?: { key: string; direction: 'ascending' | 'descending' };
  className?: string;
}
/** Explorer / positions / pools table. Sticky header, tabular numbers, keyboard-sortable headers. */
export function DataTable<Row>({ columns, rows, rowKey, caption, empty, loading, onRowClick, defaultSort, className }: DataTableProps<Row>) {
  const { m } = useNuiLocale();
  const [sort, setSort] = useState(defaultSort);
  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort!.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = col.sortValue!(a), y = col.sortValue!(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) =>
    setSort((s) => ({ key, direction: s?.key === key && s.direction === 'descending' ? 'ascending' : 'descending' }));

  return (
    <div className={cx('nui-table-wrap', className)}>
      <table className="nui-table" aria-busy={loading || undefined}>
        {caption && <caption className="nui-sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? 'is-num' : undefined} style={{ width: c.width }} aria-sort={sort?.key === c.key ? sort.direction : undefined}>
                {c.sortValue ? (
                  <button type="button" className="nui-table__sort" onClick={() => toggle(c.key)}>{c.header}</button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={`sk-${i}`}>{columns.map((c) => <td key={c.key}><Skeleton width="70%" /></td>)}</tr>
              ))
            : sorted.length === 0
              ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--nui-text-muted)' }}>{empty ?? m.noResults}</td></tr>
              : sorted.map((row, i) => (
                  <tr key={rowKey(row, i)} onClick={onRowClick ? () => onRowClick(row) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
                    {columns.map((c) => <td key={c.key} className={c.numeric ? 'is-num' : undefined}>{c.cell(row, i)}</td>)}
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ KeyValue */

export interface KeyValueProps {
  items: Array<{ label: ReactNode; value: ReactNode }>;
  /** Left-align values (default right-aligned, for numbers). */
  alignLeft?: boolean;
  className?: string;
}
/** Detail list for tx / token / contract pages. */
export function KeyValue({ items, alignLeft, className }: KeyValueProps) {
  return (
    <dl className={cx('nui-kv', alignLeft && 'nui-kv--left', className)}>
      {items.map((it, i) => (
        <Fragment key={i}>
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------ Stepper */

export type StepState = 'pending' | 'active' | 'complete' | 'error';
export interface Step {
  title: ReactNode;
  description?: ReactNode;
  state: StepState;
}
/** Multi-step progress: bridge deposit, token launch, payroll run. */
export function Stepper({ steps, orientation = 'vertical', className }: { steps: Step[]; orientation?: 'vertical' | 'horizontal'; className?: string }) {
  const { m } = useNuiLocale();
  const stateText = { pending: m.stepPending, active: m.stepActive, complete: m.stepComplete, error: m.stepError };
  return (
    <ol className={cx('nui-stepper', orientation === 'horizontal' && 'nui-stepper--horizontal', className)}>
      {steps.map((s, i) => (
        <li key={i} className="nui-step" data-state={s.state} aria-current={s.state === 'active' ? 'step' : undefined}>
          <span className="nui-step__marker" aria-hidden="true">{s.state === 'complete' ? '✓' : s.state === 'error' ? '!' : ''}</span>
          <div>
            <p className="nui-step__title">
              {s.title}
              <span className="nui-sr-only"> ({stateText[s.state]})</span>
            </p>
            {s.description && <div className="nui-step__desc">{s.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------ Progress / Skeleton / EmptyState */

export interface ProgressProps {
  /** 0–100. Omit for indeterminate. */
  value?: number;
  label: string;
  className?: string;
}
export function Progress({ value, label, className }: ProgressProps) {
  const v = value === undefined ? undefined : Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cx('nui-progress', v === undefined && 'nui-progress--indeterminate', className)}
      style={{ '--nui-value': v ?? 0 } as CSSProperties}
    >
      <div className="nui-progress__bar" />
    </div>
  );
}

export function Skeleton({ width = '100%', height = '1em', className, style }: { width?: CSSProperties['width']; height?: CSSProperties['height']; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cx('nui-skeleton', className)} style={{ width, height, ...style }} />;
}

export interface EmptyStateProps {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
}
export function EmptyState({ title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cx('nui-empty', className)}>
      <p className="nui-empty__title">{title}</p>
      {hint && <p className="nui-empty__hint">{hint}</p>}
      {action}
    </div>
  );
}
