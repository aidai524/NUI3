# NUI3

**面向隐私原生应用的开放 UI 生态。** NUI3 为 Noir 与 Zcash 生态建设者提供可组合的组件、设计变量、主题和应用参考，让团队可以基于共同底座构建、扩展并分享自己的产品。

- **Build**：使用组件、设计令牌、主题和完整应用参考快速起步。
- **Extend**：通过命名主题、`nui-*` 原语和数据／基础设施适配器扩展系统。
- **Ecosystem**：浏览钱包、DEX、Lending 等参考应用；所有演示均明确标注为原型与示例数据。
- **Contribute**：通过 GitHub Issue、RFC 和 Pull Request 参与组件、标准与路线图建设。
- **给 AI 用**：[`AGENTS.md`](AGENTS.md)（硬规则 + 场景配方）、[`docs/components.json`](docs/components.json)（组件清单）、[`llms.txt`](llms.txt)。

## 生态门户

在线站点：[https://nui3.pages.dev/](https://nui3.pages.dev/)。

- **Overview**：协议定位、使命愿景、技术栈和四阶段路线图。
- **Public Infrastructure**：Explorer、RPC 与规划中的 Indexer；展示用途、状态和参考入口。
- **Apps**：按 Phase 1–4 筛选应用，并在应用详情中查看阶段时间线、原型状态和数据说明。
- **Build / Extend / Ecosystem / Contribute**：分别承担开发起步、系统扩展、案例展示与开放参与。

协议内容以当前仓库中的参考模型为准：Noir 在 NEAR 上执行，状态锚定到 Zcash，并不宣称具备 ZK Rollup 的全部安全保证。示例站点不是生产服务，也不代表已有第三方部署。

## 包

| 包 | 内容 |
| --- | --- |
| `@nui3/tokens` | `src/tokens.json`（DTCG，唯一数据源）→ `tokens.css`、`tokens.json`、Tailwind preset；`defineTheme`、`checkContrast` |
| `@nui3/css` | `nui3.css`（字体 + tokens + 全局 base + 组件）、`components.css`（不带全局重置，适合嵌入）、自托管字体 |
| `@nui3/react` | 99 个组件 / Hook 条目 + `units` / `address` / `memo` / `zip321` / `payments` 工具函数 |

## 使用指南

- **前端开发者**：[`docs/getting-started.md`](docs/getting-started.md)——workspace / npm 安装、React 与纯 CSS 引入、主题、国际化、金额工具和验证命令。
- **AI 编码代理**：[`docs/ai-integration.md`](docs/ai-integration.md)——上下文文件、持久项目规则、可复制的提示词、领域约束与验证闭环。
- **在线版本**：[前端接入](https://nui3.pages.dev/#/docs/getting-started)、[AI 接入](https://nui3.pages.dev/#/docs/ai-integration) 与 [组件文档](https://nui3.pages.dev/#/docs)。
- **维护者交接**：[`HANDOFF.md`](HANDOFF.md)——当前定位、目录结构、路由、验证、部署与后续事项。

## 快速开始

当前尚未发布到 npm；本地开发请先执行 `pnpm install && pnpm build`，并通过 `workspace:*` 引用包。完整步骤见前端接入指南。

```tsx
import '@nui3/css';
import { ThemeProvider, ToastProvider, Panel, TokenAmountInput, Button, PrivacyBadge } from '@nui3/react';

export function Swap() {
  const [v, setV] = useState('');
  return (
    <Panel title="Swap" actions={<PrivacyBadge level="confidential" />}>
      <TokenAmountInput label="You pay" value={v} onChange={setV} token={{ symbol: 'ZEC', decimals: 8, balance: 1284500000n }} onMax={setV} />
      <Button variant="solid" block>Review swap</Button>
    </Panel>
  );
}
```

纯 HTML 版本：`<link rel="stylesheet" href="@nui3/css/dist/nui3.css">`，然后直接写 `class="nui-btn nui-btn--solid"`。见 `examples/html/index.html`。

## 主题与定制

| 方式 | 写法 |
| --- | --- |
| 内置主题 | `<html data-nui-theme="paper | night | auto">` |
| 紧凑密度 | `data-nui-density="compact"`（交易、表格界面） |
| 局部覆盖 | `<ThemeProvider theme="night" tokens={{ accent: '#7ee0c3' }}>` |
| 命名主题 | `defineTheme({ name: 'bridge', extends: 'night', tokens: {...} }).css` |
| 纯 CSS | `:root { --nui-accent: #7ee0c3; --nui-radius-base: 6px; }` |
| Tailwind | `import preset from '@nui3/tokens/tailwind'; presets: [preset]` → `bg-nui-surface text-nui-text` |

所有样式都放在 `@layer nui3.*` 里，业务方写的普通 CSS 不加 `!important` 也会优先生效。改了强调色之后，用 `checkContrast(theme.tokens)` 检查对比度。

## 和设计规范的差异

整理成库时修正了规范、tokens 和原型之间互相矛盾的地方：

- 次级文字 `#797576` 改成 `#6B6667`（在纸白底上对比度从 4.04 提到 5.0，达到 AA），金色文字用 `#8A6100`
- 删掉了 `--zc-shadow-hover`，"零投影"现在由测试强制
- 原型里硬编码的 6 个颜色都进了 token，组件 CSS 里不再出现裸色值（测试会检查）
- 类名统一成 `nui-` 前缀，变量统一成 `--nui-`
- IBM Plex Mono 改为自托管
- 新增：night 主题、compact 密度，以及隐私三级（shielded / confidential / public）、`inverse-*` 语义色

## 开发

```bash
pnpm install
pnpm build          # tokens → css → react
pnpm test           # 对比度、CSS 约束、工具函数、组件
pnpm dev            # examples/dapp → http://localhost:5173 （?theme=night|jade）
```

## 当前进度与路线图

已完成 Phase 2 的 `OrderBook`、`PositionTable`、`LeverageSlider`、`PriceChart`，以及 `BatchPaymentTable`、`NFTCard`、`BondingCurveChart`。`examples/dapp` 已包含全部组件的在线文档、12 类产品示例，以及按 Overview、Public Infrastructure、Apps、Build、Extend、Ecosystem、Contribute 组织的生态门户。

剩余工作：

- 浏览器视觉回归测试（paper / night、紧凑密度、移动端）与自动化无障碍检查
- npm 发布（需要先注册 `@nui3` 组织）
