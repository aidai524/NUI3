# NUI3 项目交接

最后核验：2026-10-27
当前分支：`main`  
代码仓库：`https://github.com/aidai524/NUI3.git`  
线上门户：`https://nui3.pages.dev/`

## 1. 当前定位

NUI3 是面向 Noir 与 Zcash 生态建设者的开放 UI 系统。示例站已不只是组件文档，而是协议与开放生态门户，首页按以下顺序组织叙事：

1. Mission-led hero：隐私金融与开放建设。
2. Mission & Vision：协议要解决的问题和长期方向。
3. Why build on Noir：Applications、NUI3、Public Infrastructure、Noir execution、Zcash anchor 五层技术栈。
4. Apps：应用参考与 Phase 1–4。
5. Build / Extend / Contribute：开发者参与入口。

协议内容当前以仓库已有模型为准：Noir 在 NEAR 上执行，状态锚定到 Zcash；不要将其描述为 ZK Rollup。所有应用界面均为 Prototype，使用示例数据，不代表生产服务或第三方部署。

## 2. 仓库结构

```text
packages/
  tokens/             DTCG tokens、主题、Tailwind preset、对比度检查
  css/                nui3.css、components.css、自托管字体
  react/              React 组件、Hooks、金额／地址／memo／支付工具
examples/
  dapp/               React + Vite 生态门户、文档和产品原型
    src/App.tsx       顶部导航、Footer、门户与产品路由分发
    src/Home.tsx      生态首页：使命、愿景、技术栈、建设入口
    src/Ecosystem.tsx Overview / Infrastructure / Apps / Build / Extend / Ecosystem / Contribute
    src/docs/         组件文档、前端接入指南、AI 接入指南
    src/products/     12 个产品参考及共享元数据
    src/router.ts     Hash 路由
    src/settings.tsx  中英文和 paper / night / jade 主题设置
  html/               纯 CSS 使用示例
docs/
  components.json     AI 与文档站共用的组件清单
  getting-started.md  前端接入指南
  ai-integration.md   AI 接入指南
AGENTS.md             组件使用、隐私、金额、无障碍等硬规则
llms.txt              AI 文档与门户索引
README.md             项目定位、包结构、使用和开发说明
```

## 3. 本地开发

要求使用仓库指定的 `pnpm@10.17.1`。当前包尚未发布到 npm，应用通过 `workspace:*` 引用。

```bash
git clone https://github.com/aidai524/NUI3.git
cd NUI3
pnpm install
pnpm build
pnpm dev
```

`pnpm dev` 启动 `examples/dapp` 的 Vite 服务。默认端口为 5173；在 Kimi Work 中使用其托管预览入口 `http://localhost:7100/`，不要遗留手动启动的后台服务。

生产构建：

```bash
pnpm --filter nui3-dapp-example build
```

输出目录：`examples/dapp/dist`。

## 4. 路由与内容维护

门户使用 Hash 路由，无需服务器 rewrite：

| 路由 | 内容 |
| --- | --- |
| `#/` | 生态首页 |
| `#/overview` | 协议、使命愿景、技术栈、路线图 |
| `#/infrastructure` | Explorer、RPC、Indexer 状态与参考入口 |
| `#/apps` | 应用目录与 Phase 筛选 |
| `#/apps/:id` | 单应用阶段时间线、原型状态、原型入口 |
| `#/build` | 开发者起步、组件、AI、模板与示例 |
| `#/extend` | 主题、组件、适配器与集成规范 |
| `#/ecosystem` | NUI3 参考应用 |
| `#/contribute` | 代码贡献、RFC、路线图与治理状态 |
| `#/docs` | 组件文档 |
| `#/docs/getting-started` | 前端接入指南 |
| `#/docs/ai-integration` | AI 接入指南 |

产品原始路由（如 `#/dex`、`#/wallet`）仍直接打开对应原型；旧别名 `#/swap`、`#/lend`、`#/tx` 继续兼容。

### 修改应用或阶段

以 `examples/dapp/src/products/meta.ts` 为唯一数据源：

- `PRODUCTS` 维护名称、简介、Phase、优先级和子页面。
- `REGISTRY` 维护产品 ID 到懒加载模块的映射。
- Apps 会自动排除 `explorer` 和 `rpc`，二者归入 Public Infrastructure。
- 新增产品时需要同步 `ProductId`、`PRODUCTS`、`REGISTRY`，必要时同步导航和 Footer。

### 修改门户

- 首页叙事：`examples/dapp/src/Home.tsx`。
- 门户页面：`examples/dapp/src/Ecosystem.tsx`。
- 顶部导航和 Footer：`examples/dapp/src/App.tsx`。
- 指南内容：Markdown 文件与 `examples/dapp/src/docs/guides.tsx` 目前分别维护，修改时需同步。

