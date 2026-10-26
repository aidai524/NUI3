import type { ReactNode } from 'react';
import { Alert, Badge, Button, Card, Cluster, CodeBlock, Display, Eyebrow, Grid, Heading, Lead, Stack } from '@nui3/react';
import { link } from '../products/meta';
import { useT } from '../settings';

export const GUIDES = {
  'getting-started': {
    title: 'Getting started',
    zh: '前端接入指南',
    description: 'Install NUI3 in a workspace, compose a React app, use themes, or embed the CSS in any framework.',
    zhDescription: '在 workspace 中安装 NUI3，组合 React 应用、设置主题，或将 CSS 嵌入任意框架。',
  },
  'ai-integration': {
    title: 'AI integration',
    zh: 'AI 接入指南',
    description: 'Give coding agents the rules, component manifest, examples and validation loop they need.',
    zhDescription: '为编码代理提供规则、组件清单、示例和自动验证闭环。',
  },
} as const;

export type GuideId = keyof typeof GUIDES;

function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="nui-stack" style={{ gap: 16 }}>
      <Heading level={3}>{title}</Heading>
      {children}
    </section>
  );
}

export function GuideCards() {
  const t = useT();
  return (
    <Grid cols={2} style={{ marginTop: 32 }}>
      {(Object.entries(GUIDES) as Array<[GuideId, (typeof GUIDES)[GuideId]]>).map(([id, guide]) => (
        <Card key={id} interactive>
          <Eyebrow>{id === 'getting-started' ? t('For developers', '前端开发者') : t('For coding agents', '编码代理')}</Eyebrow>
          <h3 className="nui-card__title">{t(guide.title, guide.zh)}</h3>
          <p className="nui-card__desc">{t(guide.description, guide.zhDescription)}</p>
          <a className="nui-card__link nui-card__link--stretched" href={link('docs', id)}>{t('Read guide', '阅读指南')} →</a>
        </Card>
      ))}
    </Grid>
  );
}

function GettingStarted() {
  const t = useT();
  return (
    <>
      <Alert tone="info" title={t('Before npm publication', 'npm 发布前')}>
        {t('Use NUI3 as a workspace package today. The pnpm add @nui3/* commands become available after publication.', '当前请将 NUI3 作为 workspace 包使用；pnpm add @nui3/* 命令将在发布后可用。')}
      </Alert>
      <GuideSection title={t('1. Install in a workspace', '1. 在 workspace 中安装')}>
        <p className="nui-lead">{t('Clone the repository, build the three packages, then reference them from your app.', '克隆仓库并构建三个包，然后从你的应用引用。')}</p>
        <CodeBlock
          language="bash"
          code={`git clone https://github.com/aidai524/NUI3.git\ncd NUI3\npnpm install\npnpm build`}
        />
        <CodeBlock
          title="apps/my-app/package.json"
          language="json"
          code={`{\n  "dependencies": {\n    "@nui3/css": "workspace:*",\n    "@nui3/react": "workspace:*",\n    "react": ">=18.2",\n    "react-dom": ">=18.2"\n  }\n}`}
        />
      </GuideSection>
      <GuideSection title={t('2. Configure the app root', '2. 配置应用入口')}>
        <p>{t('Import the full CSS once. It includes fonts, tokens, base styles and all components.', '完整 CSS 只需引入一次，包含字体、tokens、基础样式和全部组件。')}</p>
        <CodeBlock
          language="tsx"
          code={`import { ThemeProvider, ToastProvider } from '@nui3/react';\nimport '@nui3/css';\n\n<ThemeProvider theme="auto">\n  <ToastProvider>\n    <App />\n  </ToastProvider>\n</ThemeProvider>`}
        />
      </GuideSection>
      <GuideSection title={t('3. Compose components', '3. 组合组件')}>
        <CodeBlock
          language="tsx"
          code={`const ZEC = { symbol: 'ZEC', decimals: 8, balance: 1284500000n };\n\nfunction Swap() {\n  const [value, setValue] = useState('');\n  return (\n    <Panel title="Swap" actions={<PrivacyBadge level="confidential" />}>\n      <TokenAmountInput\n        label="You pay"\n        value={value}\n        onChange={setValue}\n        onMax={setValue}\n        token={ZEC}\n      />\n      <Button variant="solid" block>Review swap</Button>\n    </Panel>\n  );\n}`}
        />
        <p>{t('Keep decimal input as a string. Convert with parseUnits(value, token.decimals) only when submitting.', '输入过程中保留十进制字符串，仅在提交时使用 parseUnits(value, token.decimals) 转换。')}</p>
      </GuideSection>
      <GuideSection title={t('4. Themes and embedding', '4. 主题与嵌入')}>
        <CodeBlock
          language="tsx"
          code={`<ThemeProvider theme="paper">...</ThemeProvider>\n<ThemeProvider theme="night" density="compact">...</ThemeProvider>\n<ThemeProvider theme="night" tokens={{ accent: '#7ee0c3', 'accent-text': '#7ee0c3' }}>...</ThemeProvider>`}
        />
        <p>{t('For an existing app without a global reset, import components.css and scope the area with ThemeProvider or nui-root.', '已有应用若不想要全局 reset，请引入 components.css，并用 ThemeProvider 或 nui-root 限定范围。')}</p>
        <CodeBlock language="ts" code={`import '@nui3/css/components.css';`} />
      </GuideSection>
      <GuideSection title={t('5. Verify', '5. 验证')}>
        <CodeBlock language="bash" code={`pnpm build\npnpm test\npnpm --filter nui3-dapp-example build`} />
      </GuideSection>
    </>
  );
}

