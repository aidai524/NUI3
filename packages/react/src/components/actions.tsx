import {
  forwardRef,
  useId,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx.js';
import { ArrowIcon } from './icons.js';

/* ------------------------------------------------------------ Button */

export type ButtonVariant = 'ghost' | 'solid' | 'outline' | 'subtle' | 'underline' | 'danger' | 'invert';

interface ButtonOwnProps {
  /**
   * ghost (default): uppercase text + arrow. solid: gold fill — the ONE primary action per view.
   * outline: form submit / secondary. subtle: toolbar. underline: inline "See all". danger: destructive. invert: on brand dark sections.
   */
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  /** Append the animated arrow. Default true for ghost/underline/invert. */
  arrow?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  (({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>) | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>));

const ARROW_DEFAULT: Record<ButtonVariant, boolean> = { ghost: true, underline: true, invert: true, solid: false, outline: false, subtle: false, danger: false };

/** Renders <a> when `href` is set, otherwise <button type="button">. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'ghost', size = 'md', block, arrow, loading, icon, className, children, ...rest } = props;
  const classes = cx('nui-btn', variant !== 'ghost' && `nui-btn--${variant}`, size !== 'md' && `nui-btn--${size}`, block && 'nui-btn--block', className);
  const content = (
    <>
      {icon}
      {children}
      {(arrow ?? ARROW_DEFAULT[variant]) && !loading && <ArrowIcon />}
    </>
  );
  if (rest.href !== undefined) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = /^https?:\/\//.test(a.href ?? '') && !a.target;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} aria-busy={loading || undefined} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...a}>
        {content}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={classes} aria-busy={loading || undefined} {...b} disabled={b.disabled || loading}>
      {content}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: 'sm' | 'md';
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, size = 'md', className, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" aria-label={label} title={label} className={cx('nui-icon-btn', size === 'sm' && 'nui-icon-btn--sm', className)} {...rest}>
      {children}
    </button>
  );
});

/* ------------------------------------------------------------ roving keyboard focus */

function useRovingKeys(orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (![next, prev, 'Home', 'End'].includes(e.key)) return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    e.preventDefault();
    const target = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === next ? 1 : -1) + items.length) % items.length;
    items[target]?.focus();
    items[target]?.click();
  };
  return { ref, onKeyDown };
}

export interface Option<V extends string = string> {
  value: V;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

/* ------------------------------------------------------------ ChipGroup (filters) */

export interface ChipGroupProps<V extends string> {
  options: Option<V>[];
  value: V;
  onChange: (value: V) => void;
  'aria-label': string;
  className?: string;
}
/** Single-select filter row (directory categories, market filters). Gold underline on the active chip. */
export function ChipGroup<V extends string>({ options, value, onChange, className, ...aria }: ChipGroupProps<V>) {
  const roving = useRovingKeys();
  return (
    <div ref={roving.ref} onKeyDown={roving.onKeyDown} role="group" className={cx('nui-chips', className)} {...aria}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="nui-chip"
          aria-pressed={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span className="nui-chip__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Tabs */

export interface TabsProps<V extends string> {
  items: Option<V>[];
  value: V;
  onChange: (value: V) => void;
  'aria-label': string;
  /** Base id; tab i gets `${id}-tab-${value}` and controls `${id}-panel-${value}`. */
  id?: string;
  className?: string;
}
export function Tabs<V extends string>({ items, value, onChange, id, className, ...aria }: TabsProps<V>) {
  const auto = useId();
  const base = id ?? auto;
  const roving = useRovingKeys();
  return (
    <div ref={roving.ref} onKeyDown={roving.onKeyDown} role="tablist" className={cx('nui-tabs', className)} {...aria}>
      {items.map((t) => (
        <button
          key={t.value}
          id={`${base}-tab-${t.value}`}
          type="button"
          role="tab"
          className="nui-tab"
          aria-selected={t.value === value}
          aria-controls={`${base}-panel-${t.value}`}
          tabIndex={t.value === value ? 0 : -1}
          disabled={t.disabled}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tabsId: string;
  value: string;
  active: boolean;
}
export function TabPanel({ tabsId, value, active, children, ...rest }: TabPanelProps) {
  return (
    <div role="tabpanel" id={`${tabsId}-panel-${value}`} aria-labelledby={`${tabsId}-tab-${value}`} hidden={!active} tabIndex={0} {...rest}>
      {active ? children : null}
    </div>
  );
}

/* ------------------------------------------------------------ Segmented */

export interface SegmentedProps<V extends string> {
  options: Option<V>[];
  value: V;
  onChange: (value: V) => void;
  'aria-label': string;
  className?: string;
}
/** Compact radio group: Long/Short, Market/Limit, 1H/1D/1W. */
export function Segmented<V extends string>({ options, value, onChange, className, ...aria }: SegmentedProps<V>) {
  const roving = useRovingKeys();
  return (
    <div ref={roving.ref} onKeyDown={roving.onKeyDown} role="radiogroup" className={cx('nui-segmented', className)} {...aria}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          className="nui-segmented__item"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
