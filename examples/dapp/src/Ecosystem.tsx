import { useState } from 'react';
import { Alert, Badge, Button, Card, ChipGroup, Cluster, CodeBlock, Display, Eyebrow, Grid, KeyValue, Lead, Section, Shell, Timeline } from '@nui3/react';
import { PRODUCTS, link, productById, type ProductMeta } from './products/meta';
import { useSettings, useT } from './settings';

export type PortalSection = 'overview' | 'infrastructure' | 'apps' | 'build' | 'extend' | 'ecosystem' | 'contribute';

const REPOSITORY = 'https://github.com/aidai524/NUI3';
const APP_PRODUCTS = PRODUCTS.filter((product) => product.id !== 'explorer' && product.id !== 'rpc');
const INFRA_PRODUCTS = PRODUCTS.filter((product) => product.id === 'explorer' || product.id === 'rpc');

const PHASES = [
  { id: 1, title: { en: 'Asset foundations', zh: '资产基础' }, description: { en: 'Wallet, bridging, token deployment, exploration and exchange.', zh: '钱包、跨链、代币部署、浏览器与兑换。' } },
  { id: 2, title: { en: 'Markets & risk', zh: '市场与风险' }, description: { en: 'Lending, perpetual markets and prediction interfaces.', zh: '借贷、永续市场与预测市场界面。' } },
  { id: 3, title: { en: 'Developer & payment scale', zh: '开发者与支付扩展' }, description: { en: 'Public APIs, RPC access and shielded payroll.', zh: '公共 API、RPC 访问与屏蔽工资支付。' } },
  { id: 4, title: { en: 'New asset markets', zh: '新资产市场' }, description: { en: 'NFT trading and token launch experiences.', zh: 'NFT 交易与代币发行体验。' } },
] as const;

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: string }) {
  return (
    <div style={{ maxWidth: 860, marginBottom: 48 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Display size="s" style={{ margin: '16px 0 20px' }}>{title}</Display>
      <Lead>{children}</Lead>
    </div>
  );
}

function Status({ planned = false }: { planned?: boolean }) {
  const t = useT();
  return <Badge>{planned ? t('Planned', '规划中') : t('Prototype', '原型')}</Badge>;
}

function AppCard({ product }: { product: ProductMeta }) {
  const { lang } = useSettings();
  const t = useT();
  return (
    <Card interactive>
      <Cluster justify="space-between" style={{ alignItems: 'start' }}>
        <h3 className="nui-card__title">{product.name[lang]}</h3>
        <Status />
      </Cluster>
      <p className="nui-card__desc">{product.tagline[lang]}</p>
      <div className="nui-card__foot">
        <ul className="nui-card__tags">
          <li>Phase {product.phase}</li>
          {product.pages.filter((page) => !page.hidden).slice(0, 2).map((page) => <li key={page.id}>{page.label[lang]}</li>)}
        </ul>
        <a className="nui-card__link nui-card__link--stretched" href={link('apps', product.id)}>{t('View app', '查看应用')} →</a>
      </div>
    </Card>
  );
}

function Overview() {
  const t = useT();
  return (
    <>
      <PageIntro eyebrow={t('Overview · Noir Protocol', '概览 · Noir Protocol')} title={t('An open ecosystem for privacy-native finance.', '面向隐私原生金融的开放生态。')}>
        {t('Noir explores confidential execution anchored to Zcash, with shared infrastructure, composable applications and an open UI system for builders.', 'Noir 探索锚定 Zcash 的机密执行，并通过共享基础设施、可组合应用和开放 UI 系统支持生态建设者。')}
      </PageIntro>

      <Grid cols={2}>
        <Card>
          <Eyebrow as="h2">{t('Protocol', '协议')}</Eyebrow>
          <h3 className="nui-card__title" style={{ marginTop: 16 }}>{t('Confidential execution, anchored to Zcash.', '机密执行，锚定 Zcash。')}</h3>
          <p className="nui-card__desc">{t('Execution runs on NEAR and state is anchored to Zcash. The model is explicitly not presented as a ZK rollup.', '执行在 NEAR 上进行，状态锚定到 Zcash。该模型明确不等同于 ZK Rollup。')}</p>
        </Card>
        <Card>
          <Eyebrow as="h2">{t('Mission & vision', '使命与愿景')}</Eyebrow>
          <h3 className="nui-card__title" style={{ marginTop: 16 }}>{t('Make privacy useful, composable and open.', '让隐私能力实用、可组合且开放。')}</h3>
          <p className="nui-card__desc">{t('Give users clearer privacy choices and give developers shared foundations for building wallets, markets, payments and new applications.', '让用户更清楚地选择隐私级别，让开发者通过共享底座构建钱包、市场、支付和新型应用。')}</p>
        </Card>
      </Grid>

      <section style={{ marginTop: 64 }}>
        <Eyebrow as="h2">{t('Technology stack', '技术栈')}</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '14px 0 28px' }}>{t('One stack, multiple places to build.', '一套技术栈，多种建设方式。')}</Display>
        <Grid cols={4}>
          {[
            ['01', t('Applications', '应用'), t('Wallets, markets, payments and third-party products.', '钱包、市场、支付和第三方产品。')],
            ['02', 'NUI3', t('Open tokens, CSS, React components and product references.', '开放设计变量、CSS、React 组件和产品参考。')],
            ['03', t('Public infrastructure', '公共基础设施'), t('Explorer, RPC and shared developer access.', '浏览器、RPC 和共享开发者访问能力。')],
            ['04', t('Protocol & Zcash', '协议与 Zcash'), t('Noir execution on NEAR, with state anchored to Zcash.', 'Noir 在 NEAR 上执行，并将状态锚定到 Zcash。')],
          ].map(([index, title, description]) => (
            <Card key={index}>
              <span className="nui-mono nui-text-muted">{index}</span>
              <h3 className="nui-card__title" style={{ marginTop: 20 }}>{title}</h3>
              <p className="nui-card__desc">{description}</p>
            </Card>
          ))}
        </Grid>
      </section>

      <section style={{ marginTop: 64 }}>
        <Cluster justify="space-between" style={{ marginBottom: 20 }}>
          <div><Eyebrow as="h2">{t('Roadmap', '路线图')}</Eyebrow><h2 style={{ margin: '10px 0 0' }}>{t('Four phases, connected through Apps.', '四个阶段，在 Apps 中持续关联。')}</h2></div>
          <Button href={link('apps')}>{t('Explore apps', '浏览应用')}</Button>
        </Cluster>
        <Grid cols={2}>
          {PHASES.map((phase) => (
            <Card key={phase.id}>
              <Cluster justify="space-between"><Badge>Phase {phase.id}</Badge><span className="nui-text-small nui-text-muted">{APP_PRODUCTS.concat(INFRA_PRODUCTS).filter((product) => product.phase === phase.id).length} {t('references', '项参考')}</span></Cluster>
              <h3 className="nui-card__title" style={{ marginTop: 16 }}>{t(phase.title.en, phase.title.zh)}</h3>
              <p className="nui-card__desc">{t(phase.description.en, phase.description.zh)}</p>
            </Card>
          ))}
        </Grid>
      </section>

      <Alert tone="warning" title={t('Privacy needs precise language.', '隐私表述必须准确。')}>
        {t('Shielded Zcash, confidential Noir execution and public external networks are different states. Interfaces must explain where privacy changes.', 'Zcash 屏蔽池、Noir 机密执行和公开外部网络是不同状态；界面必须说明隐私在何处发生变化。')}
      </Alert>
    </>
  );
}

