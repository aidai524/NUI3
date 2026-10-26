// Live demo for every component in docs/components.json. Keys must match manifest names exactly.
import { useState, type ReactNode } from 'react';
import * as N from '@nui3/react';
import { ADDR, TOKENS, walk } from '../data';
import { useCandles, useOrderBook, usePrice } from '../sim';

const series = walk(7, 24, 100, 0.06, 0.004);
const labels = series.map((_, k) => `${k}:00`);
const rows = [{ id: 'a', symbol: 'ZEC', value: 12.5 }, { id: 'b', symbol: 'USDC', value: 2400 }, { id: 'c', symbol: 'NEAR', value: 18.2 }];
const token = TOKENS[0]!;
const positions: N.Position[] = [{ id: 'p1', market: 'ZEC-PERP', side: 'long', size: '12.5 ZEC', entry: 912, mark: 951, liq: 741, leverage: 5, pnl: 480, pnlPercent: 10.5 }];
const book = { bids: [[950.5, 1.2], [950, 2.4], [949.5, 0.8]] as N.BookLevel[], asks: [[951.5, 1.1], [952, 2.2], [952.5, 1.6]] as N.BookLevel[] };

function LivePrice({ colored = true }: { colored?: boolean }) {
  const { price } = usePrice('ZEC');
  return <N.LiveValue value={price} format={(v) => `$${v.toFixed(2)}`} colored={colored} />;
}
function Candles() {
  const candles = useCandles('ZEC', 48);
  const { price } = usePrice('ZEC');
  return <N.CandleChart label="ZEC/USDC" candles={candles} lastPrice={price} height={300} />;
}
function Book() {
  const { bids, asks } = useOrderBook('ZEC', 8);
  const { price } = usePrice('ZEC');
  return <N.OrderBook bids={bids} asks={asks} last={price} lastDirection="up" baseSymbol="ZEC" quoteSymbol="USDC" />;
}

