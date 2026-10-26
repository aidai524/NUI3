# 让 AI 正确使用 NUI3

NUI3 不需要训练或微调模型。最有效的方式是把规则、组件清单和完整示例放入 AI 的工作上下文，并要求它在编码前读取。

## 1. 三个入口文件

按以下顺序提供上下文：

1. `AGENTS.md`：硬规则、组件选择表和页面配方。
2. `llms.txt`：文档索引与包结构。
3. `docs/components.json`：机器可读的组件、Props、CSS 类名和示例。

需要完整页面参考时，再读取 `examples/dapp/src/products/` 下对应产品，而不是一次性载入整个仓库。

## 2. 项目级配置

将 NUI3 根目录的 `AGENTS.md` 保留在仓库根目录。支持 AGENTS.md 的编码代理会自动发现它；其他工具可以把同一份内容加入其持久规则或系统提示。

推荐在业务应用中添加一段项目规则：

```text
本项目使用 NUI3。修改 UI 前先阅读 NUI3/AGENTS.md 和
NUI3/docs/components.json，并参考 NUI3/examples/dapp 中的相似页面。

只能使用 @nui3/react 组件或 nui-* CSS 类。
不要引入 MUI、Chakra、shadcn 或另一套组件库。
样式只读 --nui-* 语义 token；不要硬编码颜色、字体、圆角或阴影。
完成后运行 pnpm build 和 pnpm test。
```

如果业务仓库通过 npm 使用 NUI3，应把规则文件和组件清单纳入业务仓库的文档或子模块，确保 AI 离线也能读取到与安装版本一致的内容。

## 3. 可直接复制的开发提示词

```text
使用 NUI3 开发一个 Lending 页面。

先阅读：
- AGENTS.md
- docs/components.json
- examples/dapp/src/products/lending/index.tsx

要求：
1. 使用 Panel、TokenAmountInput、HealthFactor、DetailList、Alert 和 Button。
2. 一个视图只能有一个 solid 主按钮。
3. 金额保持十进制输入字符串，提交时使用 parseUnits 转为 bigint base units。
4. 清算风险必须通过 Alert tone="warning" 展示在主操作附近。
5. 所有输入有 label；图标按钮必须有可访问名称。
6. 不得硬编码颜色、字体、圆角或阴影，不得引入其他 UI 库。
7. 完成后运行类型检查、构建和测试，并修复你引入的问题。
```

审查现有代码时：

```text
审查这次 UI 修改是否符合 NUI3/AGENTS.md。
重点检查隐私措辞、金额精度、地址和 memo 规则、可访问性、
主题 token、单一 solid 主按钮，以及是否绕组件硬编码样式。
先列出具体违规位置，再做最小范围修复并运行测试。
```

## 4. 组件发现与 API 查询

`docs/components.json` 是 AI 的结构化组件索引。例如需要交易界面时，可筛选：

```text
group = trading  → OrderBook、LeverageSlider、PositionTable、PnL
group = charts   → PriceChart、CandleChart、DepthChart
group = payments → BatchPayments、BatchPaymentTable
```

不要凭名称猜测 Props。以清单和当前源码类型为准；清单中的示例展示基本组合，完整类型定义位于 `packages/react/src/components/`。

## 5. 必须保留的领域规则

AI 生成代码时最容易遗漏的是业务语义，而不是视觉样式：

- `shielded`、`confidential`、`public` 是三个不同隐私级别，不能互换。
- confidential execution 不得写成 shielded、anonymous 或 fully private。
- 公开 Explorer 页面不得显示 shielded 金额、发送方、接收方或 memo。
- 金额使用 bigint base units；禁止 `parseFloat(balance)` 和浮点金额运算。
- 地址校验只用于 UX；最终验证属于钱包 SDK / 节点。
- Memo 只能发给 shielded recipient。
- Footer 必须保留 Zcash 商标免责声明。
- Bridge、Lending、Perps、Prediction、LaunchPad 必须显示相应风险说明。

完整规则始终以 `AGENTS.md` 为准。

## 6. 推荐工作流

让 AI 按这个闭环工作：

1. **读规则**：AGENTS.md → components.json → 相似产品示例。
2. **选组件**：优先复用现有组件，不重复造通用控件。
3. **最小实现**：只改任务需要的文件，保持受控输入和语义 token。
4. **自动验证**：运行 `pnpm build`、`pnpm test` 和示例应用构建。
5. **人工检查**：paper / night、紧凑密度、键盘操作和移动端布局。

对于图表，简单 `{t,value}` 时间序列使用 `PriceChart`，OHLCV 使用 `CandleChart`；对于 Payroll，粘贴导入和编辑使用 `BatchPaymentTable`，只读审核使用 `BatchPayments`。

## 7. 不应采用的“AI 集成”方式

- 不要让模型自行发明 `nui-*` 类或不存在的组件。
- 不要只提供截图而省略 AGENTS.md；截图无法表达隐私和金额约束。
- 不要把全部源码无差别塞进每次提示；按任务读取清单和相关模块。
- 不要用模型输出代替测试、类型检查和链上最终验证。
