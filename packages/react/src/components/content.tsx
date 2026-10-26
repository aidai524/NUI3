import {
  cloneElement, isValidElement, useEffect, useId, useRef, useState, type AnchorHTMLAttributes, type DragEvent, type ReactElement, type ReactNode,
} from 'react';
import { cx } from '../utils/cx.js';
import { useNuiLocale } from './i18n.js';
import { CopyButton } from './zcash.js';
import { IconButton } from './actions.js';
import { CloseIcon, EyeIcon } from './icons.js';

/* ------------------------------------------------------------ CodeBlock */

export interface CodeSnippet {
  label: string;
  code: string;
}
export interface CodeBlockProps {
  /** Single snippet, or several tabs (curl / JS / Python). */
  code?: string;
  snippets?: CodeSnippet[];
  title?: ReactNode;
  language?: string;
  copyable?: boolean;
  className?: string;
}
export function CodeBlock({ code, snippets, title, language, copyable = true, className }: CodeBlockProps) {
  const [tab, setTab] = useState(0);
  const items = snippets ?? [{ label: language ?? '', code: code ?? '' }];
  const current = items[Math.min(tab, items.length - 1)]!;
  return (
    <figure className={cx('nui-code', className)}>
      <figcaption className="nui-code__head">
        {snippets ? (
          <span className="nui-code__tabs" role="tablist">
            {snippets.map((s, k) => (
              <button key={s.label} type="button" role="tab" aria-selected={k === tab} className="nui-code__tab" onClick={() => setTab(k)}>{s.label}</button>
            ))}
          </span>
        ) : (
          <span className="nui-code__title">{title ?? language}</span>
        )}
        {copyable && <CopyButton value={current.code} />}
      </figcaption>
      <pre className="nui-code__pre"><code>{current.code}</code></pre>
    </figure>
  );
}

/* ------------------------------------------------------------ SecretField */

export interface SecretFieldProps {
  value: string;
  /** Characters kept visible at the end while masked. Default 4. */
  visibleTail?: number;
  label?: string;
  className?: string;
}
/** API key / viewing key display: masked, reveal toggle, copy. */
export function SecretField({ value, visibleTail = 4, label, className }: SecretFieldProps) {
  const { m } = useNuiLocale();
  const [shown, setShown] = useState(false);
  const masked = `${'•'.repeat(Math.min(24, Math.max(8, value.length - visibleTail)))}${value.slice(-visibleTail)}`;
  return (
    <span className={cx('nui-secret', className)}>
      <code className="nui-secret__value" aria-label={label}>{shown ? value : masked}</code>
      <IconButton size="sm" label={shown ? m.hide : m.reveal} aria-pressed={shown} onClick={() => setShown((s) => !s)}><EyeIcon size={13} /></IconButton>
      <CopyButton value={value} />
    </span>
  );
}

/* ------------------------------------------------------------ Timeline */

export interface TimelineItem {
  title: ReactNode;
  time?: ReactNode;
  description?: ReactNode;
  tone?: 'neutral' | 'accent' | 'positive' | 'negative' | 'info';
  icon?: ReactNode;
}
/** Activity feed: item history, wallet activity, audit log. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cx('nui-timeline', className)}>
      {items.map((it, k) => (
        <li key={k} className="nui-timeline__item" data-tone={it.tone ?? 'neutral'}>
          <span className="nui-timeline__dot" aria-hidden="true">{it.icon}</span>
          <div className="nui-timeline__body">
            <div className="nui-timeline__row">
              <span className="nui-timeline__title">{it.title}</span>
              {it.time && <span className="nui-timeline__time">{it.time}</span>}
            </div>
            {it.description && <div className="nui-timeline__desc">{it.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------ Pagination */

export function paginationRange(page: number, pages: number, siblings = 1): Array<number | '…'> {
  const out: Array<number | '…'> = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= siblings) out.push(p);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
}

export interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
}
export function Pagination({ page, pages, onChange, className }: PaginationProps) {
  const { m } = useNuiLocale();
  if (pages <= 1) return null;
  return (
    <nav className={cx('nui-pagination', className)} aria-label={m.page}>
      <button type="button" className="nui-pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>← {m.previous}</button>
      {paginationRange(page, pages).map((p, k) =>
        p === '…' ? (
          <span key={`e${k}`} className="nui-pagination__gap">…</span>
        ) : (
          <button key={p} type="button" className="nui-pagination__btn nui-pagination__num" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" className="nui-pagination__btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>{m.next} →</button>
    </nav>
  );
}

/* ------------------------------------------------------------ Tooltip */

export interface TooltipProps {
  content: ReactNode;
  /** A single focusable element (button, link). */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  side?: 'top' | 'bottom';
  className?: string;
}
/** Hover/focus hint. Escape hides it (WCAG 1.4.13). Keep content short and non-interactive. */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  const [hidden, setHidden] = useState(false);
  const child = isValidElement(children) ? cloneElement(children, { 'aria-describedby': id }) : children;
  return (
    <span
      className={cx('nui-tooltip', className)}
      data-side={side}
      data-hidden={hidden || undefined}
      onKeyDown={(e) => e.key === 'Escape' && setHidden(true)}
      onPointerEnter={() => setHidden(false)}
      onFocus={() => setHidden(false)}
    >
      {child}
      <span role="tooltip" id={id} className="nui-tooltip__bubble">{content}</span>
    </span>
  );
}

/** Small (i) button with a tooltip, for fee or term explanations. */
export function InfoTip({ content, label = 'More info' }: { content: ReactNode; label?: string }) {
  return (
    <Tooltip content={content}>
      <button type="button" className="nui-infotip" aria-label={label}>i</button>
    </Tooltip>
  );
}

/* ------------------------------------------------------------ Disclosure */

export interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}
/** FAQ / advanced settings. Native <details>, so it works without JS. */
export function Disclosure({ summary, children, defaultOpen, className }: DisclosureProps) {
  return (
    <details className={cx('nui-disclosure', className)} open={defaultOpen}>
      <summary className="nui-disclosure__summary">{summary}</summary>
      <div className="nui-disclosure__body">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------ FileDrop */

export interface FileDropProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  multiple?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children?: ReactNode;
}
/** Drag-and-drop file input (NFT media, payroll CSV). */
export function FileDrop({ onFiles, accept, maxSize, multiple, label, hint, className, children }: FileDropProps) {
  const { m } = useNuiLocale();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    if (maxSize && files.some((f) => f.size > maxSize)) {
      setError(m.fileTooLarge);
      return;
    }
    setError(null);
    onFiles(multiple ? files : files.slice(0, 1));
  };
  const drag = (e: DragEvent, on: boolean) => {
    e.preventDefault();
    setOver(on);
  };
  return (
    <div
      className={cx('nui-filedrop', className)}
      data-over={over || undefined}
      data-invalid={error ? true : undefined}
      onDragOver={(e) => drag(e, true)}
      onDragLeave={(e) => drag(e, false)}
      onDrop={(e) => {
        drag(e, false);
        take(e.dataTransfer.files);
      }}
    >
      {children ?? (
        <>
          {label && <div className="nui-filedrop__label">{label}</div>}
          <div>
            {m.dropFiles}{' '}
            <button type="button" className="nui-filedrop__browse" onClick={() => input.current?.click()}>{m.browse}</button>
          </div>
          {hint && <div className="nui-filedrop__hint">{hint}</div>}
        </>
      )}
      {error && <div className="nui-field__error" role="alert">{error}</div>}
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

/* ------------------------------------------------------------ Drawer */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: 'left' | 'right';
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}
/** Side sheet on native <dialog>: mobile nav, filters, order details. */
export function Drawer({ open, onClose, title, side = 'right', children, footer, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { m } = useNuiLocale();
  const titleId = `nui-drawer-${useId()}`;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      if (typeof el.showModal === 'function') el.showModal();
      else el.setAttribute('open', '');
    } else if (!open && el.open) {
      if (typeof el.close === 'function') el.close();
      else el.removeAttribute('open');
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cx('nui-drawer', className)}
      data-side={side}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && (
        <>
          <header className="nui-dialog__head">
            <h2 id={titleId} className="nui-dialog__title">{title}</h2>
            <IconButton label={m.close} onClick={onClose}><CloseIcon /></IconButton>
          </header>
          <div className="nui-dialog__body nui-drawer__body">{children}</div>
          {footer && <footer className="nui-dialog__foot">{footer}</footer>}
        </>
      )}
    </dialog>
  );
}

/* ------------------------------------------------------------ SubNav */

export interface SubNavItem {
  label: ReactNode;
  href: string;
  current?: boolean;
  badge?: ReactNode;
}
export interface SubNavProps {
  items: SubNavItem[];
  'aria-label': string;
  renderLink?: (item: SubNavItem, props: AnchorHTMLAttributes<HTMLAnchorElement> & { className: string }) => ReactNode;
  className?: string;
}
/** Section navigation inside a product (Swap / Pools / Positions). Links, unlike Tabs. */
export function SubNav({ items, renderLink, className, ...aria }: SubNavProps) {
  return (
    <nav className={cx('nui-subnav', className)} {...aria}>
      {items.map((it, k) => {
        const props = { className: 'nui-subnav__link', 'aria-current': it.current ? ('page' as const) : undefined };
        const body = <>{it.label}{it.badge !== undefined && <span className="nui-subnav__badge">{it.badge}</span>}</>;
        return renderLink ? <span key={k}>{renderLink(it, { ...props, children: body })}</span> : <a key={k} href={it.href} {...props}>{body}</a>;
      })}
    </nav>
  );
}

