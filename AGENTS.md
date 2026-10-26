# NUI3 — rules for AI agents and developers

NUI3 is the UI kit for Zcash ecosystem apps (Noir: Bridge, TokenDeploy, DEX, Explorer, Lending, Perps, Prediction, Payroll, RPC, NFT, LaunchPad). Read this file before generating UI. Component reference: [`docs/components.json`](docs/components.json). Tokens: [`packages/tokens/src/tokens.json`](packages/tokens/src/tokens.json).

## Setup

```bash
pnpm add @nui3/react @nui3/css      # React apps
pnpm add @nui3/css                  # any framework / plain HTML
```

```tsx
import '@nui3/css';                               // once, at the app root (fonts + tokens + base + components)
import { ThemeProvider, ToastProvider, Button } from '@nui3/react';
```

Embedding inside an existing app (no global reset)? Import `@nui3/css/components.css` and wrap the NUI3 area in `<ThemeProvider>` (or `class="nui-root"`).

Themes: put `data-nui-theme="paper" | "night" | "auto"` on `<html>`, or use `<ThemeProvider theme>`. Compact density for tables/trading: `data-nui-density="compact"`.

## Hard rules (do not break)

1. **Use components or `nui-*` classes. Never hardcode colors, fonts, radii or shadows.** Read values from `var(--nui-*)` semantic tokens (`--nui-text`, `--nui-surface`, `--nui-accent`…). Never use primitives (`--nui-color-*`) in app code except to rebrand.
2. **One solid button per view.** `variant="solid"` is the single primary action (Swap, Bridge, Deploy, Repay). Everything else is `ghost` (default), `outline`, `subtle` or `underline`.
3. **Square corners, no drop shadows.** `--nui-radius-*` is 0 by default; change it only through theme tokens, never per component. Elevation = border + surface color.
4. **Accent ≤ 10% of the screen.** Gold is for the primary CTA, active indicators, focus and key numbers. Never as a page or section background.
5. **Typography:** `Display` (serif) for page/section headlines only. Body, UI, buttons, numbers = Inter (default). Addresses/hashes = mono (handled by `Address`/`Hash`). Headlines end with a period, no exclamation marks.
6. **Privacy wording is fixed.** Use `<PrivacyBadge level>`:
   - `shielded` — Zcash shielded pool only (Orchard/Sapling).
   - `confidential` — Noir confidential execution. **Not** shielded.
   - `public` — transparent addresses, NEAR/EVM/Solana, external DeFi (Rhea, Polymarket).
   Never call a confidential or public flow "private", "anonymous", "fully private" or "shielded". When a flow crosses levels (e.g. Bridge), show both badges and an `<Alert tone="warning">` explaining where privacy changes.
7. **Explorer and public pages never display shielded amounts, senders, recipients or memos.** Show `"Shielded"` / `"Hidden by shielded pool"` instead.
8. **Amounts are bigint base units.** Use `Amount`, `formatAmount`, `parseUnits`, `formatUnits`. Never `parseFloat` a balance or do float math on token amounts. Inputs keep the typed decimal string; convert with `parseUnits(value, token.decimals)` before sending.
9. **Addresses:** show with `<Address>` (type tag + truncation + copy). Validate with `isValidAddress(addr, network)` for UX only — the wallet SDK / node must validate before signing. Memos only go to shielded recipients (`MemoInput` enforces this; `buildPaymentUri` throws).
10. **Trademark:** product names must not contain "Zcash" (say "for Zcash", "works with Zcash"). Your product name is more prominent than the Zcash mark. `<Footer>` always renders the disclaimer: *Not affiliated with the Zcash Foundation or Electric Coin Company.*
11. **Risk disclosure** is required on Bridge, Lending, Perps, Prediction and LaunchPad screens: use `<Alert tone="warning">` near the primary action (slippage, liquidation, leverage, unaudited contracts).
12. **Accessibility:** every input has a label (`<Field label>`; use `hideLabel` to hide it visually, never remove it). Icon buttons use `<IconButton label>`. Don't remove focus outlines. Status changes go through `TxStatus`/`useToast` (live regions included).

## Which component for which job

