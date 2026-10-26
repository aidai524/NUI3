// Build @nui3/css: concatenate tokens + base + components into dist bundles, copy fonts.
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const require = createRequire(import.meta.url);
const tokensCss = readFileSync(require.resolve('@nui3/tokens/tokens.css'), 'utf8');
const read = (p) => readFileSync(join(root, 'src', p), 'utf8');

// Component files in cascade order.
const COMPONENTS = ['foundation', 'actions', 'forms', 'navigation', 'surfaces', 'zcash', 'data'];
const LAYERS = '@layer nui3.tokens, nui3.theme, nui3.base, nui3.components, nui3.utilities;\n';
const banner = (what) => `/*! @nui3/css ${what} — MIT. Styles live in @layer nui3.*; unlayered app CSS always wins. */\n`;

mkdirSync(join(dist, 'components'), { recursive: true });
const components = COMPONENTS.map((c) => read(`components/${c}.css`));
for (const [i, c] of COMPONENTS.entries()) writeFileSync(join(dist, 'components', `${c}.css`), LAYERS + components[i]);

const fonts = read('fonts.css');
writeFileSync(join(dist, 'fonts.css'), fonts);
writeFileSync(join(dist, 'tokens.css'), LAYERS + tokensCss);
// Full bundle: fonts + tokens + global base + components.
writeFileSync(join(dist, 'nui3.css'), banner('full') + LAYERS + fonts + tokensCss + read('base.css') + components.join('\n'));
// Embeddable bundle: no global reset, no fonts. Wrap the app in .nui-root.
writeFileSync(join(dist, 'components.css'), banner('components') + LAYERS + tokensCss + components.join('\n'));
cpSync(join(root, 'fonts'), join(dist, 'fonts'), { recursive: true });
// Lets TypeScript accept `import '@nui3/css'` (TS 6+ checks side-effect imports).
writeFileSync(join(dist, 'index.d.ts'), 'export {};\n');

const size = (f) => (readFileSync(join(dist, f)).length / 1024).toFixed(1) + 'KB';
console.log(`css: nui3.css ${size('nui3.css')}, components.css ${size('components.css')}, ${readdirSync(join(dist, 'fonts')).length} fonts`);