function Infrastructure() {
  const { lang } = useSettings();
  const t = useT();
  return (
    <>
      <PageIntro eyebrow={t('Public infrastructure', '公共基础设施')} title={t('Shared rails for every application.', '所有应用共享的基础设施。')}>
        {t('Explore shared access points for network data, developer APIs and application connectivity.', '探索面向网络数据、开发者 API 和应用连接的共享入口。')}
      </PageIntro>
      <Alert tone="info" title={t('Reference interfaces only', '仅供参考界面')}>
        {t('The interfaces below use sample data. No production endpoint, uptime or service availability is implied.', '以下界面使用示例数据，不代表已提供生产端点、可用性或服务水平。')}
      </Alert>
      <Grid cols={3} style={{ marginTop: 28 }}>
        {INFRA_PRODUCTS.map((product) => (
          <Card key={product.id} interactive>
            <Cluster justify="space-between"><h3 className="nui-card__title">{product.name[lang]}</h3><Status /></Cluster>
            <p className="nui-card__desc">{product.tagline[lang]}</p>
            <p className="nui-text-small nui-text-secondary">{t('Purpose', '用途')} · Phase {product.phase}</p>
            <a className="nui-card__link nui-card__link--stretched" href={link(product.id)}>{t('Open reference', '打开参考界面')} →</a>
          </Card>
        ))}
        <Card>
          <Cluster justify="space-between"><h3 className="nui-card__title">Indexer</h3><Status planned /></Cluster>
          <p className="nui-card__desc">{t('A planned shared layer for indexed application and network data.', '规划中的共享数据索引层，面向应用与网络数据。')}</p>
          <p className="nui-text-small nui-text-secondary">{t('No public API is currently specified in this repository.', '当前仓库尚未定义公共 API。')}</p>
        </Card>
      </Grid>
      <Section tone="navy">
        <Eyebrow accent>{t('Build on shared foundations', '基于共享底座构建')}</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '14px 0 20px', color: 'inherit' }}>{t('Start with the interface. Connect your own infrastructure.', '从界面开始，连接自己的基础设施。')}</Display>
        <Button href={link('build')}>{t('Developer quickstart', '开发者快速开始')}</Button>
      </Section>
    </>
  );
}

