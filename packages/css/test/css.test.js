import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const css = readFileSync(new URL('nui3.css', dist), 'utf8');
const componentDir = new URL('../src/components/', import.meta.url);
const componentFiles = readdirSync(componentDir).map((f) => [f, readFileSync(new URL(f, componentDir), 'utf8')]);

test('braces are balanced', () => {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"]*"/g, '');
  assert.equal((stripped.match(/{/g) || []).length, (stripped.match(/}/g) || []).length);
});

test('every var() without fallback is defined', () => {
  const defined = new Set([...css.matchAll(/(--[a-z0-9_-]+)\s*:/gi)].map((m) => m[1]));
  const missing = new Set();
  for (const [, name, fallback] of css.matchAll(/var\((--[a-z0-9_-]+)\s*(,)?/gi)) if (!fallback && !defined.has(name)) missing.add(name);
  assert.deepEqual([...missing], []);
});

test('components use tokens, not raw colors (except documented exceptions)', () => {
  const allowed = { 'navigation.css': ['#cbcbcb', '#9a9a9a', '#fff'], 'zcash.css': ['#fff', '#5c5357'] };
  for (const [file, src] of componentFiles) {
    const hexes = [...src.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/#[0-9a-f]{3,8}\b/gi)].map((m) => m[0].toLowerCase());
    const bad = hexes.filter((h) => !(allowed[file] || []).includes(h));
    assert.deepEqual(bad, [], file);
  }
});

test('no box-shadow used as elevation', () => {
  for (const [file, src] of componentFiles) {
    for (const [, value] of src.matchAll(/box-shadow:\s*([^;]+);/g)) {
      assert.ok(/inset|0 0 0|none/.test(value), `${file}: box-shadow ${value}`);
    }
  }
});

test('all classes are prefixed with nui-', () => {
  const selectors = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@layer[^;{]*[;{]/g, '').replace(/url\([^)]*\)/g, '').replace(/"[^"]*"/g, '');
  const classes = new Set([...selectors.matchAll(/\.([a-z_][a-z0-9_-]*)(?=[^{}]*\{)/gi)].map((m) => m[1]));
  const unprefixed = [...classes].filter((c) => !c.startsWith('nui-') && !['is-num', 'woff2'].includes(c) && !/^\d/.test(c));
  assert.deepEqual(unprefixed, []);
});
