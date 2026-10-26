import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokens, defineTheme, checkContrast, contrastRatio } from '../dist/index.js';

test('every built-in theme passes the contrast pairs', () => {
  for (const name of Object.keys(tokens.themes)) {
    const failures = checkContrast(name).filter((r) => r.pass === false);
    assert.deepEqual(failures, [], `${name}: ${JSON.stringify(failures)}`);
  }
});

test('themes define the same semantic keys', () => {
  const [a, b] = Object.values(tokens.themes).map((t) => Object.keys(t.tokens).sort());
  assert.deepEqual(a, b);
});

test('css contains every theme selector and no unresolved references', () => {
  const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  for (const sel of ['[data-nui-theme="paper"]', '[data-nui-theme="night"]', '[data-nui-density="compact"]']) assert.ok(css.includes(sel), sel);
  assert.ok(!/\{primitive\./.test(css));
  for (const [, name] of css.matchAll(/var\(--nui-([a-z0-9-]+)\)/g)) assert.match(css, new RegExp(`--nui-${name}:`), name);
});

test('defineTheme keeps references and applies overrides', () => {
  const t = defineTheme({ name: 'bridge', extends: 'night', tokens: { accent: '#7ee0c3', 'radius-base': '8px' } });
  assert.match(t.css, /\[data-nui-theme="bridge"\]/);
  assert.match(t.css, /--nui-accent: #7ee0c3;/);
  assert.match(t.css, /--nui-bg: var\(--nui-color-plum-950\);/);
  assert.match(t.css, /color-scheme: dark;/);
  assert.equal(t.vars['--nui-radius-base'], '8px');
  assert.throws(() => defineTheme({ name: 'Bad Name' }));
});

test('contrastRatio matches WCAG reference values', () => {
  assert.equal(Math.round(contrastRatio('#000', '#fff') * 100) / 100, 21);
  assert.equal(Math.round(contrastRatio('#271219', '#f3f1ef') * 100) / 100, 15.71);
  assert.equal(contrastRatio('var(--x)', '#fff'), null);
});
