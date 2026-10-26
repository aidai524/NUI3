// Build @nui3/tokens: tokens.json (DTCG) -> dist/{tokens.css, tokens.json, index.js, index.d.ts, tailwind.js}
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'src/tokens.json'), 'utf8'));
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });

// CSS variable name for each group. Semantic theme tokens have no group prefix.
const GROUP_PREFIX = {
  'primitive.color': 'color-',
  'primitive.font': 'font-',
  'base.font-size': 'fs-',
  'base.line-height': 'lh-',
  'base.letter-spacing': 'ls-',
  'base.space': 'space-',
  'base.radius': 'radius-',
  'base.layout': '',
  'base.density': '',
  'base.motion': '',
  'base.z': 'z-',
};

const isToken = (v) => v && typeof v === 'object' && '$value' in v;
const entries = (obj) => Object.entries(obj).filter(([k]) => !k.startsWith('$'));

/** Flatten a group into [{name, value, description}] */
function flatten(path) {
  const group = path.split('.').reduce((o, k) => o[k], src);
  return entries(group).filter(([, v]) => isToken(v)).map(([k, v]) => ({
    name: GROUP_PREFIX[path] + k,
    value: v.$value,
    description: v.$description,
  }));
}

// "{primitive.color.gold}" -> "color-gold"
function refName(value) {
  const m = /^\{(.+)\.([^.]+)\}$/.exec(value);
  if (!m) return null;
  return GROUP_PREFIX[m[1]] + m[2];
}

const primitives = [...flatten('primitive.color'), ...flatten('primitive.font')];
const primitiveMap = Object.fromEntries(primitives.map((t) => [t.name, t.value]));
const base = Object.keys(GROUP_PREFIX).filter((p) => p.startsWith('base.')).flatMap(flatten);
const compact = entries(src.density.compact).map(([k, v]) => ({ name: k, value: v.$value }));

const themes = {};
for (const [name, def] of entries(src.theme)) {
  themes[name] = {
    description: def.$description,
    tokens: entries(def).map(([k, v]) => {
      const ref = refName(v.$value);
      return { name: k, ref, value: ref ? primitiveMap[ref] : v.$value, description: v.$description };
    }),
  };
}

// ---------------------------------------------------------------- CSS
const decl = (name, value) => `  --nui-${name}: ${value};`;
const themeBlock = (t) => [
  ...t.tokens.filter((x) => x.name !== 'color-scheme').map((x) => decl(x.name, x.ref ? `var(--nui-${x.ref})` : x.value)),
  `  color-scheme: ${t.tokens.find((x) => x.name === 'color-scheme').value};`,
].join('\n');

const css = `/* @nui3/tokens — generated from src/tokens.json. Do not edit. */
@layer nui3.tokens {
:root {
  /* primitives (override these to rebrand every theme at once) */
${primitives.map((t) => decl(t.name, t.value)).join('\n')}

  /* base scale */
${base.map((t) => decl(t.name, t.value)).join('\n')}
}

:root,
[data-nui-theme="paper"] {
${themeBlock(themes.paper)}
}

[data-nui-theme="night"] {
${themeBlock(themes.night)}
}

@media (prefers-color-scheme: dark) {
  [data-nui-theme="auto"] {
${themeBlock(themes.night).replace(/^/gm, '  ')}
  }
}

[data-nui-density="compact"] {
${compact.map((t) => decl(t.name, t.value)).join('\n')}
}
}
`;
writeFileSync(join(dist, 'tokens.css'), css);

// ---------------------------------------------------------------- JSON + JS
const data = {
  primitives: primitiveMap,
  base: Object.fromEntries(base.map((t) => [t.name, t.value])),
  density: { compact: Object.fromEntries(compact.map((t) => [t.name, t.value])) },
  themes: Object.fromEntries(Object.entries(themes).map(([k, t]) => [k, {
    description: t.description,
    tokens: Object.fromEntries(t.tokens.map((x) => [x.name, x.value])),
    refs: Object.fromEntries(t.tokens.filter((x) => x.ref).map((x) => [x.name, x.ref])),
  }])),
  contrastPairs: src.contrast.pairs,
};
writeFileSync(join(dist, 'tokens.json'), JSON.stringify(data, null, 2));
writeFileSync(join(dist, 'data.js'), `export default ${JSON.stringify(data, null, 2)};\n`);
copyFileSync(join(root, 'src/index.js'), join(dist, 'index.js'));
copyFileSync(join(root, 'src/index.d.ts'), join(dist, 'index.d.ts'));

// ---------------------------------------------------------------- Tailwind preset
const v = (n) => `var(--nui-${n})`;
const semanticColors = Object.fromEntries(
  themes.paper.tokens.filter((x) => x.name !== 'color-scheme').map((x) => [x.name, v(x.name)]),
);
const preset = {
  theme: {
    extend: {
      colors: { nui: semanticColors },
      fontFamily: { display: [v('font-display')], sans: [v('font-sans')], mono: [v('font-mono')] },
      borderRadius: { none: '0', DEFAULT: v('radius-base'), control: v('radius-control'), pill: v('radius-pill') },
      maxWidth: { container: v('container') },
      transitionTimingFunction: { nui: v('ease') },
    },
  },
};
writeFileSync(join(dist, 'tailwind.js'), `/* Tailwind preset: colors resolve to NUI3 CSS variables, so themes switch at runtime. */\nexport default ${JSON.stringify(preset, null, 2)};\n`);

console.log(`tokens: ${primitives.length} primitives, ${base.length} base, themes [${Object.keys(themes).join(', ')}]`);