function AppDetail({ product }: { product: ProductMeta }) {
  const { lang } = useSettings();
  const t = useT();
  return (
    <>
      <Button href={link('apps')} arrow={false}>← {t('All apps', '全部应用')}</Button>
      <div style={{ margin: '28px 0 40px' }}>
        <Cluster gap={8}><Badge>Phase {product.phase}</Badge><Status /></Cluster>
        <Display size="s" style={{ margin: '16px 0' }}>{product.name[lang]}</Display>
        <Lead>{product.tagline[lang]}</Lead>
      </div>
      <Grid cols={2}>
        <Card>
          <Eyebrow as="h2">{t('Application phase', '应用阶段')}</Eyebrow>
          <div style={{ marginTop: 24 }}>
            <Timeline items={PHASES.map((phase) => ({
              title: `Phase ${phase.id} · ${t(phase.title.en, phase.title.zh)}`,
              time: phase.id === product.phase ? t('Reference phase', '参考阶段') : undefined,
              description: phase.id === product.phase ? t('Reference scope for this application; no production completion is implied.', '该应用对应的参考范围，不代表生产阶段已经完成。') : t(phase.description.en, phase.description.zh),
              tone: phase.id === product.phase ? 'accent' : 'neutral',
            }))} />
          </div>
        </Card>
        <Card>
          <Eyebrow as="h2">{t('Reference status', '参考状态')}</Eyebrow>
          <div style={{ marginTop: 24 }}>
            <KeyValue alignLeft items={[
              { label: t('Interface', '界面'), value: t('Interactive prototype', '可交互原型') },
              { label: t('Data', '数据'), value: t('Sample data only', '仅示例数据') },
              { label: t('Roadmap phase', '路线阶段'), value: `Phase ${product.phase}` },
              { label: t('Built with', '构建方式'), value: '@nui3/react' },
            ]} />
          </div>
          <Button variant="solid" href={link(product.id)} style={{ marginTop: 24 }}>{t('Open prototype', '打开原型')}</Button>
        </Card>
      </Grid>
      <Alert tone="info" title={t('Prototype, not a production launch', '原型，而非正式上线')}>
        {t('This phase timeline organizes the reference roadmap. It does not claim that previous phases or production services are complete.', '此阶段时间线用于组织参考路线图，不代表此前阶段或生产服务已经完成。')}
      </Alert>
    </>
  );
}