function AiIntegration() {
  const t = useT();
  return (
    <>
      <GuideSection title={t('1. Provide the right context', '1. 提供正确上下文')}>
        <p>{t('No fine-tuning is required. Ask the agent to read rules first, then the manifest, then only the relevant product example.', '无需微调模型。让代理先读规则，再读组件清单，最后只读取与任务相关的产品示例。')}</p>
        <CodeBlock
          language="text"
          code={`1. AGENTS.md — rules and page recipes\n2. llms.txt — documentation index\n3. docs/components.json — props and examples\n4. examples/dapp/src/products/ — relevant full-page reference`}
        />
      </GuideSection>
      <GuideSection title={t('2. Add a persistent project rule', '2. 添加持久项目规则')}>
        <CodeBlock
          language="text"
          code={`This project uses NUI3. Before changing UI, read AGENTS.md and docs/components.json.\nUse only @nui3/react components or nui-* classes.\nUse semantic --nui-* tokens; never hardcode colors, fonts, radii or shadows.\nDo not add another UI kit. Run pnpm build and pnpm test when finished.`}
        />
      </GuideSection>
      <GuideSection title={t('3. Use a task prompt', '3. 使用任务提示词')}>
        <CodeBlock
          language="text"
          code={`Build a Lending page with NUI3.\nRead AGENTS.md, docs/components.json and the lending example first.\nUse Panel, TokenAmountInput, HealthFactor, DetailList, Alert and Button.\nKeep amounts as bigint base units and show liquidation risk near the primary action.\nEvery input needs a label. Use one solid button per view.\nRun type checks, builds and tests; fix any issues you introduce.`}
        />
      </GuideSection>
      <GuideSection title={t('4. Preserve domain rules', '4. 保留领域规则')}>
        <Stack gap={3}>
          <span><Badge tone="accent">Privacy</Badge> {t('Never confuse shielded, confidential and public.', '不得混淆 shielded、confidential 和 public。')}</span>
          <span><Badge tone="accent">Amounts</Badge> {t('Use bigint base units, never floating-point token math.', '金额使用 bigint base units，禁止浮点代币运算。')}</span>
          <span><Badge tone="accent">Explorer</Badge> {t('Never expose shielded amounts, parties or memos on public pages.', '公开页面不得暴露 shielded 金额、交易方或 memo。')}</span>
          <span><Badge tone="accent">Risk</Badge> {t('Bridge, Lending, Perps, Prediction and LaunchPad need risk disclosure.', 'Bridge、Lending、Perps、Prediction 和 LaunchPad 必须显示风险说明。')}</span>
        </Stack>
      </GuideSection>
      <GuideSection title={t('5. Close the loop', '5. 完成验证闭环')}>
        <p>{t('Require type checks and tests. Then inspect paper and night themes, compact density, keyboard operation and mobile layout.', '要求类型检查和测试，再检查 paper／night 主题、紧凑密度、键盘操作和移动端布局。')}</p>
      </GuideSection>
    </>
  );
}

export function GuidePage({ id }: { id: GuideId }) {
  const t = useT();
  const guide = GUIDES[id];
  return (
    <>
      <Button href={link('docs')} arrow={false}>← {t('All documentation', '全部文档')}</Button>
      <div style={{ margin: '20px 0 12px' }}><Badge>Guide</Badge></div>
      <Display size="s">{t(guide.title, guide.zh)}</Display>
      <div style={{ margin: '12px 0 32px' }}><Lead>{t(guide.description, guide.zhDescription)}</Lead></div>
      <Stack gap={8}>
        {id === 'getting-started' ? <GettingStarted /> : <AiIntegration />}
      </Stack>
      <Cluster justify="space-between" style={{ marginTop: 32 }}>
        <Button href={link('docs', id === 'getting-started' ? 'ai-integration' : 'getting-started')}>
          {id === 'getting-started' ? t('AI integration', 'AI 接入指南') : t('Getting started', '前端接入指南')}
        </Button>
        <Button variant="outline" href={`https://github.com/aidai524/NUI3/blob/main/docs/${id}.md`}>{t('View Markdown', '查看 Markdown')}</Button>
      </Cluster>
    </>
  );
}
