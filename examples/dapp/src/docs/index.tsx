import { useMemo, useState } from 'react';
import { Badge, Button, Card, Cluster, CodeBlock, DataTable, Display, Drawer, Eyebrow, Grid, Lead, SearchInput, Shell } from '@nui3/react';
import manifest from '../../../../docs/components.json';
import { link } from '../products/meta';
import { useT } from '../settings';
import { demos } from './demos';
import { GUIDES, GuideCards, GuidePage, type GuideId } from './guides';

type Entry = (typeof manifest.components)[number];
const groups = [...new Set(manifest.components.map((c) => c.group))];

function Sidebar({ current, onNavigate }: { current?: string; onNavigate?: () => void }) {
  const t = useT();
  const [q, setQ] = useState('');
  return (
    <div className="nui-stack" style={{ gap: 16 }}>
      <SearchInput label={t('Search components', '搜索组件')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} shortcut={false} />
      {(!q || Object.keys(GUIDES).some((id) => id.includes(q.toLowerCase()))) && (
        <div>
          <div className="nui-eyebrow" style={{ fontSize: 11, marginBottom: 8 }}>{t('Guides', '使用指南')}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
            {(Object.entries(GUIDES) as Array<[GuideId, (typeof GUIDES)[GuideId]]>).map(([id, guide]) => (
              <li key={id}>
                <a
                  href={link('docs', id)}
                  onClick={onNavigate}
                  style={{ display: 'block', padding: '6px 10px', fontSize: 14, color: id === current ? 'var(--nui-accent-text)' : 'var(--nui-text-secondary)', borderLeft: id === current ? '2px solid var(--nui-accent)' : '2px solid transparent', textDecoration: 'none', background: id === current ? 'var(--nui-surface-sunken)' : undefined }}
                >
                  {t(guide.title, guide.zh)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {groups.map((g) => {
        const items = manifest.components.filter((c) => c.group === g && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
        if (!items.length) return null;
        return (
          <div key={g}>
            <div className="nui-eyebrow" style={{ fontSize: 11, marginBottom: 8 }}>{g}</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
              {items.map((c) => (
                <li key={c.name}>
                  <a
                    href={link('docs', c.name)}
                    onClick={onNavigate}
                    style={{ display: 'block', padding: '6px 10px', fontSize: 14, color: c.name === current ? 'var(--nui-accent-text)' : 'var(--nui-text-secondary)', borderLeft: c.name === current ? '2px solid var(--nui-accent)' : '2px solid transparent', textDecoration: 'none', background: c.name === current ? 'var(--nui-surface-sunken)' : undefined }}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Index() {
  const t = useT();
  return (
    <>
      <Eyebrow>NUI3 · {manifest.components.length} {t('components', '个组件')}</Eyebrow>
      <Display size="s" style={{ margin: '14px 0' }}>{t('Build a Zcash app in an afternoon.', '一个下午搭出 Zcash 应用。')}</Display>
      <Lead>{t('Tokens, CSS and React components with themes, i18n and live-data primitives. Click any component for a live demo, props and usage.', '设计变量、CSS 与 React 组件，内置主题、国际化和实时数据原语。点击任意组件查看演示、属性和用法。')}</Lead>
      <GuideCards />
      <div style={{ marginTop: 28 }}>
        <CodeBlock language="bash" code={`git clone https://github.com/aidai524/NUI3.git\ncd NUI3 && pnpm install && pnpm build\n\n// app root\nimport '@nui3/css';\nimport { ThemeProvider, ToastProvider } from '@nui3/react';`} />
      </div>
      <Grid cols={3} style={{ marginTop: 32 }}>
        {groups.map((g) => (
          <Card key={g} interactive>
            <Cluster justify="space-between">
              <h3 className="nui-card__title" style={{ fontSize: 20 }}>{g}</h3>
              <Badge>{manifest.components.filter((c) => c.group === g).length}</Badge>
            </Cluster>
            <p className="nui-card__desc">{manifest.components.filter((c) => c.group === g).slice(0, 5).map((c) => c.name.split(' / ')[0]).join(' · ')}</p>
            <a className="nui-card__link" href={link('docs', manifest.components.find((c) => c.group === g)!.name)}>{t('Browse', '浏览')} →</a>
          </Card>
        ))}
      </Grid>
      <div style={{ marginTop: 32 }}>
        <CodeBlock
          title={t('Theming & i18n', '主题与国际化')}
          language="tsx"
          code={`// Theme + density + locale are independent\n<LocaleProvider locale="zh">\n  <ThemeProvider theme="night" density="compact" tokens={{ accent: '#7ee0c3' }}>\n    <App />\n  </ThemeProvider>\n</LocaleProvider>\n\n// Or plain CSS\n[data-nui-theme="night"] { --nui-accent: #7ee0c3; }`}
        />
      </div>
    </>
  );
}

function ComponentPage({ entry }: { entry: Entry }) {
  const t = useT();
  const demo = demos[entry.name];
  const idx = manifest.components.findIndex((c) => c.name === entry.name);
  const prev = manifest.components[idx - 1];
  const next = manifest.components[idx + 1];
  const props = Object.entries(entry.props ?? {});
  return (
    <>
      <Cluster gap={4}><Badge>{entry.group}</Badge>{entry.cssClass && <code className="nui-mono nui-text-muted">.{entry.cssClass}</code>}</Cluster>
      <Display size="s" style={{ margin: '12px 0' }}>{entry.name}</Display>
      <Lead>{entry.description}</Lead>

      <section style={{ marginTop: 28 }}>
        <Eyebrow as="h2" style={{ marginBottom: 12 }}>{t('Live demo', '在线演示')}</Eyebrow>
        <div style={{ border: '1px solid var(--nui-border)', background: 'var(--nui-surface)', padding: 24, overflowX: 'auto' }}>
          {demo ? demo() : <p className="nui-text-muted">{t('No visual demo for this utility.', '该工具函数没有可视化演示。')}</p>}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <Eyebrow as="h2" style={{ marginBottom: 12 }}>{t('Usage', '用法')}</Eyebrow>
        <CodeBlock language="tsx" code={`import { ${entry.name.split(' / ')[0]} } from '@nui3/react';\n\n${entry.example}`} />
      </section>

      {props.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <Eyebrow as="h2" style={{ marginBottom: 12 }}>Props</Eyebrow>
          <DataTable rows={props.map(([name, type]) => ({ name, type }))} rowKey={(r) => r.name} columns={[{ key: 'name', header: 'Prop', cell: (r) => <code className="nui-mono">{r.name}</code> }, { key: 'type', header: t('Type / signature', '类型 / 签名'), cell: (r) => r.type }]} />
        </section>
      )}

      <Cluster justify="space-between" style={{ marginTop: 32 }}>
        {prev ? <Button href={link('docs', prev.name)} arrow={false}>← {prev.name}</Button> : <span />}
        {next && <Button href={link('docs', next.name)}>{next.name}</Button>}
      </Cluster>
    </>
  );
}

export default function Docs({ path }: { path: string[] }) {
  const t = useT();
  const [navOpen, setNavOpen] = useState(false);
  const name = path[0] ? decodeURIComponent(path[0]) : undefined;
  const guide = name && name in GUIDES ? name as GuideId : undefined;
  const entry = useMemo(() => manifest.components.find((c) => c.name === name), [name]);
  return (
    <Shell style={{ padding: '40px 0 96px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'start' }}>
        <aside className="nui-docs-sidebar" style={{ flex: '0 0 240px', position: 'sticky', top: 110, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          <Sidebar current={name} />
        </aside>
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>
          <div className="nui-docs-mobilebar" style={{ marginBottom: 20 }}>
            <Button variant="outline" size="sm" onClick={() => setNavOpen(true)}>{t('All components', '全部组件')}</Button>
          </div>
          {guide ? <GuidePage id={guide} /> : entry ? <ComponentPage entry={entry} /> : <Index />}
        </div>
      </div>
      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title={t('Components', '组件')} side="left">
        <Sidebar current={name} onNavigate={() => setNavOpen(false)} />
      </Drawer>
      <style>{`@media(max-width:1080px){.nui-docs-sidebar{display:none}}@media(min-width:1081px){.nui-docs-mobilebar{display:none}}`}</style>
    </Shell>
  );
}
