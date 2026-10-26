# NUI3

Zcash 生态 dApp 的 UI 库。视觉语言来自 z.cash（研究见 `../zcash-design-system/`，原型见 `../prototype/`），组件覆盖 Noir 规划里的 Bridge、TokenDeploy、DEX、Explorer、Lending 等场景。

- **三层可定制**：基础色 → 语义 token → 组件。组件只读语义变量，换主题、换强调色、改圆角都不用碰组件代码。
- **两种用法**：`@nui3/react`（React 组件 + 工具函数），或只用 `@nui3/css`（`nui-*` 类，Vue / Svelte / 纯 HTML 都能用）。
- **给 AI 用**：[`AGENTS.md`](AGENTS.md)（硬规则 + 场景配方）、[`docs/components.json`](docs/components.json)（组件清单）、[`llms.txt`](llms.txt)。

## 包

| 包 | 内容 |
| --- | --- |
| `@nui3/tokens` | `src/tokens.json`（DTCG，唯一数据源）→ `tokens.css`、`tokens.json`、Tailwind preset；`defineTheme`、`checkContrast` |
| `@nui3/css` | `nui3.css`（字体 + tokens + 全局 base + 组件）、`components.css`（不带全局重置，适合嵌入）、自托管字体 |
| `@nui3/react` | 99 个组件 / Hook 条目 + `units` / `address` / `memo` / `zip321` / `payments` 工具函数 |

## 快速开始

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

已完成 Phase 2 的 `OrderBook`、`PositionTable`、`LeverageSlider`、`PriceChart`，以及 `BatchPaymentTable`、`NFTCard`、`BondingCurveChart`。`examples/dapp` 已包含全部组件的在线文档和 11 类产品示例。

剩余工作：

- 浏览器视觉回归测试（paper / night、紧凑密度、移动端）与自动化无障碍检查
- npm 发布（需要先注册 `@nui3` 组织）