function Apps({ path }: { path: string[] }) {
  const t = useT();
  const [filter, setFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const selected = path[0] ? productById(path[0]) : undefined;
  if (selected && selected.id !== 'rpc' && selected.id !== 'explorer') return <AppDetail product={selected} />;
  const list = filter === 'all' ? APP_PRODUCTS : APP_PRODUCTS.filter((product) => product.phase === Number(filter));
  return (
    <>
      <PageIntro eyebrow={t('Apps · Phases', '应用 · 阶段')} title={t('Explore what can be built on Noir.', '探索基于 Noir 可以构建的应用。')}>
        {t('Browse reference applications by roadmap phase. Every interface is built with NUI3 and labelled with its current reference status.', '按路线阶段浏览参考应用。所有界面均由 NUI3 构建，并标明当前参考状态。')}
      </PageIntro>
      <ChipGroup aria-label={t('Filter apps by phase', '按阶段筛选应用')} value={filter} onChange={setFilter} options={[
        { value: 'all', label: t('All apps', '全部应用'), count: APP_PRODUCTS.length },
        ...PHASES.map((phase) => ({ value: String(phase.id) as '1' | '2' | '3' | '4', label: `Phase ${phase.id}`, count: APP_PRODUCTS.filter((product) => product.phase === phase.id).length })),
      ]} />
      <Grid cols={3} style={{ marginTop: 28 }}>{list.map((product) => <AppCard key={product.id} product={product} />)}</Grid>
    </>
  );
}

function Build() {
  const t = useT();
  return (
    <>
      <PageIntro eyebrow={t('Build · NUI3', '构建 · NUI3')} title={t('Start with working foundations.', '从可用的基础设施开始。')}>
        {t('Use tokens, CSS, React components, themes and complete application references to build your own product.', '使用设计变量、CSS、React 组件、主题和完整应用参考，构建自己的产品。')}
      </PageIntro>
      <Grid cols={2}>
        {[
          { title: t('Getting started', '快速开始'), desc: t('Install the workspace and compose your first application.', '安装 workspace 并组合第一个应用。'), href: link('docs', 'getting-started') },
          { title: t('Components & tokens', '组件与设计变量'), desc: t('Browse live component demos, props and semantic tokens.', '浏览组件演示、属性和语义化设计变量。'), href: link('docs') },
          { title: t('AI integration', 'AI 接入'), desc: t('Give coding agents the manifest, rules and validation loop.', '为编码代理提供清单、规则和验证闭环。'), href: link('docs', 'ai-integration') },
          { title: t('Templates & examples', '模板与示例'), desc: t('Start from complete wallet, market and payment references.', '从完整钱包、市场和支付参考开始。'), href: link('apps') },
        ].map((item) => <Card key={item.title} interactive><h3 className="nui-card__title">{item.title}</h3><p className="nui-card__desc">{item.desc}</p><a className="nui-card__link nui-card__link--stretched" href={item.href}>{t('Open', '打开')} →</a></Card>)}
      </Grid>
      <div style={{ marginTop: 32 }}><CodeBlock language="bash" code={`git clone ${REPOSITORY}.git\ncd NUI3\npnpm install\npnpm build`} /></div>
    </>
  );
}

function Extend() {
  const t = useT();
  return (
    <>
      <PageIntro eyebrow={t('Extend · Open by design', '扩展 · 开放设计')} title={t('Adapt the system without forking every screen.', '无需 fork 每个页面，也能扩展整个系统。')}>
        {t('Rebrand through semantic tokens, compose new components with nui-* primitives, and connect your own data and infrastructure adapters.', '通过语义化设计变量重塑品牌，用 nui-* 原语组合新组件，并连接自己的数据与基础设施适配器。')}
      </PageIntro>
      <Grid cols={2}>
        {[
          { title: t('Custom themes', '自定义主题'), desc: t('Extend paper or night with named themes and contrast checks.', '通过命名主题与对比度检查扩展 paper 或 night。') },
          { title: t('Custom components', '自定义组件'), desc: t('Compose NUI3 primitives while preserving accessibility and privacy rules.', '组合 NUI3 原语，同时保留无障碍与隐私规则。') },
          { title: t('Adapters', '适配器'), desc: t('Replace sample data with your wallet, RPC, indexer or application services.', '将示例数据替换为钱包、RPC、索引器或应用服务。') },
          { title: t('Integration contract', '集成规范'), desc: t('Keep amounts in bigint base units and make privacy transitions explicit.', '金额使用 bigint 基础单位，并明确展示隐私状态变化。') },
        ].map((item) => <Card key={item.title}><h3 className="nui-card__title">{item.title}</h3><p className="nui-card__desc">{item.desc}</p></Card>)}
      </Grid>
      <div style={{ marginTop: 32 }}><CodeBlock title={t('Named theme', '命名主题')} language="tsx" code={`import { defineTheme, checkContrast } from '@nui3/tokens';\n\nconst product = defineTheme({\n  name: 'product',\n  extends: 'night',\n  tokens: { accent: '#7ee0c3', 'accent-text': '#7ee0c3' },\n});\n\ncheckContrast(product.tokens);`} /></div>
      <Cluster style={{ marginTop: 24 }}><Button href={link('docs', 'getting-started')}>{t('Theming guide', '主题指南')}</Button><Button href={`${REPOSITORY}/blob/main/AGENTS.md`}>{t('Extension rules', '扩展规则')}</Button></Cluster>
    </>
  );
}

function Ecosystem() {
  const { lang } = useSettings();
  const t = useT();
  const featured = ['wallet', 'dex', 'lending'].map((id) => productById(id)!).filter(Boolean);
  return (
    <>
      <PageIntro eyebrow={t('Ecosystem · Built with NUI3', '生态 · 基于 NUI3 构建')} title={t('A growing catalogue of things to build.', '持续生长的应用与建设目录。')}>
        {t('Explore reference applications today, then add the products and integrations built by your own team.', '现在浏览参考应用，未来加入由你的团队构建的产品与集成。')}
      </PageIntro>
      <Alert tone="info" title={t('Reference ecosystem', '参考生态')}>{t('These are NUI3 application references with sample data, not claims of third-party production deployments.', '以下是使用示例数据的 NUI3 应用参考，不代表第三方生产环境部署。')}</Alert>
      <Grid cols={3} style={{ marginTop: 28 }}>{featured.map((product) => <AppCard key={product.id} product={product} />)}</Grid>
      <Section tone="plum">
        <Eyebrow accent>{t('Your project belongs here', '你的项目也可以加入')}</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '14px 0 20px', color: 'inherit' }}>{t('Build it. Extend it. Share it.', '构建它，扩展它，分享它。')}</Display>
        <Button href={link('contribute')}>{t('Contribute to the ecosystem', '参与生态建设')}</Button>
      </Section>
    </>
  );
}

