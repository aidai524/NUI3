import { Suspense, lazy, useEffect } from 'react';
import { Brand, Button, Footer, Header, Segmented, Skeleton, Shell, defineTheme, type NavItem } from '@nui3/react';
import { useRoute } from './router';
import { useSettings, useT, type Lang, type ThemeChoice } from './settings';
import { PRODUCTS, link, productById, type ProductId } from './products/meta';
import { REGISTRY } from './products/registry';
import { Home } from './Home';
import type { PortalSection } from './Ecosystem';

const Docs = lazy(() => import('./docs'));
const Portal = lazy(() => import('./Ecosystem'));

// A product theme built on `night`: only the accent changes, everything else is inherited.
const jade = defineTheme({ name: 'jade', extends: 'night', tokens: { accent: '#7ee0c3', 'accent-hover': '#5fcfae', 'accent-text': '#7ee0c3', 'focus-ring': '#7ee0c3', 'chart-1': '#7ee0c3' } });

// Old single-page routes kept working.
const ALIASES: Record<string, string[]> = { swap: ['dex'], lend: ['lending'], tx: ['explorer', 'tx'] };
const PORTAL_SECTIONS: PortalSection[] = ['overview', 'infrastructure', 'apps', 'build', 'extend', 'ecosystem', 'contribute'];
const REPOSITORY = 'https://github.com/aidai524/NUI3';

function Settings({ compact }: { compact?: boolean }) {
  const { lang, setLang, theme, setTheme } = useSettings();
  const t = useT();
  return (
    <>
      <Segmented aria-label={t('Language', '语言')} value={lang} onChange={(v) => setLang(v as Lang)} options={[{ value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }]} />
      <Segmented
        aria-label={t('Theme', '主题')}
        value={theme}
        onChange={(v) => setTheme(v as ThemeChoice)}
        options={[{ value: 'paper', label: t('Paper', '纸白') }, { value: 'night', label: t('Night', '暗夜') }, { value: 'jade', label: t('Custom', '自定义') }]}
      />
    </>
  );
}

