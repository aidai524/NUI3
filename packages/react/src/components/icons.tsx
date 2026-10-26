import type { SVGProps } from 'react';

// Minimal line icons: 1.3–1.5px strokes, square caps (z.cash language). Decorative by default.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, rest: IconProps) => ({
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  'aria-hidden': true as const,
  focusable: false as const,
  ...rest,
});

export const ArrowIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg viewBox="0 0 18 10" {...base(size, rest)} height={(size * 10) / 18} className={['nui-btn__arrow', rest.className].filter(Boolean).join(' ')}>
    <path d="M1 5h15M12 1l4 4-4 4" />
  </svg>
);
export const ExternalIcon = ({ size = 12, ...rest }: IconProps) => (
  <svg viewBox="0 0 12 12" {...base(size, rest)}><path d="M4 2h6v6M10 2 2 10" /></svg>
);
export const CopyIcon = ({ size = 14, ...rest }: IconProps) => (
  <svg viewBox="0 0 14 14" {...base(size, rest)}><rect x="4.5" y="4.5" width="8" height="8" /><path d="M9.5 4.5v-3h-8v8h3" /></svg>
);
export const CheckIcon = ({ size = 14, ...rest }: IconProps) => (
  <svg viewBox="0 0 14 14" {...base(size, rest)}><path d="m2 7.5 3.2 3L12 3.5" /></svg>
);
export const CloseIcon = ({ size = 14, ...rest }: IconProps) => (
  <svg viewBox="0 0 14 14" {...base(size, rest)}><path d="m2 2 10 10M12 2 2 12" /></svg>
);
export const SearchIcon = ({ size = 15, ...rest }: IconProps) => (
  <svg viewBox="0 0 15 15" {...base(size, rest)}><circle cx="6.5" cy="6.5" r="4.75" /><path d="M10.2 10.2 13.5 13.5" /></svg>
);
export const SwapIcon = ({ size = 16, ...rest }: IconProps) => (
  <svg viewBox="0 0 16 16" {...base(size, rest)}><path d="M5 2v12M2 11l3 3 3-3M11 14V2M8 5l3-3 3 3" /></svg>
);
export const ShieldIcon = ({ size = 12, ...rest }: IconProps) => (
  <svg viewBox="0 0 12 12" {...base(size, rest)}><path d="M6 1 2 2.5v3C2 8 3.8 10.1 6 11c2.2-.9 4-3 4-5.5v-3L6 1Z" /></svg>
);
export const LockIcon = ({ size = 12, ...rest }: IconProps) => (
  <svg viewBox="0 0 12 12" {...base(size, rest)}><rect x="2" y="5.5" width="8" height="5.5" /><path d="M4 5.5V3.5a2 2 0 0 1 4 0v2" /></svg>
);
export const EyeIcon = ({ size = 12, ...rest }: IconProps) => (
  <svg viewBox="0 0 12 12" {...base(size, rest)}><path d="M1 6s1.8-3.5 5-3.5S11 6 11 6 9.2 9.5 6 9.5 1 6 1 6Z" /><circle cx="6" cy="6" r="1.5" /></svg>
);
export const MenuIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg viewBox="0 0 18 18" {...base(size, rest)}><path d="M2 5h14M2 9h14M2 13h14" /></svg>
);
export const ChevronIcon = ({ size = 10, ...rest }: IconProps) => (
  <svg viewBox="0 0 10 10" {...base(size, rest)}><path d="m2 3.5 3 3 3-3" /></svg>
);