function Contribute() {
  const t = useT();
  return (
    <>
      <PageIntro eyebrow={t('Contribute · Participate', '贡献 · 参与')} title={t('Build the ecosystem in the open.', '以开放方式共同建设生态。')}>
        {t('Improve components, propose integration standards, share references and help shape the public roadmap.', '改进组件、提出集成标准、分享参考实现，并共同完善公开路线图。')}
      </PageIntro>
      <Grid cols={2}>
        {[
          { title: t('Contribute code', '贡献代码'), desc: t('Read the project rules, build and test before submitting a pull request.', '阅读项目规则，在提交 Pull Request 前完成构建与测试。'), action: t('Read AGENTS.md', '阅读 AGENTS.md'), href: `${REPOSITORY}/blob/main/AGENTS.md` },
          { title: t('Propose an RFC', '提出 RFC'), desc: t('Open an issue for protocol-adjacent UI standards, adapters or larger architectural changes.', '针对协议相关 UI 标准、适配器或大型架构变更创建 Issue。'), action: t('Open an issue', '创建 Issue'), href: `${REPOSITORY}/issues/new` },
          { title: t('Share an application', '分享应用'), desc: t('Use an existing app reference as a starting point and contribute improvements upstream.', '以现有应用参考为起点，并向上游贡献改进。'), action: t('Browse Apps', '浏览应用'), href: link('apps') },
          { title: t('Roadmap & governance', '路线图与治理'), desc: t('Review the phase structure. A formal governance process has not yet been defined.', '查看阶段结构；正式治理流程尚未定义。'), action: t('View roadmap', '查看路线图'), href: link('overview') },
        ].map((item) => <Card key={item.title} interactive><h3 className="nui-card__title">{item.title}</h3><p className="nui-card__desc">{item.desc}</p><a className="nui-card__link nui-card__link--stretched" href={item.href}>{item.action} →</a></Card>)}
      </Grid>
    </>
  );
}

export default function Portal({ section, path }: { section: PortalSection; path: string[] }) {
  return (
    <Shell style={{ padding: '56px 0 96px' }}>
      {section === 'overview' && <Overview />}
      {section === 'infrastructure' && <Infrastructure />}
      {section === 'apps' && <Apps path={path} />}
      {section === 'build' && <Build />}
      {section === 'extend' && <Extend />}
      {section === 'ecosystem' && <Ecosystem />}
      {section === 'contribute' && <Contribute />}
    </Shell>
  );
}
