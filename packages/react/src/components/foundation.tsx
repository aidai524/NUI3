import { createElement, forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';

type Tag = keyof HTMLElementTagNameMap;
interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: Tag;
  children?: ReactNode;
}

/* ------------------------------------------------------------ typography */

export interface DisplayProps extends BoxProps {
  /** xl 160px (hero art) · l 90px (home H1) · m 71px (page H1, default) · s 42px */
  size?: 'xl' | 'l' | 'm' | 's';
}
/** Serif headline (DM Serif Display). Headlines only — never body copy or buttons. */
export const Display = forwardRef<HTMLElement, DisplayProps>(function Display({ as = 'h1', size = 'm', className, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-display', size !== 'm' && `nui-display--${size}`, className), ...rest });
});

export interface HeadingProps extends BoxProps {
  level?: 2 | 3 | 4;
}
/** Inter bold section heading. */
export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading({ level = 2, as, className, ...rest }, ref) {
  return createElement(as ?? (`h${level}` as Tag), { ref, className: cx('nui-heading', level !== 2 && `nui-heading--${level}`, className), ...rest });
});

export interface EyebrowProps extends BoxProps {
  accent?: boolean;
}
/** Small uppercase label above a headline. */
export const Eyebrow = forwardRef<HTMLElement, EyebrowProps>(function Eyebrow({ as = 'p', accent, className, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-eyebrow', accent && 'nui-eyebrow--accent', className), ...rest });
});

export const Lead = forwardRef<HTMLElement, BoxProps>(function Lead({ as = 'p', className, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-lead', className), ...rest });
});

/* ------------------------------------------------------------ layout */

/** Centered max-width container with responsive gutters. */
export const Shell = forwardRef<HTMLElement, BoxProps>(function Shell({ as = 'div', className, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-shell', className), ...rest });
});

export interface SectionProps extends BoxProps {
  /** inverse = theme-aware dark block; plum / navy = brand dark blocks. Use one dark tone per section. */
  tone?: 'default' | 'inverse' | 'plum' | 'navy';
  /** Wrap children in <Shell>. Default true. */
  contained?: boolean;
}
export const Section = forwardRef<HTMLElement, SectionProps>(function Section({ as = 'section', tone = 'default', contained = true, className, children, ...rest }, ref) {
  return createElement(
    as,
    { ref, className: cx('nui-section', tone !== 'default' && `nui-section--${tone}`, className), ...rest },
    contained ? <div className="nui-shell">{children}</div> : children,
  );
});

type Space = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export interface StackProps extends BoxProps {
  gap?: Space;
}
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack({ as = 'div', gap = 4, className, style, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-stack', className), style: { '--nui-stack-gap': `var(--nui-space-${gap})`, ...style } as CSSProperties, ...rest });
});

export interface ClusterProps extends BoxProps {
  gap?: Space;
  justify?: CSSProperties['justifyContent'];
}
/** Horizontal wrap row. */
export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster({ as = 'div', gap = 3, justify, className, style, ...rest }, ref) {
  return createElement(as, { ref, className: cx('nui-cluster', className), style: { '--nui-cluster-gap': `var(--nui-space-${gap})`, justifyContent: justify, ...style } as CSSProperties, ...rest });
});

export interface GridProps extends BoxProps {
  /** Fixed columns (collapses to 2 at ≤1080px and 1 at ≤640px), or 'auto' with `min` column width. */
  cols?: 1 | 2 | 3 | 4 | 'auto';
  min?: string;
}
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({ as = 'div', cols = 3, min, className, style, ...rest }, ref) {
  // Column count is a class (not an inline var) so the responsive collapse in CSS can override it.
  const vars = cols === 'auto' ? ({ '--nui-min': min ?? '280px' } as CSSProperties) : undefined;
  return createElement(as, { ref, className: cx('nui-grid', cols === 'auto' ? 'nui-grid--auto' : `nui-grid--${cols}`, className), style: { ...vars, ...style }, ...rest });
});

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx('nui-divider', className)} {...rest} />;
}

export function VisuallyHidden({ as = 'span', className, ...rest }: BoxProps) {
  return createElement(as as ElementType, { className: cx('nui-sr-only', className), ...rest });
}