| Need | Use |
| --- | --- |
| Page shell | `Header` (+ `Brand`, `nav`, `actions`), `Section`, `Shell`, `Footer` |
| Headline block | `Eyebrow` → `Display` → `Lead` |
| KPI bar (TVL, volume, price) | `Stats` + `Stat` (`divided` for the z.cash data bar) |
| Widget / form container | `Panel` (`title`, `actions`, `footer`) |
| Directory / list of projects | `Grid` + `ProjectCard` |
| Amount entry with token | `TokenAmountInput` + `TokenPicker`; flip with `SwapSwitch` |
| Fee / rate / route rows | `DetailList` |
| Detail page fields | `KeyValue` |
| Tables (explorer, positions, pools, payroll) | `DataTable` (`numeric`, `sortValue`) |
| Price / probability series | `PriceChart` for `{t,value}` points; `CandleChart` for OHLCV |
| Payroll CSV paste + review | `BatchPaymentTable` (`rows`, `onChange`, `importMode`) |
| Launch bonding curve | `BondingCurve` / `BondingCurveChart` |
| Multi-step flows (bridge, deploy, launch, payroll run) | `Stepper` |
| Tx state | `TxStatus` (+ `Hash` with explorer `href`) |
| Lending health / perps margin | `HealthFactor` |
| Receive / invoice / payroll payout | `ReceiveQR` + `buildPaymentUri` + `Address` |
| Memo | `Field` + `MemoInput` (pass `recipient`) |
| Wallet sync | `SyncProgress` |
| Category filters | `ChipGroup`; view switch → `Tabs`; small toggles (Long/Short, 1D/1W) → `Segmented` |
| Confirmations | `Dialog` (`dismissible={false}` while signing) |
| Notifications | `ToastProvider` + `useToast()` |
| Empty results | `EmptyState` |

## Page recipes

- **Swap (DEX):** `Panel title="Swap" actions={<PrivacyBadge/>}` → `TokenAmountInput` (pay) → `SwapSwitch` → `TokenAmountInput readOnly` (receive) → `DetailList` (rate, route, fee, slippage) → one `Button variant="solid" block`.
- **Bridge:** source `TokenAmountInput` with `aside={<PrivacyBadge level="shielded"/>}` → destination chain → `Stepper` (deposit, confirmations, mint) → `Alert tone="warning"` about privacy change → solid CTA.
- **Explorer:** `Stats` (height, shielded %, uptime) → `SearchInput` → `DataTable` with `Hash`, `PrivacyBadge describe={false}`, `TxStatus`, numeric `Amount` → tx page with `KeyValue`.
- **Lending:** `Section tone="inverse"` or `Panel` → `KeyValue` (collateral, borrowed, APY, liquidation price) → `HealthFactor` → solid `Repay` + ghost secondary.
- **TokenDeploy / LaunchPad:** `Stepper orientation="horizontal"` → `Field`s (name, symbol, supply via `InputGroup end="TKN"`) → review `KeyValue` → risk `Alert` → solid `Deploy`.
- **Payroll:** `DataTable` (recipient `Address`, `Amount`, `TxStatus`) → `Alert tone="shielded"` about memos/viewing keys → solid `Run payroll`.
- **Marketing / directory pages:** z.cash rhythm: light hero (`Display size="l"`) → `Stats divided` → content → one dark `Section` (`plum` or `navy`, never adjacent) → `Footer`.

## Customizing

Override tokens, not components:

```tsx
// Scoped, at runtime
<ThemeProvider theme="night" tokens={{ accent: '#7ee0c3', 'accent-hover': '#5fcfae', 'accent-text': '#7ee0c3', 'focus-ring': '#7ee0c3' }}>

// Named theme, emitted as CSS
import { defineTheme, checkContrast } from '@nui3/tokens';
const bridge = defineTheme({ name: 'bridge', extends: 'night', tokens: { accent: '#7ee0c3' } });
// inject bridge.css, then <html data-nui-theme="bridge">; verify with checkContrast(bridge.tokens)
```

```css
/* Plain CSS: unlayered rules beat NUI3's @layer nui3.* automatically, no !important */
:root { --nui-accent: #7ee0c3; --nui-radius-base: 6px; }
.my-swap .nui-panel { border-color: var(--nui-border-strong); }
```

When changing `accent`, also set `accent-text` (accent used as text must keep ≥4.5:1 contrast) and run `checkContrast`.

## Don't

- Don't import another UI kit (MUI, Chakra, shadcn) alongside NUI3 on the same screen.
- Don't add gradients, glassmorphism, neon, rounded pill buttons or card shadows.
- Don't put more than one dark section in a row, or mix plum and navy sections next to each other.
- Don't display fake precision: use `formatAmount` (≤4 fraction digits) in lists, `exact` only on confirmations.
- Don't copy z.cash copy or imagery verbatim; write your own.
