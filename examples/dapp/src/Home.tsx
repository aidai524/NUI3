import { Badge, Button, Card, Cluster, Display, Eyebrow, Grid, Lead, Section } from '@nui3/react';
import { PRODUCTS, link } from './products/meta';
import { useT } from './settings';

export function Home() {
  const t = useT();
  const stack = [
    {
      index: '01',
      title: t('Applications', '应用层'),
      description: t('Create wallets, markets, payments and new privacy-native products.', '构建钱包、市场、支付和新的隐私原生产品。'),
      action: t('Explore Apps', '探索应用'),
      href: link('apps'),
    },
    {
      index: '02',
      title: 'NUI3',
      description: t('Compose accessible interfaces with open tokens, CSS and React components.', '使用开放设计变量、CSS 和 React 组件组合无障碍界面。'),
      action: t('Start building', '开始构建'),
      href: link('build'),
    },
    {
      index: '03',
      title: t('Public infrastructure', '公共基础设施'),
      description: t('Connect through shared Explorer, RPC and planned indexing services.', '通过共享 Explorer、RPC 和规划中的索引服务连接网络。'),
      action: t('View infrastructure', '查看基础设施'),
      href: link('infrastructure'),
    },
    {
      index: '04',
      title: t('Noir execution', 'Noir 执行层'),
      description: t('Build application logic for confidential execution on NEAR.', '基于 NEAR 上的机密执行构建应用逻辑。'),
      action: t('Understand Noir', '了解 Noir'),
      href: link('overview'),
    },
    {
      index: '05',
      title: t('Zcash anchor', 'Zcash 锚定层'),
      description: t('Anchor state to Zcash and make transitions between privacy levels explicit.', '将状态锚定到 Zcash，并明确呈现不同隐私级别之间的转换。'),
      action: t('Protocol overview', '协议概览'),
      href: link('overview'),
    },
  ];

  return (
    <>
      <section className="nui-shell" style={{ padding: '88px 0 72px' }}>
        <Eyebrow>{t('Noir Protocol · Mission & open ecosystem', 'Noir Protocol · 使命与开放生态')}</Eyebrow>
        <Display size="l" className="nui-home-hero" style={{ marginTop: 24, maxWidth: 1120 }}>
          {t('A private financial future.', '隐私金融的未来。')}<br />{t('Built in the open.', '由开放生态共同构建。')}
        </Display>
        <div style={{ maxWidth: 760, marginTop: 36 }}>
          <Lead>{t('Noir exists to make confidentiality useful in everyday finance — and to give builders the shared infrastructure, application layer and open UI system needed to create it.', 'Noir 的使命是让机密能力真正服务于日常金融，并为建设者提供实现这一目标所需的共享基础设施、应用层和开放 UI 系统。')}</Lead>
        </div>
        <Cluster gap={8} style={{ marginTop: 40 }}>
          <Button variant="solid" href={link('build')}>{t('Build on Noir', '基于 Noir 构建')}</Button>
          <Button href={link('overview')}>{t('Our mission & technology', '使命与技术')}</Button>
        </Cluster>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 40px', marginTop: 64, padding: '20px 0', borderTop: '1px solid var(--nui-border)', borderBottom: '1px solid var(--nui-border)' }} className="nui-text-small nui-text-secondary">
          <span><strong className="nui-text-primary">NOIR</strong> · {t('Confidential execution', '机密执行')}</span>
          <span><strong className="nui-text-primary">NEAR</strong> · {t('Execution environment', '执行环境')}</span>
          <span><strong className="nui-text-primary">ZCASH</strong> · {t('State anchor', '状态锚定')}</span>
          <span><strong className="nui-text-primary">NUI3</strong> · {t('Open application UI', '开放应用 UI')}</span>
        </div>
      </section>

      <section className="nui-shell" style={{ padding: '16px 0 96px' }}>
        <Grid cols={2}>
          <div style={{ borderTop: '2px solid var(--nui-text)', paddingTop: 20 }}>
            <Eyebrow as="h2">01 · {t('Our mission', '我们的使命')}</Eyebrow>
            <Display as="h2" size="s" style={{ margin: '20px 0' }}>{t('Make privacy usable in every financial application.', '让每款金融应用都能真正使用隐私能力。')}</Display>
            <Lead>{t('Turn complex privacy infrastructure into understandable choices and composable building blocks — without hiding where protection begins or ends.', '把复杂的隐私基础设施转化为可理解的选择和可组合的构建模块，同时明确保护的边界。')}</Lead>
          </div>
          <div style={{ borderTop: '2px solid var(--nui-text)', paddingTop: 20 }}>
            <Eyebrow as="h2">02 · {t('Our vision', '我们的愿景')}</Eyebrow>
            <Display as="h2" size="s" style={{ margin: '20px 0' }}>{t('An open economy built by many, not one closed product.', '由众多建设者共同构建的开放经济，而非一个封闭产品。')}</Display>
            <Lead>{t('Grow a shared ecosystem where independent teams can launch applications, extend common infrastructure and contribute better tools back to everyone.', '建设共享生态，让独立团队能够发布应用、扩展公共基础设施，并将更好的工具回馈给整个社区。')}</Lead>
          </div>
        </Grid>
      </section>

      <Section tone="navy">
        <div style={{ maxWidth: 820 }}>
          <Eyebrow accent>{t('Technology · Why build on Noir', '技术 · 为什么基于 Noir 构建')}</Eyebrow>
          <Display as="h2" size="m" style={{ margin: '16px 0 24px', color: 'inherit' }}>{t('One connected stack. Five places to create.', '一套互联技术栈，五个建设入口。')}</Display>
          <Lead>{t('You do not need to rebuild the ecosystem to join it. Start at the application, interface or infrastructure layer — and connect to the same protocol foundation.', '加入生态无需从零重建一切。你可以从应用、界面或基础设施层开始，并连接到同一个协议底座。')}</Lead>
        </div>

        <div style={{ margin: '48px 0 32px', borderTop: '1px solid var(--nui-border)' }}>
          {stack.map((layer) => (
            <a key={layer.index} href={layer.href} className="nui-home-stack-row">
              <span className="nui-mono nui-text-secondary">{layer.index}</span>
              <strong>{layer.title}</strong>
              <span className="nui-text-secondary">{layer.description}</span>
              <span className="nui-home-stack-link">{layer.action} →</span>
            </a>
          ))}
        </div>

        <Grid cols={3}>
          {[
            { title: t('Confidential by design', '以机密能力为起点'), text: t('Design applications around explicit shielded, confidential and public states.', '围绕明确的 shielded、confidential 和 public 状态设计应用。') },
            { title: t('Connected to Zcash', '连接 Zcash'), text: t('Build on a model that executes on NEAR and anchors state to Zcash.', '基于在 NEAR 执行、将状态锚定到 Zcash 的模型构建。') },
            { title: t('Composable for builders', '为建设者而组合'), text: t('Reuse interfaces and shared infrastructure while keeping your own product identity.', '复用界面与共享基础设施，同时保持自己的产品身份。') },
          ].map((item) => (
            <div key={item.title} style={{ borderTop: '1px solid var(--nui-border)', paddingTop: 18 }}>
              <h3 className="nui-panel__title">{item.title}</h3>
              <p className="nui-text-secondary nui-text-small">{item.text}</p>
            </div>
          ))}
        </Grid>
      </Section>

      <section className="nui-shell" style={{ padding: '88px 0' }}>
        <Cluster justify="space-between" style={{ marginBottom: 28 }}>
          <div style={{ maxWidth: 760 }}>
            <Eyebrow as="h2">{t('The application ecosystem', '应用生态')}</Eyebrow>
            <Display as="h2" size="s" style={{ marginTop: 14 }}>{t('Not one product. Many possibilities.', '不止一个产品，而是更多可能。')}</Display>
          </div>
          <Button href={link('apps')} arrow={false}>{t('All apps & phases', '全部应用与阶段')} →</Button>
        </Cluster>
        <Grid cols={3}>
          {(['wallet', 'dex', 'lending'] as const).map((id) => {
            const product = PRODUCTS.find((item) => item.id === id)!;
            return (
              <Card key={id} interactive>
                <Cluster justify="space-between"><Badge>Phase {product.phase}</Badge><Badge>{t('Prototype', '原型')}</Badge></Cluster>
                <h3 className="nui-card__title" style={{ marginTop: 20 }}>{t(product.name.en, product.name.zh)}</h3>
                <p className="nui-card__desc">{t(product.tagline.en, product.tagline.zh)}</p>
                <a className="nui-card__link nui-card__link--stretched" href={link('apps', id)}>{t('View application', '查看应用')} →</a>
              </Card>
            );
          })}
        </Grid>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 96 }}>
        <Eyebrow as="h2">{t('Choose where you contribute', '选择你的建设入口')}</Eyebrow>
        <Grid cols={3} style={{ marginTop: 24 }}>
          {[
            { index: 'A', title: t('Build an application', '构建应用'), text: t('Start with NUI3 components and complete application references.', '从 NUI3 组件和完整应用参考开始。'), action: t('Open Build', '进入构建'), href: link('build') },
            { index: 'B', title: t('Extend the system', '扩展系统'), text: t('Create themes, components and adapters for your own infrastructure.', '为自己的基础设施创建主题、组件和适配器。'), action: t('Open Extend', '进入扩展'), href: link('extend') },
            { index: 'C', title: t('Shape the ecosystem', '共建生态'), text: t('Contribute code, propose RFCs and improve the shared roadmap.', '贡献代码、提出 RFC 并完善共享路线图。'), action: t('Open Contribute', '参与贡献'), href: link('contribute') },
          ].map((item) => (
            <Card key={item.index} interactive>
              <span className="nui-mono nui-text-muted">{item.index}</span>
              <h3 className="nui-card__title" style={{ marginTop: 20 }}>{item.title}</h3>
              <p className="nui-card__desc">{item.text}</p>
              <a className="nui-card__link nui-card__link--stretched" href={item.href}>{item.action} →</a>
            </Card>
          ))}
        </Grid>
      </section>

      <Section tone="plum">
        <Eyebrow accent>{t('Noir is built to be built on', 'Noir 为开放建设而生')}</Eyebrow>
        <Display as="h2" size="m" style={{ margin: '16px 0 24px', color: 'inherit', maxWidth: 900 }}>{t('The next privacy-native application can start with you.', '下一款隐私原生应用，可以从你开始。')}</Display>
        <Cluster style={{ marginTop: 32 }}>
          <Button href={link('build')}>{t('Start building', '开始构建')}</Button>
          <Button href={link('ecosystem')}>{t('Explore the ecosystem', '探索生态')}</Button>
        </Cluster>
      </Section>

      <style>{`
        .nui-home-stack-row{display:grid;grid-template-columns:48px minmax(150px,.75fr) minmax(260px,1.6fr) auto;gap:24px;align-items:center;padding:24px 0;border-bottom:1px solid var(--nui-border);color:inherit;text-decoration:none}
        .nui-home-stack-link{font-size:13px;font-weight:600;white-space:nowrap}
        @media(max-width:800px){.nui-home-stack-row{grid-template-columns:36px minmax(0,1fr);gap:8px 12px}.nui-home-stack-row>.nui-text-secondary:not(.nui-mono){grid-column:2}.nui-home-stack-link{grid-column:2;font-size:12px;white-space:normal}}
        @media(max-width:600px){.nui-home-hero{font-size:34px;line-height:1.1}}
      `}</style>
    </>
  );
}