export function App() {
  const { lang } = useSettings();
  const t = useT();
  const raw = useRoute();
  const segments = ALIASES[raw[0] ?? ''] ? [...ALIASES[raw[0]!]!, ...raw.slice(1)] : raw;
  const [head, ...rest] = segments;
  const product = head && productById(head) ? (head as ProductId) : null;
  const portal = PORTAL_SECTIONS.includes(head as PortalSection) ? head as PortalSection : null;
  const apps = PRODUCTS.filter((item) => item.id !== 'rpc' && item.id !== 'explorer').sort((a, b) => a.priority - b.priority);

  const nav: NavItem[] = [
    { label: t('Overview', '概览'), href: link('overview'), current: portal === 'overview' },
    { label: t('Public Infrastructure', '公共基础设施'), href: link('infrastructure'), current: portal === 'infrastructure' },
    {
      label: t('Apps', '应用'),
      href: link('apps'),
      current: portal === 'apps',
      children: apps.map((item) => ({ label: item.name[lang], description: `${t('Phase', '阶段')} ${item.phase} · ${item.tagline[lang]}`, href: link('apps', item.id), current: portal === 'apps' && rest[0] === item.id })),
    },
    {
      label: t('Build', '构建'),
      href: link('build'),
      current: portal === 'build' || head === 'docs',
      children: [
        { label: t('Build overview', '构建概览'), description: t('Components, tokens, themes and templates.', '组件、设计变量、主题和模板。'), href: link('build'), current: portal === 'build' },
        { label: t('Getting started', '快速开始'), description: t('Install and compose your first app.', '安装并组合第一个应用。'), href: link('docs', 'getting-started') },
        { label: t('Component docs', '组件文档'), description: t('Live demos, props and usage.', '在线演示、属性和用法。'), href: link('docs'), current: head === 'docs' && !rest.length },
        { label: t('AI integration', 'AI 接入'), description: t('Rules, manifests and agent workflows.', '规则、清单和代理工作流。'), href: link('docs', 'ai-integration') },
      ],
    },
    { label: t('Extend', '扩展'), href: link('extend'), current: portal === 'extend' },
    { label: t('Ecosystem', '生态'), href: link('ecosystem'), current: portal === 'ecosystem' },
    { label: t('Contribute', '贡献'), href: link('contribute'), current: portal === 'contribute' },
  ];

  const portalTitles: Record<PortalSection, string> = {
    overview: t('Overview', '概览'),
    infrastructure: t('Public Infrastructure', '公共基础设施'),
    apps: t('Apps', '应用'),
    build: t('Build', '构建'),
    extend: t('Extend', '扩展'),
    ecosystem: t('Ecosystem', '生态'),
    contribute: t('Contribute', '贡献'),
  };
  const appDetail = portal === 'apps' && rest[0] ? productById(rest[0]) : undefined;
  const title = product ? productById(product)!.name[lang] : head === 'docs' ? t('Docs', '文档') : appDetail ? appDetail.name[lang] : portal ? portalTitles[portal] : t('Home', '首页');
  useEffect(() => {
    document.title = `${title} · Noir — NUI3`;
  }, [title]);

  const Product = product ? REGISTRY[product] : null;
  const fallback = (
    <Shell style={{ padding: '56px 0' }}>
      <Skeleton width={240} height={36} />
      <Skeleton width="100%" height={320} style={{ marginTop: 24 }} />
    </Shell>
  );

  return (
    <>
      <style>{jade.css}</style>
      <Header
        sticky
        bordered
        brand={<Brand name="Noir" sub="NUI3" href={link()} />}
        nav={nav}
        menuLabel={t('Menu', '菜单')}
        actions={
          <>
            <span className="nui-hide-mobile" style={{ display: 'contents' }}><Settings /></span>
            <Button variant="outline" size="sm" href={REPOSITORY}>GitHub</Button>
          </>
        }
        mobileActions={<div className="nui-stack" style={{ gap: 12, width: '100%' }}><Settings compact /></div>}
      />

      <main>
        <Suspense fallback={fallback}>
          {Product ? <Product path={rest} /> : head === 'docs' ? <Docs path={rest} /> : portal ? <Portal section={portal} path={rest} /> : <Home />}
        </Suspense>
      </main>

      <Footer
        tagline={t('An open ecosystem for privacy-native applications. NUI3 reference interfaces use sample data only.', '面向隐私原生应用的开放生态。NUI3 参考界面仅使用示例数据。')}
        columns={[
          {
            title: t('Discover', '探索'),
            links: [
              { label: t('Overview', '概览'), href: link('overview') },
              { label: t('Public Infrastructure', '公共基础设施'), href: link('infrastructure') },
              { label: t('Apps & Phases', '应用与阶段'), href: link('apps') },
              { label: t('Ecosystem', '生态'), href: link('ecosystem') },
            ],
          },
          {
            title: t('Develop', '开发'),
            links: [
              { label: t('Build', '构建'), href: link('build') },
              { label: t('Extend', '扩展'), href: link('extend') },
              { label: t('Documentation', '使用文档'), href: link('docs') },
              { label: t('AI Integration', 'AI 接入'), href: link('docs', 'ai-integration') },
            ],
          },
          {
            title: t('Participate', '参与'),
            links: [
              { label: t('Contribute', '贡献'), href: link('contribute') },
              { label: 'GitHub', href: REPOSITORY },
              { label: t('Issues & RFCs', 'Issue 与 RFC'), href: `${REPOSITORY}/issues` },
              { label: t('Roadmap', '路线图'), href: link('overview') },
            ],
          },
        ]}
        legal={`© 2026 Noir · ${t('Open ecosystem · Sample data only', '开放生态 · 仅示例数据')}`}
      />
    </>
  );
}
