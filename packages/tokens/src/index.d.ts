export type ThemeName = 'paper' | 'night';

/** Semantic tokens every theme defines. Components only read these. */
export type SemanticToken =
  | 'bg' | 'bg-alt' | 'surface' | 'surface-raised' | 'surface-sunken'
  | 'text' | 'text-secondary' | 'text-muted' | 'text-decorative'
  | 'border' | 'border-strong' | 'border-soft' | 'border-focus'
  | 'accent' | 'accent-hover' | 'on-accent' | 'accent-text'
  | 'positive' | 'negative' | 'warning' | 'info'
  | 'privacy-shielded' | 'privacy-confidential' | 'privacy-public'
  | 'inverse-bg' | 'inverse-text' | 'inverse-text-secondary' | 'inverse-accent-text'
  | 'footer-bg' | 'scrim' | 'focus-ring'
  | 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-grid';

export type BaseToken =
  | 'font-display' | 'font-sans' | 'font-mono'
  | 'radius-base' | 'radius-control' | 'radius-pill'
  | 'container' | 'gutter' | 'header-h' | 'section-y' | 'grid-gap'
  | 'control-h' | 'control-px' | 'card-pad' | 'cell-py' | 'cell-px'
  | 'dur-fast' | 'dur' | 'dur-slow' | 'ease'
  | `fs-${string}` | `lh-${string}` | `ls-${string}` | `space-${string}` | `color-${string}`;

export type TokenOverrides = Partial<Record<SemanticToken | BaseToken, string>>;

export interface TokenData {
  primitives: Record<string, string>;
  base: Record<string, string>;
  density: { compact: Record<string, string> };
  themes: Record<ThemeName, { description: string; tokens: Record<SemanticToken | 'color-scheme', string>; refs: Record<string, string> }>;
  contrastPairs: [SemanticToken, SemanticToken, number][];
}

export declare const tokens: TokenData;
export declare const themeNames: ThemeName[];

export declare function toCssVars(map: TokenOverrides | Record<string, string>): Record<`--${string}`, string>;

export interface DefinedTheme {
  name: string;
  extends: ThemeName;
  /** CSS block scoped to [data-nui-theme="<name>"], inside @layer nui3.theme */
  css: string;
  tokens: Record<string, string>;
  vars: Record<`--${string}`, string>;
}
export declare function defineTheme(options: {
  name: string;
  extends?: ThemeName;
  tokens?: TokenOverrides;
  colorScheme?: 'light' | 'dark';
}): DefinedTheme;

export declare function contrastRatio(fg: string, bg: string): number | null;

export interface ContrastResult { fg: string; bg: string; min: number; ratio: number | null; pass: boolean | null }
export declare function checkContrast(theme: ThemeName | Record<string, string>): ContrastResult[];
