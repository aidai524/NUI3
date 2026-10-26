import { Badge, Button, Card, Cluster, Display, Eyebrow, Grid, Lead, Section, Stat, Stats } from '@nui3/react';
import { PRODUCTS, link } from './products/meta';
import { useT } from './settings';

export function Home() {
  const t = useT();
  const appCount = PRODUCTS.filter((product) => product.id !== 'rpc' && product.id !== 'explorer').length;
  return (
    <>
      <section className="nui-shell" style={{ padding: '80px 0 64px' }}>
        <Eyebrow>{t('Noir Protocol · Open ecosystem', 'Noir Protocol · 开放生态')}</Eyebrow>
        <Display size="l" style={{ marginTop: 20, maxWidth: 1000 }}>
          {t('Privacy-native infrastructure.', '隐私原生基础设施。')}<br />{t('Open to build on.', '开放给每位建设者。')}
        </Display>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 40, alignItems: 'end', marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--nui-border)' }}>
          <Lead>{t('Noir brings together confidential execution, public infrastructure, applications and NUI3 — an open UI system for building privacy-native products.', 'Noir 将机密执行、公共基础设施、应用与 NUI3 汇聚在一起；NUI3 是用于构建隐私原生产品的开放 UI 系统。')}</Lead>
          <Stats divided>
            <Stat label={t('Roadmap', '路线图')} value="4" unit={t('phases', '阶段')} />
            <Stat label={t('Applications', '应用')} value={appCount} unit={t('references', '参考')} />
            <Stat label={t('UI packages', 'UI 包')} value="3" unit={t('packages', '个包')} />
          </Stats>
        </div>
        <Cluster gap={8} style={{ marginTop: 40 }}>
          <Button variant="solid" href={link('overview')}>{t('Explore the ecosystem', '探索生态')}</Button>
          <Button href={link('build')}>{t('Build with NUI3', '使用 NUI3 构建')}</Button>
        </Cluster>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 72 }}>
        <Cluster justify="space-between" style={{ marginBottom: 20 }}>
          <div><Eyebrow as="h2">{t('The open stack', '开放技术栈')}</Eyebrow><Display as="h2" size="s" style={{ marginTop: 12 }}>{t('More than a component library.', '不止是一套组件库。')}</Display></div>
          <Button href={link('overview')} arrow={false}>{t('Protocol & vision', '协议与愿景')} →</Button>
        </Cluster>
        <Grid cols={4}>
          {[
            { index: '01', title: t('Applications', '应用'), text: t('Wallets, markets, payments and entirely new products.', '钱包、市场、支付和全新产品。'), href: link('apps') },
            { index: '02', title: 'NUI3', text: t('Composable components, tokens and themes for every builder.', '面向所有建设者的可组合组件、设计变量与主题。'), href: link('build') },
            { index: '03', title: t('Public infrastructure', '公共基础设施'), text: t('Shared explorer, RPC and developer access points.', '共享浏览器、RPC 与开发者访问入口。'), href: link('infrastructure') },
            { index: '04', title: t('Noir + Zcash', 'Noir + Zcash'), text: t('Execution on NEAR, with state anchored to Zcash.', '在 NEAR 上执行，并将状态锚定到 Zcash。'), href: link('overview') },
          ].map((layer) => (
            <Card key={layer.index} interactive>
              <Cluster justify="space-between"><span className="nui-mono nui-text-muted">{layer.index}</span><Badge>{t('Open layer', '开放层')}</Badge></Cluster>
              <h3 className="nui-card__title" style={{ marginTop: 24 }}>{layer.title}</h3>
              <p className="nui-card__desc">{layer.text}</p>
              <a className="nui-card__link nui-card__link--stretched" href={layer.href}>{t('Explore', '了解')} →</a>
            </Card>
          ))}
        </Grid>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 72 }}>
        <Cluster justify="space-between" style={{ marginBottom: 20 }}>
          <div><Eyebrow as="h2">{t('Public infrastructure', '公共基础设施')}</Eyebrow><h2 style={{ margin: '10px 0 0' }}>{t('Shared foundations, not repeated work.', '共享基础能力，避免重复建设。')}</h2></div>
          <Button href={link('infrastructure')} arrow={false}>{t('View infrastructure', '查看基础设施')} →</Button>
        </Cluster>
        <Grid cols={3}>
          {[
            { title: 'Explorer', text: t('Explore transactions, blocks, tokens and cross-chain state.', '查看交易、区块、代币与跨链状态。'), href: link('explorer'), status: t('Prototype', '原型') },
            { title: 'RPC', text: t('Reference interfaces for Zcash RPC, lightwalletd and Noir APIs.', '面向 Zcash RPC、lightwalletd 和 Noir API 的参考界面。'), href: link('rpc'), status: t('Prototype', '原型') },
            { title: 'Indexer', text: t('A planned shared layer for indexed application and network data.', '规划中的共享应用与网络数据索引层。'), href: link('infrastructure'), status: t('Planned', '规划中') },
          ].map((item) => (
            <Card key={item.title} interactive>
              <Cluster justify="space-between"><h3 className="nui-card__title">{item.title}</h3><Badge>{item.status}</Badge></Cluster>
              <p className="nui-card__desc">{item.text}</p>
              <a className="nui-card__link nui-card__link--stretched" href={item.href}>{t('Learn more', '了解更多')} →</a>
            </Card>
          ))}
        </Grid>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 80 }}>
        <Cluster justify="space-between" style={{ marginBottom: 20 }}>
          <div><Eyebrow as="h2">{t('Apps · organised by phase', '应用 · 按阶段组织')}</Eyebrow><Display as="h2" size="s" style={{ marginTop: 12 }}>{t('See what the ecosystem can become.', '看见生态可以成为的样子。')}</Display></div>
          <Button href={link('apps')} arrow={false}>{t('All apps & phases', '全部应用与阶段')} →</Button>
        </Cluster>
        <Grid cols={3}>
          {(['wallet', 'dex', 'lending'] as const).map((id) => {
            const product = PRODUCTS.find((item) => item.id === id)!;
            return (
              <Card key={id} interactive>
                <Cluster justify="space-between"><h3 className="nui-card__title">{t(product.name.en, product.name.zh)}</h3><Badge>Phase {product.phase}</Badge></Cluster>
                <p className="nui-card__desc">{t(product.tagline.en, product.tagline.zh)}</p>
                <p className="nui-text-small nui-text-secondary">{t('Interactive prototype · Sample data', '可交互原型 · 示例数据')}</p>
                <a className="nui-card__link nui-card__link--stretched" href={link('apps', id)}>{t('View application', '查看应用')} →</a>
              </Card>
            );
          })}
        </Grid>
      </section>

      <Section tone="plum">
        <Eyebrow accent>{t('Build · Extend · Contribute', '构建 · 扩展 · 贡献')}</Eyebrow>
        <Display as="h2" size="m" style={{ margin: '16px 0 24px', color: 'inherit', maxWidth: 850 }}>{t('Take the foundations. Make something of your own.', '使用开放底座，构建自己的产品。')}</Display>
        <Lead>{t('Start with production-minded components, adapt the design language, connect your infrastructure and contribute what you learn back to the ecosystem.', '从面向生产的组件开始，适配设计语言，连接自己的基础设施，并将经验贡献回生态。')}</Lead>
        <Cluster style={{ marginTop: 32 }}>
          <Button href={link('build')}>{t('Start building', '开始构建')}</Button>
          <Button href={link('extend')}>{t('Extend NUI3', '扩展 NUI3')}</Button>
          <Button href={link('contribute')}>{t('Contribute', '参与贡献')}</Button>
        </Cluster>
      </Section>
    </>
  );
}
