// @nui3/tokens runtime helpers. Zero dependencies, works in browser and Node.
import data from './data.js';

export const tokens = data;
export const themeNames = Object.keys(data.themes);

/** Turn a token map into CSS custom properties: { accent: '#f00' } -> { '--nui-accent': '#f00' } */
export function toCssVars(map) {
  const out = {};
  for (const [k, v] of Object.entries(map || {})) out[k.startsWith('--') ? k : `--nui-${k}`] = String(v);
  return out;
}

/**
 * Create a custom theme on top of a built-in one.
 * Keys can be any semantic token (accent, bg, text...), base token (radius-base, font-sans...)
 * or primitive (color-gold...). Returns the CSS block plus a resolved token map.
 *
 *   const brand = defineTheme({ name: 'bridge', extends: 'night', tokens: { accent: '#7ee0c3' } });
 *   document.head.append(Object.assign(document.createElement('style'), { textContent: brand.css }));
 *   <html data-nui-theme="bridge">
 */
export function defineTheme({ name, extends: parent = 'paper', tokens: overrides = {}, colorScheme }) {
  if (!/^[a-z][a-z0-9-]*$/.test(name || '')) throw new Error(`defineTheme: invalid theme name "${name}"`);
  const baseTheme = data.themes[parent];
  if (!baseTheme) throw new Error(`defineTheme: unknown parent theme "${parent}" (use ${themeNames.join(' | ')})`);
  const resolved = { ...baseTheme.tokens, ...overrides };
  const scheme = colorScheme || resolved['color-scheme'] || 'light';
  const lines = Object.entries(resolved)
    .filter(([k]) => k !== 'color-scheme')
    .map(([k, v]) => {
      const isOverride = k in overrides;
      const ref = baseTheme.refs[k];
      return `  --nui-${k}: ${!isOverride && ref ? `var(--nui-${ref})` : v};`;
    });
  const css = `@layer nui3.theme {\n[data-nui-theme="${name}"] {\n${lines.join('\n')}\n  color-scheme: ${scheme};\n}\n}\n`;
  return { name, extends: parent, css, tokens: resolved, vars: toCssVars(overrides) };
}

const hex = (s) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(s).trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio of two hex colors, or null if either is not a hex color. */
export function contrastRatio(fg, bg) {
  const a = hex(fg), b = hex(bg);
  if (!a || !b) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Check a theme (built-in name or resolved token map) against the library's contrast pairs. */
export function checkContrast(theme) {
  const map = typeof theme === 'string' ? data.themes[theme]?.tokens : theme;
  if (!map) throw new Error(`checkContrast: unknown theme "${theme}"`);
  return data.contrastPairs.map(([fg, bg, min]) => {
    const ratio = contrastRatio(map[fg], map[bg]);
    return { fg, bg, min, ratio: ratio && Math.round(ratio * 100) / 100, pass: ratio === null ? null : ratio >= min };
  });
}