## 5. AI 与组件使用规则

让 AI 按以下顺序读取：

1. `AGENTS.md`
2. `llms.txt`
3. `docs/components.json`
4. 与任务相关的 `examples/dapp/src/products/` 示例

不可破坏的核心规则：

- 使用 NUI3 组件或 `nui-*` 类；样式使用语义化 `--nui-*` tokens。
- 不用硬编码颜色、字体、圆角或阴影，不引入另一套 UI kit。
- 产品页内容由 `products/Shell.tsx` 的 `Stack gap={6}` 统一提供 24 px 纵向间距；门户相邻内容区块使用 32 px 间距，不再为直接子元素重复添加零散外边距。表单、卡片和双栏内部节奏保持独立。
- `Section tone="navy" | "plum"` 中的辅助文字使用深色背景对应的夜色文本 token；不要为单个页面写死浅色。相关覆盖位于 `packages/css/src/components/foundation.css`。
- 每个视图只保留一个 solid 主按钮。
- 金额使用 bigint 基础单位，输入过程中保留十进制字符串。
- 不混淆 `shielded`、`confidential`、`public`；公开页面不得泄露 shielded 信息。
- Bridge、Lending、Perps、Prediction、LaunchPad 必须显示风险说明。
- 输入必须有 label，保留键盘焦点与状态播报。

## 6. 验证状态与命令

截至本次交接：

- tokens：5 项测试通过。
- CSS：6 项测试通过，包含深色 Section 辅助文字颜色回归用例。
- React：52 项测试通过。
- 合计：63 项测试通过。
- packages 完整构建、示例站 TypeScript 检查与 Vite 生产构建通过。
- 首页、门户页面、Apps Phase 筛选和应用详情已在浏览器核验。
- Lending 等 4 处门户相邻区块实测为 32 px；Explorer、Perps、DEX、LaunchPad、NFT 等产品页相邻内容区块实测为 24 px。
- Paper 与 Night 下，深色 Section 辅助文字与 navy 背景的实测对比度均为 10.03:1。
- 首页及本次抽查页面在 390 px 视口下无页面级横向溢出，五层技术栈正确重排，表格保留容器内滚动。
- Cloudflare 生产首页和受影响页面已线上核验。

提交前至少运行：

```bash
pnpm test
pnpm --filter nui3-dapp-example build
git diff --check
```

若修改 tokens、CSS 或 React 包，还需运行对应包的构建和完整 `pnpm build`。

## 7. 发布与部署

### GitHub

```bash
git add <changed-files>
git commit -m "..."
git push origin main
```

### Cloudflare Pages

- Pages 项目：`nui3`
- 生产分支：`main`
- 构建目录：`examples/dapp/dist`
- 当前采用 Wrangler 直接上传，不是 GitHub 自动部署。

常规终端可使用：

```bash
npx wrangler@latest whoami
npx wrangler@latest pages deploy examples/dapp/dist --project-name=nui3 --branch=main
```

部署后必须检查：

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' https://nui3.pages.dev/
```

再在浏览器打开 `#/`、受影响页面和 `#/docs`。Cloudflare 凭证只应保存在本机 Wrangler 配置或受控环境变量中，不要写入仓库或 HANDOFF。

## 8. 最近提交

- `60b813a` — 修复 Paper 主题下深色 Section 辅助文字对比度，并增加 CSS 回归测试。
- `e644dd6` — 统一门户 32 px、产品页 24 px 的页面级纵向间距。
- `164f94c` — 增加维护者 handoff 文档。
- `75ac44c` — 首页改为使命、愿景和建设者价值优先。
- `d25a695` — 增加生态门户信息架构、Apps 阶段和开发者入口。
- `0a799f4` — 增加前端接入与 AI 接入文档。
- `8685d51` — NUI3 组件库初始完整提交。

## 9. 后续事项

优先级建议：

1. 将 GitHub `main` 接入 Cloudflare Pages 自动部署，替代手动 Wrangler 上传。
2. 用正式协议资料进一步完善 Overview，并增加技术架构图；不得补写未经确认的性能、安全或上线数据。
3. 增加浏览器视觉回归（paper / night / jade、compact、移动端）和自动化无障碍检查。
4. 将 Markdown 指南与在线指南改为同源，避免双份维护。
5. 注册 `@nui3` npm 组织并发布包，再把文档中的 workspace 安装方式更新为 npm 安装。
6. 若要展示真实 Ecosystem 案例，先核实项目授权、线上状态和链接，再替换当前的参考应用说明。
