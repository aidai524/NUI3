import { createContext, useContext, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { toCssVars, type TokenOverrides } from '@nui3/tokens';
import { cx } from '../utils/cx.js';

export type ThemeName = 'paper' | 'night' | 'auto' | (string & {});
export type Density = 'comfortable' | 'compact';

interface ThemeContextValue {
  theme: ThemeName;
  density: Density;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'paper', density: 'comfortable' });

export const useTheme = () => useContext(ThemeContext);

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Built-in `paper` | `night` | `auto` (follows OS), or a name registered with `defineTheme()`. */
  theme?: ThemeName;
  density?: Density;
  /** Per-product overrides, e.g. `{ accent: '#7ee0c3', 'radius-base': '6px' }`. Applied as CSS variables on this subtree. */
  tokens?: TokenOverrides;
  /** Paint background/text/font on this element. Turn off when the page body already does. */
  root?: boolean;
  children?: ReactNode;
}

/**
 * Scopes a theme to a subtree. Nest providers to mix themes (e.g. a night trading panel on a paper page).
 * For a whole-page theme, setting `data-nui-theme` on <html> works without React.
 */
export function ThemeProvider({ theme = 'paper', density = 'comfortable', tokens, root = true, className, style, children, ...rest }: ThemeProviderProps) {
  const value = useMemo(() => ({ theme, density }), [theme, density]);
  const vars = useMemo(() => (tokens ? (toCssVars(tokens) as CSSProperties) : undefined), [tokens]);
  return (
    <ThemeContext.Provider value={value}>
      <div
        {...rest}
        data-nui-theme={theme}
        data-nui-density={density === 'compact' ? 'compact' : undefined}
        className={cx(root && 'nui-root', className)}
        style={vars ? { ...vars, ...style } : style}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
