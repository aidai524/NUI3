import { Suspense, lazy, useEffect } from 'react';
import { Brand, Button, Footer, Header, Segmented, Skeleton, Shell, defineTheme, type NavItem } from '@nui3/react';
import { useRoute } from './router';
import { useSettings, useT, type Lang, type ThemeChoice } from './settings';
import { GROUPS, PRODUCTS, link, productById, type GroupId, type ProductId } from './products/meta';
import { REGISTRY } from './products/registry';
import { Home } from './Home';

const Docs = lazy(() => import('./docs'));

// A product theme built on `night`: only the accent changes, everything else is inherited.
const jade = defineTheme({ name: 'jade', extends: 'night', tokens: { accent: '#7ee0c3', 'accent-hover': '#5fcfae', 'accent-text': '#7ee0c3', 'focus-ring': '#7ee0c3', 'chart-1': '#7ee0c3' } });

// Old single-page routes kept working.
const ALIASES: Record<string, string[]> = { swap: ['dex'], lend: ['lending'], tx: ['explorer', 'tx'] };

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
        options={[{ value: 'paper', label: compact ? t('Paper', '纸白') : t('Paper', '纸白') }, { value: 'night', label: t('Night', '暗夜') }, { value: 'jade', label: t('Custom', '自定义') }]}
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

  const nav: NavItem[] = [
    ...(Object.keys(GROUPS) as GroupId[]).map((g) => ({
      label: GROUPS[g][lang],
      href: link(),
      children: PRODUCTS.filter((x) => x.group === g).map((x) => ({ label: x.name[lang], description: x.tagline[lang], href: link(x.id), current: x.id === product })),
    })),
    { label: t('Docs', '文档'), href: link('docs'), current: head === 'docs' },
  ];

  const title = product ? productById(product)!.name[lang] : head === 'docs' ? t('Docs', '文档') : t('Home', '首页');
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
            <Button variant="outline" size="sm" href={link('wallet')}>{t('Wallet', '钱包')}</Button>
          </>
        }
        mobileActions={<div className="nui-stack" style={{ gap: 12, width: '100%' }}><Settings compact /></div>}
      />

      <main>
        <Suspense fallback={fallback}>
          {Product ? <Product path={rest} /> : head === 'docs' ? <Docs path={rest} /> : <Home />}
        </Suspense>
      </main>

      <Footer
        tagline={t('Example app for the NUI3 component kit. Sample data only.', 'NUI3 组件库示例应用，数据均为示例。')}
        columns={(['trade', 'earn', 'assets', 'build'] as GroupId[]).map((g) => ({
          title: GROUPS[g][lang],
          links: PRODUCTS.filter((x) => x.group === g || (g === 'assets' && x.group === 'pay')).map((x) => ({ label: x.name[lang], href: link(x.id) })),
        }))}
        legal={`© 2026 Noir · ${t('Sample data only', '仅示例数据')}`}
      />
    </>
  );
}