/* ------------------------------------------------------------ Identicon / NFT */

function hash(input: string): number[] {
  // FNV-1a, expanded to 16 bytes. Deterministic, not cryptographic.
  const out: number[] = [];
  let h = 0x811c9dc5;
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i) + round;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out.push(h & 255, (h >>> 8) & 255, (h >>> 16) & 255, (h >>> 24) & 255);
  }
  return out;
}

export interface IdenticonProps {
  value: string;
  size?: number;
  /** grid = 5×5 avatar; art = abstract shapes for NFT placeholders. */
  variant?: 'grid' | 'art';
  label?: string;
  className?: string;
}
/** Deterministic avatar/artwork from an address or id. */
export function Identicon({ value, size = 32, variant = 'grid', label, className }: IdenticonProps) {
  const b = hash(value);
  const c = (k: number) => `var(--nui-chart-${(b[k]! % 5) + 1})`;
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  if (variant === 'art') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={cx('nui-identicon', className)} {...a11y} preserveAspectRatio="xMidYMid slice">
        <rect width="100" height="100" fill="var(--nui-surface-sunken)" />
        <rect width="100" height="100" fill={c(0)} opacity={0.12} />
        <circle cx={20 + (b[1]! % 60)} cy={20 + (b[2]! % 60)} r={18 + (b[3]! % 22)} fill={c(4)} opacity={0.85} />
        <rect x={10 + (b[5]! % 50)} y={10 + (b[6]! % 50)} width={20 + (b[7]! % 35)} height={20 + (b[8]! % 35)} fill={c(9)} opacity={0.75} transform={`rotate(${b[10]! % 90} 50 50)`} />
        <circle cx={10 + (b[11]! % 80)} cy={10 + (b[12]! % 80)} r={4 + (b[13]! % 10)} fill={c(14)} />
        <line x1="0" y1={b[15]! % 100} x2="100" y2={100 - (b[15]! % 100)} stroke="var(--nui-text)" strokeOpacity={0.18} strokeWidth={1} />
      </svg>
    );
  }
  const cells: ReactNode[] = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
    if ((b[y * 3 + x]! & 1) === 0) continue;
    cells.push(<rect key={`${x}${y}`} x={x} y={y} width="1" height="1" />);
    if (x < 2) cells.push(<rect key={`m${x}${y}`} x={4 - x} y={y} width="1" height="1" />);
  }
  return (
    <svg viewBox="-0.5 -0.5 6 6" width={size} height={size} className={cx('nui-identicon', 'nui-identicon--grid', className)} {...a11y}>
      <rect x="-0.5" y="-0.5" width="6" height="6" fill="var(--nui-surface-sunken)" />
      <g fill={c(15)}>{cells}</g>
    </svg>
  );
}

export interface NFTCardProps {
  name: string;
  collection?: string;
  /** Image URL; falls back to a generated artwork. */
  image?: string;
  /** Seed for the fallback artwork. Defaults to name. */
  seed?: string;
  price?: ReactNode;
  /** Secondary line, e.g. "Last 2.1 ZEC" or owner. */
  meta?: ReactNode;
  badge?: ReactNode;
  href?: string;
  className?: string;
}
export function NFTCard({ name, collection, image, seed, price, meta, badge, href, className }: NFTCardProps) {
  const [failed, setFailed] = useState(false);
  const media = image && !failed ? <img src={image} alt="" onError={() => setFailed(true)} /> : <Identicon value={seed ?? name} variant="art" size={400} className="nui-nft__art" />;
  return (
    <article className={cx('nui-nft', href && 'nui-card--interactive', className)}>
      <div className="nui-nft__media">
        {media}
        {badge && <span className="nui-nft__badge">{badge}</span>}
      </div>
      <div className="nui-nft__body">
        {collection && <div className="nui-nft__collection">{collection}</div>}
        <h3 className="nui-nft__name">
          {href ? <a href={href} className="nui-card__link--stretched" style={{ color: 'inherit', textDecoration: 'none' }}>{name}</a> : name}
        </h3>
        {(price || meta) && (
          <div className="nui-nft__foot">
            {price && <span className="nui-nft__price">{price}</span>}
            {meta && <span className="nui-nft__meta">{meta}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
