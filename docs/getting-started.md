# NUI3 前端接入指南

NUI3 提供三层能力：`@nui3/tokens` 设计变量、`@nui3/css` 跨框架样式、`@nui3/react` React 组件与 Zcash 工具函数。

> 当前版本为 0.1.0，尚未发布到 npm。本文优先介绍 monorepo / 本地开发接入；npm 命令将在发布后生效。

## 1. 环境与安装

要求：

- React 18.2 或更高版本（仅 React 用法需要）
- Node.js 与 pnpm
- TypeScript 可选，但推荐

### 在当前 monorepo 中开发

克隆并构建：

```bash
git clone https://github.com/aidai524/NUI3.git
cd NUI3
pnpm install
pnpm build
```

将你的应用放入 `apps/my-app`，并在根目录 `pnpm-workspace.yaml` 中加入：

```yaml
packages:
  - packages/*
  - examples/dapp
  - apps/*
```

应用的 `package.json`：

```json
{
  "name": "my-app",
  "private": true,
  "dependencies": {
    "@nui3/css": "workspace:*",
    "@nui3/react": "workspace:*",
    "react": ">=18.2",
    "react-dom": ">=18.2"
  }
}
```

然后重新执行 `pnpm install`。修改 NUI3 源码后运行 `pnpm build`，应用会读取 `packages/*/dist` 中的构建产物。

### npm 发布后

```bash
pnpm add @nui3/react @nui3/css
```

只使用 CSS 时：

```bash
pnpm add @nui3/css
```

## 2. React 快速开始

在应用入口只引入一次完整样式：

```tsx
import '@nui3/css';
```

完整样式包含自托管字体、tokens、全局 base 和组件样式。随后挂载主题与通知 Provider：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider } from '@nui3/react';
import '@nui3/css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme="auto">
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
```

一个完整的金额输入面板：

```tsx
import { useState } from 'react';
import {
  Button,
  Panel,
  PrivacyBadge,
  TokenAmountInput,
  parseUnits,
} from '@nui3/react';

const ZEC = { symbol: 'ZEC', decimals: 8, balance: 1284500000n };

export function Swap() {
  const [value, setValue] = useState('');

  const review = () => {
    // 仅在提交时转换；输入过程中始终保留用户输入的十进制字符串。
    const baseUnits = parseUnits(value || '0', ZEC.decimals);
    console.log(baseUnits);
  };

  return (
    <Panel title="Swap" actions={<PrivacyBadge level="confidential" />}>
      <TokenAmountInput
        label="You pay"
        value={value}
        onChange={setValue}
        onMax={setValue}
        token={ZEC}
      />
      <Button variant="solid" block onClick={review}>
        Review swap
      </Button>
    </Panel>
  );
}
```

## 3. 嵌入已有应用

如果不希望引入 NUI3 的全局 reset，改用仅包含 tokens 和组件的样式：

```tsx
import '@nui3/css/components.css';
```

并用 `ThemeProvider` 包裹 NUI3 区域；非 React 项目可以使用 `class="nui-root"`：

```html
<div class="nui-root" data-nui-theme="paper">
  <button class="nui-btn nui-btn--solid">Review swap</button>
</div>
```

`components.css` 不包含字体和全局 base；需要字体时再引入 `@nui3/css/fonts.css`。

## 4. 纯 HTML / 其他框架

构建后，在普通 HTML 中引用 `packages/css/dist/nui3.css`：

```html
<link rel="stylesheet" href="/nui3.css" />

<main class="nui-shell">
  <section class="nui-panel">
    <div class="nui-panel__body">
      <h1 class="nui-heading">Markets</h1>
      <button class="nui-btn nui-btn--solid">Trade</button>
    </div>
  </section>
</main>
```

Vue、Svelte 等框架也可以直接使用相同的 `nui-*` 类。可用类名和对应组件见 `docs/components.json`，完整示例见 `examples/html/index.html`。

## 5. 主题、密度与国际化

```tsx
<ThemeProvider theme="paper">...</ThemeProvider>
<ThemeProvider theme="night" density="compact">...</ThemeProvider>
<ThemeProvider theme="auto">...</ThemeProvider>
```

局部品牌色只覆盖语义 token，不改组件内部样式：

```tsx
<ThemeProvider
  theme="night"
  tokens={{
    accent: '#7ee0c3',
    'accent-hover': '#5fcfae',
    'accent-text': '#7ee0c3',
    'focus-ring': '#7ee0c3',
  }}
>
  ...
</ThemeProvider>
```

修改 accent 时必须同时检查 `accent-text` 和焦点色对比度：

```ts
import { checkContrast, defineTheme } from '@nui3/tokens';

const brand = defineTheme({
  name: 'brand',
  extends: 'night',
  tokens: { accent: '#7ee0c3', 'accent-text': '#7ee0c3' },
});

console.log(checkContrast(brand.tokens));
```

中英文及数字格式：

```tsx
import { LocaleProvider } from '@nui3/react';

<LocaleProvider locale="zh">
  <App />
</LocaleProvider>
```

可以通过 `messages={{ txConfirmed: '已完成' }}` 覆盖任意内置文案。

## 6. 常用工具

```ts
import {
  Amount,
  Address,
  formatAmount,
  parseUnits,
  isValidAddress,
  buildPaymentUri,
} from '@nui3/react';

const units = parseUnits('1.25', 8); // 125000000n
```

规则：

- 金额使用 bigint base units；不要用浮点数计算代币金额。
- 地址用 `<Address>` 展示，用 `isValidAddress` 做 UX 预检；签名前仍由钱包 SDK / 节点验证。
- Memo 只能发送到 shielded recipient；使用 `<MemoInput recipient={address}>`。
- Explorer 公开页面不得展示 shielded amount、sender、recipient 或 memo。

## 7. 选择与验证组件

- 人工查询：`docs/components.json`
- 在线演示：`examples/dapp` 中的 `#/docs`
- 页面组合规则：根目录 `AGENTS.md`
- AI 接入：[`ai-integration.md`](./ai-integration.md)

提交前运行：

```bash
pnpm build
pnpm test
pnpm --filter nui3-dapp-example build
```