export const demos: Record<string, () => ReactNode> = {
  ThemeProvider: () => <N.ThemeProvider theme="night" tokens={{ accent: '#7ee0c3' }} style={{ padding: 24 }}><N.Button variant="solid">Themed button</N.Button></N.ThemeProvider>,
  'LocaleProvider / useNuiLocale': () => <N.LocaleProvider locale="zh"><N.Cluster><N.PrivacyBadge level="shielded" /><N.TxStatus status="confirmed" /><N.Button>确认</N.Button></N.Cluster></N.LocaleProvider>,
  Display: () => <N.Display size="s">Stay shielded.</N.Display>,
  Heading: () => <div className="nui-stack"><N.Heading>Section heading</N.Heading><N.Heading level={3}>Card heading</N.Heading></div>,
  Eyebrow: () => <div className="nui-stack"><N.Eyebrow>Zcash ecosystem</N.Eyebrow><N.Eyebrow accent>Accent eyebrow</N.Eyebrow></div>,
  Lead: () => <N.Lead>Wallets, bridges and markets for shielded assets, compared in one place.</N.Lead>,
  Shell: () => <N.Shell style={{ border: '1px dashed var(--nui-border)', padding: 16 }}>Centered max-width container</N.Shell>,
  Section: () => <N.Section tone="plum" style={{ padding: 32 }}><N.Heading style={{ color: 'inherit' }}>Dark section</N.Heading></N.Section>,
  Stack: () => <N.Stack gap={3}><N.Badge>One</N.Badge><N.Badge>Two</N.Badge></N.Stack>,
  Cluster: () => <N.Cluster><N.Button>First</N.Button><N.Button>Second</N.Button></N.Cluster>,
  Grid: () => <N.Grid cols={3}>{[1, 2, 3].map((k) => <N.Card key={k}>Card {k}</N.Card>)}</N.Grid>,
  Button: () => <N.Cluster><N.Button variant="solid">Primary</N.Button><N.Button>Ghost</N.Button><N.Button variant="outline">Outline</N.Button><N.Button variant="subtle">Subtle</N.Button><N.Button loading>Loading</N.Button></N.Cluster>,
  IconButton: () => <N.IconButton label="Copy"><N.CopyIcon /></N.IconButton>,
  ChipGroup: () => { const [v, setV] = useState('all'); return <N.ChipGroup aria-label="Category" value={v} onChange={setV} options={[{ value: 'all', label: 'All', count: 12 }, { value: 'dex', label: 'DEX', count: 4 }, { value: 'lend', label: 'Lending', count: 2 }]} />; },
  Tabs: () => { const [v, setV] = useState('a'); return <><N.Tabs id="demo" aria-label="Views" value={v} onChange={setV} items={[{ value: 'a', label: 'Positions' }, { value: 'b', label: 'Orders' }]} /><N.TabPanel tabsId="demo" value="a" active={v === 'a'}>Positions content</N.TabPanel><N.TabPanel tabsId="demo" value="b" active={v === 'b'}>Orders content</N.TabPanel></>; },
  TabPanel: () => <N.TabPanel tabsId="demo" value="a" active>Standalone panel</N.TabPanel>,
  Segmented: () => { const [v, setV] = useState('long'); return <N.Segmented aria-label="Side" value={v} onChange={setV} options={[{ value: 'long', label: 'Long' }, { value: 'short', label: 'Short' }]} />; },
  Field: () => <N.Field label="Recipient" hint="Unified address"><N.Input mono placeholder="u1…" /></N.Field>,
  Input: () => <N.Input placeholder="Amount" />,
  Textarea: () => <N.Textarea rows={3} placeholder="Notes" />,
  Select: () => <N.Select defaultValue="Zcash"><option>Zcash</option><option>Noir</option></N.Select>,
  InputGroup: () => <N.InputGroup end="%" defaultValue="0.5" aria-label="Slippage" />,
  SearchInput: () => { const [q, setQ] = useState(''); return <N.SearchInput label="Search" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />; },
  Switch: () => { const [v, setV] = useState(true); return <N.Switch label="Hide balances" checked={v} onChange={setV} />; },
  Checkbox: () => <N.Checkbox label="I understand the risks" />,
  ZcashMark: () => <N.Cluster><N.ZcashMark size={40} /><N.ZcashMark size={40} variant="mono" /></N.Cluster>,
  Brand: () => <N.Brand name="Noir" sub="Bridge" />,
  Header: () => <div style={{ border: '1px solid var(--nui-border)' }}><N.Header brand={<N.Brand name="Noir" />} nav={[{ label: 'Trade', href: '#', children: [{ label: 'Swap', href: '#', current: true, description: 'Spot markets' }] }]} actions={<N.Button size="sm" variant="outline">Connect</N.Button>} /></div>,
  Breadcrumb: () => <N.Breadcrumb items={[{ label: 'Explorer', href: '#' }, { label: 'Tx' }]} />,
  Footer: () => <N.Footer tagline="Example footer" columns={[{ title: 'Build', links: [{ label: 'Docs', href: '#' }] }]} legal="© 2026 Noir" />,
  Card: () => <N.Card interactive><h3 className="nui-card__title">Card</h3><p className="nui-card__desc">Hover for the gold rule.</p></N.Card>,
  ProjectCard: () => <N.ProjectCard name="Zodl" description="Self-custodial wallet" href="https://zodl.com" tags={['wallets']} index={1} />,
  Panel: () => <N.Panel title="Panel" actions={<N.Badge>Live</N.Badge>}>Body content</N.Panel>,
  Stats: () => <N.Stats divided><N.Stat label="TVL" value="48.2" unit="M" /><N.Stat label="Shielded" value="4.87" unit="M" /></N.Stats>,
  Stat: () => <dl><N.Stat label="ZEC price" value="$951.63" delta={<N.PriceChange value={2.4} />} /></dl>,
  Badge: () => <N.Cluster><N.Badge tone="positive" dot>Active</N.Badge><N.Badge tone="warning">Watch</N.Badge><N.Badge tone="accent">New</N.Badge></N.Cluster>,
  Alert: () => <N.Alert tone="warning" title="Liquidation risk">Collateral can be sold if health drops to 1.0.</N.Alert>,
  DataTable: () => <N.DataTable rows={rows} rowKey={(r) => r.id} columns={[{ key: 's', header: 'Asset', cell: (r) => r.symbol }, { key: 'v', header: 'Value', numeric: true, cell: (r) => r.value, sortValue: (r) => r.value }]} />,
  KeyValue: () => <N.KeyValue items={[{ label: 'Fee', value: '0.0001 ZEC' }, { label: 'Route', value: 'Noir → Rhea' }]} />,
  Stepper: () => <N.Stepper steps={[{ title: 'Deposit', state: 'complete' }, { title: 'Confirmations', state: 'active', description: '3 / 10' }, { title: 'Mint', state: 'pending' }]} />,
  Progress: () => <N.Progress label="Sync" value={64} />,
  Skeleton: () => <N.Stack><N.Skeleton width={180} height={20} /><N.Skeleton height={80} /></N.Stack>,
  EmptyState: () => <N.EmptyState title="Nothing matches." action={<N.Button>Clear filters</N.Button>} />,
  Dialog: () => { const [o, setO] = useState(false); return <><N.Button onClick={() => setO(true)}>Open dialog</N.Button><N.Dialog open={o} onClose={() => setO(false)} title="Confirm" footer={<N.Button variant="solid" onClick={() => setO(false)}>Confirm</N.Button>}>Dialog body</N.Dialog></>; },
  Drawer: () => { const [o, setO] = useState(false); return <><N.Button onClick={() => setO(true)}>Open drawer</N.Button><N.Drawer open={o} onClose={() => setO(false)} title="Details">Drawer body</N.Drawer></>; },
  'ToastProvider / useToast': () => { const { toast } = N.useToast(); return <N.Button onClick={() => toast({ title: 'Swap submitted', tone: 'positive' })}>Show toast</N.Button>; },
  Address: () => <N.Address address={ADDR.unified} />,
  Hash: () => <N.Hash value="46e768905750424dadd650ca6163eadd8a018dd6f1b7f5e11c511b173d1bd5f2" />,
  'CopyButton / useCopy': () => <N.CopyButton value={ADDR.sapling} label="Copy address" />,
  Amount: () => <N.Cluster><N.Amount value={123450000n} fiat={117.4} /><N.Amount value={250000000n} sign="auto" /><N.Amount value={123450000n} hidden /></N.Cluster>,
  PriceChange: () => <N.Cluster><N.PriceChange value={2.41} /><N.PriceChange value={-1.2} /></N.Cluster>,
  PrivacyBadge: () => <N.Cluster><N.PrivacyBadge level="shielded" /><N.PrivacyBadge level="confidential" /><N.PrivacyBadge level="public" /></N.Cluster>,
  PoolBadge: () => <N.Cluster><N.PoolBadge pool="orchard" /><N.PoolBadge pool="sapling" /><N.PoolBadge pool="transparent" /></N.Cluster>,
  ChainBadge: () => <N.Cluster><N.ChainBadge name="Zcash" /><N.ChainBadge name="Noir" /></N.Cluster>,
  'TokenIcon / TokenPair': () => <N.Cluster><N.TokenIcon symbol="ZEC" size="lg" /><N.TokenPair base={{ symbol: 'ZEC' }} quote={{ symbol: 'USDC' }} size="lg" /></N.Cluster>,
  TxStatus: () => <N.Cluster><N.TxStatus status="confirming" confirmations={3} required={10} /><N.TxStatus status="confirmed" /><N.TxStatus status="failed" /></N.Cluster>,
  SyncProgress: () => <N.SyncProgress height={3104920} tip={3120448} from={2900000} eta="4 min" />,
  MemoInput: () => { const [m, setM] = useState('Invoice #42'); return <N.MemoInput value={m} onChange={setM} recipient={ADDR.sapling} />; },
  ReceiveQR: () => <N.ReceiveQR value={N.buildPaymentUri({ address: ADDR.sapling, amount: '0.25', memo: 'Thanks' })} caption="ZIP-321 · 0.25 ZEC" />,
  TokenAmountInput: () => { const [v, setV] = useState('1.5'); return <N.TokenAmountInput label="You pay" value={v} onChange={setV} token={token} onMax={setV} />; },
  TokenPicker: () => { const [o, setO] = useState(false); const [tk, setTk] = useState(token); return <><N.Button onClick={() => setO(true)}>Select: {tk.symbol}</N.Button><N.TokenPicker open={o} onClose={() => setO(false)} tokens={TOKENS} popular={TOKENS.slice(0, 3)} onSelect={setTk} /></>; },
  SwapSwitch: () => <N.SwapSwitch onClick={() => undefined} />,
  HealthFactor: () => <N.Stack><N.HealthFactor value={1.9} /><N.HealthFactor value={1.2} /></N.Stack>,
  DetailList: () => <N.DetailList items={[{ label: 'Rate', value: '1 ZEC = 951.63 USDC' }, { label: 'Fee', value: '0.30%' }]} />,
  LineChart: () => <N.LineChart label="TVL" series={[{ name: 'TVL', data: series, area: true }, { name: 'Volume', data: series.map((v) => v * 0.6), dashed: true }]} labels={labels} legend />,
  PriceChart: () => <N.PriceChart label="Yes probability" data={series.map((v, k) => ({ t: labels[k]!, value: Math.max(0.05, Math.min(0.95, v / 150)) }))} priceFormat={(v) => `${(v * 100).toFixed(0)}%`} />,
  CandleChart: () => <Candles />,
  BarChart: () => <N.BarChart label="Volume" signed data={series.slice(0, 12).map((v, k) => ({ label: `${k}`, value: v - 90 }))} />,
  DonutChart: () => <N.DonutChart label="Pools" data={[{ label: 'Orchard', value: 22 }, { label: 'Sapling', value: 9 }, { label: 'Transparent', value: 69 }]} center={<strong>31.2%</strong>} />,
  DepthChart: () => <N.DepthChart label="Depth" bids={book.bids} asks={book.asks} />,
  BondingCurve: () => <N.BondingCurve label="Curve" price={(s) => 0.02 + s * 0.000004} maxSupply={1000000} sold={420000} />,
  BondingCurveChart: () => <N.BondingCurveChart label="Curve" price={(s) => 0.02 + s * 0.000004} maxSupply={1000000} sold={420000} />,
  Sparkline: () => <N.Cluster><N.Sparkline data={series} /><N.Sparkline data={[...series].reverse()} /></N.Cluster>,
  Legend: () => <N.Legend items={[{ label: 'Orchard', color: 'var(--nui-chart-1)' }, { label: 'Sapling', color: 'var(--nui-chart-2)' }]} />,
  OrderBook: () => <Book />,
  Slider: () => { const [v, setV] = useState(40); return <N.Slider label="Allocation" value={v} onChange={setV} marks={[0, 25, 50, 75, 100]} format={(x) => `${x}%`} />; },
  LeverageSlider: () => { const [v, setV] = useState(5); return <N.LeverageSlider value={v} onChange={setV} max={20} />; },
  PnL: () => <N.Cluster><N.PnL value={480} percent={10.5} /><N.PnL value={-120} /></N.Cluster>,
  PositionTable: () => <N.PositionTable positions={positions} onClose={() => undefined} />,
  LiveValue: () => <LivePrice />,
  Countdown: () => <N.Countdown to={Date.now() + 5 * 86400000 + 3600000} />,
  Meter: () => <N.Meter label="Raised" value={62000} max={150000} marks={[{ value: 50000, label: 'Soft cap' }]} />,
  UptimeBar: () => <N.UptimeBar label="RPC · 45 days" days={Array.from({ length: 45 }, (_, k) => ({ date: `d${k}`, status: k === 12 ? 'degraded' as const : 'operational' as const }))} />,
  OutcomeButton: () => { const [s, setS] = useState(0); return <N.Stack><N.OutcomeButton label="Yes" probability={0.63} selected={s === 0} onClick={() => setS(0)} tone="positive" /><N.OutcomeButton label="No" probability={0.37} selected={s === 1} onClick={() => setS(1)} tone="negative" /></N.Stack>; },
  ProbabilityBar: () => <N.ProbabilityBar label="Winner" outcomes={[{ label: 'Yes', probability: 0.63, color: 'var(--nui-positive)' }, { label: 'No', probability: 0.37, color: 'var(--nui-negative)' }]} />,
  CodeBlock: () => <N.CodeBlock snippets={[{ label: 'curl', code: 'curl https://lwd.noir.example/v1/blocks/latest' }, { label: 'JS', code: "await fetch('/v1/blocks/latest')" }]} />,
  SecretField: () => <N.SecretField value="nui_live_9f2c41d0e7a86b35c1d94e0f2a7b6c8d" />,
  Timeline: () => <N.Timeline items={[{ title: 'Deposit detected', time: '12:04', tone: 'positive' }, { title: 'Minted on Noir', time: '12:16', tone: 'accent' }]} />,
  Pagination: () => { const [p, setP] = useState(3); return <N.Pagination page={p} pages={10} onChange={setP} />; },
  Tooltip: () => <N.Tooltip content="Annual percentage rate"><N.Button>APR</N.Button></N.Tooltip>,
  InfoTip: () => <span>Borrow APY <N.InfoTip content="Rate paid per year on borrowed assets" /></span>,
  Disclosure: () => <N.Disclosure summary="How routing works" defaultOpen>Orders route through Rhea liquidity.</N.Disclosure>,
  FileDrop: () => <N.FileDrop accept=".csv" onFiles={() => undefined} hint="name, address, amount, memo" />,
  SubNav: () => <N.SubNav aria-label="DEX" items={[{ label: 'Swap', href: '#', current: true }, { label: 'Pools', href: '#' }, { label: 'Positions', href: '#', badge: 2 }]} />,
  Identicon: () => <N.Cluster><N.Identicon value={ADDR.unified} size={48} /><N.Identicon value="art-demo" variant="art" size={96} /></N.Cluster>,
  NFTCard: () => <div style={{ maxWidth: 240 }}><N.NFTCard name="Shielded Punk #101" collection="Shielded Punks" seed="punk-1" price="2.4 ZEC" /></div>,
  BatchPayments: () => <N.BatchPayments rows={[{ name: 'Ana', address: ADDR.sapling, amount: '2.5', memo: 'Salary' }, { name: 'Lee', address: ADDR.tex, amount: '1.2' }]} />,
  BatchPaymentTable: () => { const [rows, setRows] = useState<N.PaymentRow[]>([{ name: 'Ana', address: ADDR.sapling, amount: '2.5', memo: 'Salary' }]); return <N.BatchPaymentTable rows={rows} onChange={setRows} />; },
  usePrivacyLevel: () => <PrivacyLevelDemo />,
};

function PrivacyLevelDemo() {
  const meta = N.usePrivacyLevel('confidential');
  return <N.Alert title={meta.label}>{meta.description}</N.Alert>;
}
