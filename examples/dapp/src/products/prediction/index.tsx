import { useState } from 'react';
import {
  Alert, Badge, Button, Card, ChipGroup, Cluster, Countdown, DataTable, DetailList, Disclosure, EmptyState, Grid, KeyValue, LineChart,
  LiveValue, OutcomeButton, Panel, PnL, PrivacyBadge, ProbabilityBar, SearchInput, Segmented, Stat, Stats, Timeline, TokenAmountInput,
  useToast,
} from '@nui3/react';
import { TOKENS, dayLabels, walk } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd, usd } from '../ui';

interface Market {
  id: string;
  question: string;
  zh: string;
  category: string;
  yes: number;
  volume: number;
  endsInDays: number;
  outcomes?: Array<{ label: string; probability: number }>;
}

const MARKETS: Market[] = [
  { id: 'zec-1500', question: 'Will ZEC trade above $1,500 in 2026?', zh: 'ZEC 会在 2026 年突破 $1,500 吗？', category: 'Crypto', yes: 0.42, volume: 2_400_000, endsInDays: 66 },
  { id: 'shielded-half', question: 'Will shielded ZEC exceed 50% of supply?', zh: '屏蔽 ZEC 占比会超过供应量的 50% 吗？', category: 'Crypto', yes: 0.28, volume: 860_000, endsInDays: 96 },
  { id: 'fed-dec', question: 'Fed rate cut at the December meeting?', zh: '美联储 12 月会议会降息吗？', category: 'Macro', yes: 0.634, volume: 18_000_000, endsInDays: 45 },
  { id: 'near-5', question: 'NEAR above $5 before 2027?', zh: 'NEAR 会在 2027 年前突破 $5 吗？', category: 'Crypto', yes: 0.51, volume: 420_000, endsInDays: 70 },
  { id: 'election', question: 'Next US House majority?', zh: '下一届美国众议院多数党？', category: 'Politics', yes: 0.48, volume: 42_000_000, endsInDays: 380, outcomes: [{ label: 'Republican', probability: 0.48 }, { label: 'Democrat', probability: 0.49 }, { label: 'Other', probability: 0.03 }] },
  { id: 'worldcup', question: 'World Cup 2026 winner', zh: '2026 世界杯冠军', category: 'Sports', yes: 0.19, volume: 9_000_000, endsInDays: 20, outcomes: [{ label: 'Brazil', probability: 0.19 }, { label: 'France', probability: 0.17 }, { label: 'England', probability: 0.14 }, { label: 'Other', probability: 0.5 }] },
];

const CATS = ['All', 'Crypto', 'Macro', 'Politics', 'Sports'];
const days = dayLabels(30);

function MarketsPage() {
  const t = useT();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const rows = MARKETS.filter((m) => (cat === 'All' || m.category === cat) && (!q || m.question.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <Cluster justify="space-between" style={{ marginBottom: 20 }}>
        <ChipGroup aria-label={t('Category', '分类')} value={cat} onChange={setCat} options={CATS.map((c) => ({ value: c, label: c === 'All' ? t('All', '全部') : c }))} />
        <SearchInput label={t('Search markets', '搜索市场')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ width: 240 }} />
      </Cluster>
      <Grid cols={2}>
        {rows.map((m) => (
          <Card key={m.id} interactive>
            <Cluster justify="space-between">
              <Badge>{m.category}</Badge>
              <span className="nui-text-muted nui-text-small"><Countdown to={Date.now() + m.endsInDays * 86400000} /></span>
            </Cluster>
            <h3 style={{ margin: '12px 0', fontSize: 18, lineHeight: 1.4 }}><a href={link('prediction', 'market', m.id)} style={{ color: 'inherit' }}>{t(m.question, m.zh)}</a></h3>
            {m.outcomes ? <ProbabilityBar label={m.question} outcomes={m.outcomes} /> : <ProbabilityBar label={m.question} outcomes={[{ label: 'Yes', probability: m.yes, color: 'var(--nui-positive)' }, { label: 'No', probability: 1 - m.yes, color: 'var(--nui-negative)' }]} />}
            <div className="nui-card__foot" style={{ marginTop: 16 }}>
              <span className="nui-text-muted nui-text-small">{t('Volume', '成交量')} {compactUsd(m.volume)}</span>
              <a className="nui-card__link" href={link('prediction', 'market', m.id)}>{t('Trade', '交易')} →</a>
            </div>
          </Card>
        ))}
      </Grid>
    </>
  );
}

function MarketDetail({ market }: { market: Market }) {
  const t = useT();
  const { toast } = useToast();
  const outcomes = market.outcomes ?? [{ label: 'Yes', probability: market.yes }, { label: 'No', probability: 1 - market.yes }];
  const [selected, setSelected] = useState(0);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');
  const prob = outcomes[selected]!.probability;
  const shares = (Number(amount) || 0) / prob;
  const payout = shares;
  const series = outcomes.map((o, k) => ({ name: o.label, data: walk(k + 5, 30, o.probability, 0.12).map((v) => Math.min(0.97, Math.max(0.03, v + (o.probability - v) * 0.5))) }));
  return (
    <Split>
      <Main>
        <Panel title={t('Probability · 30 days', '概率 · 30 天')}>
          <LineChart label={t('Probability history', '概率历史')} height={260} series={series} labels={days} yFormat={(v) => `${Math.round(v * 100)}%`} yMin={0} yMax={1} legend />
        </Panel>
        <Panel title={t('Rules & resolution', '规则与判定')}>
          <Disclosure summary={t('Resolution source', '判定来源')} defaultOpen>
            {t('Resolved by the source market on Polymarket using its published rules and UMA optimistic oracle. Noir does not decide outcomes.', '由 Polymarket 源市场按其公开规则和 UMA 乐观预言机判定，Noir 不参与结果裁决。')}
          </Disclosure>
          <Disclosure summary={t('Privacy of your position', '持仓的隐私性')}>
            {t('Funding from Noir is confidential. The position itself sits on a public prediction market and can be linked to the market account.', '来自 Noir 的资金是机密的，但持仓位于公开预测市场，可能与市场账户关联。')}
          </Disclosure>
        </Panel>
        <Panel title={t('Activity', '动态')}>
          <Timeline
            items={[
              { title: t('Large buy · Yes 12,400 shares', '大额买入 · Yes 12,400 份'), time: '8 min', tone: 'positive' },
              { title: t('Price moved 4¢ after macro news', '宏观消息后价格波动 4¢'), time: '1 h', tone: 'accent' },
              { title: t('New liquidity added', '新增流动性'), time: '6 h', tone: 'info' },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Trade', '交易')} actions={<PrivacyBadge level="public" describe={false} />}>
          <div className="nui-stack" style={{ gap: 10 }}>
            {outcomes.map((o, k) => <OutcomeButton key={o.label} label={o.label} probability={o.probability} selected={selected === k} onClick={() => setSelected(k)} tone={o.label === 'No' ? 'negative' : 'positive'} />)}
          </div>
          <div style={{ marginTop: 16 }}>
            <Segmented aria-label={t('Side', '方向')} value={side} onChange={(v) => setSide(v as 'buy' | 'sell')} options={[{ value: 'buy', label: t('Buy', '买入') }, { value: 'sell', label: t('Sell', '卖出') }]} />
          </div>
          <div style={{ marginTop: 16 }}>
            <TokenAmountInput label={t('Amount', '金额')} value={amount} onChange={setAmount} token={TOKENS[2]} onMax={setAmount} fiat={usd(Number(amount) || 0)} />
          </div>
          <div style={{ marginTop: 16 }}>
            <DetailList
              items={[
                { label: t('Avg price', '均价'), value: `${(prob * 100).toFixed(1)}¢` },
                { label: t('Shares', '份额'), value: shares.toFixed(2) },
                { label: t('Potential payout', '潜在赔付'), value: usd(payout) },
                { label: t('Max profit', '最大收益'), value: <PnL value={payout - (Number(amount) || 0)} /> },
              ]}
            />
          </div>
          <Button variant="solid" block style={{ marginTop: 16 }} disabled={!amount} onClick={() => toast({ title: t('Order submitted', '订单已提交'), description: `${side} ${shares.toFixed(2)} ${outcomes[selected]!.label}`, tone: 'positive' })}>{t('Place order', '下单')}</Button>
        </Panel>
        <Alert tone="warning" title={t('You can lose the full stake', '可能损失全部本金')}>
          {t('Shares in a losing outcome settle at $0. Only trade what you can afford to lose.', '失败方的份额结算为 $0，请只用可承受损失的资金参与。')}
        </Alert>
      </Side>
    </Split>
  );
}

function Portfolio() {
  const t = useT();
  const { toast } = useToast();
  const positions = [
    { id: 'p1', market: MARKETS[0]!, shares: 1200, avg: 0.36, current: MARKETS[0]!.yes },
    { id: 'p2', market: MARKETS[2]!, shares: 4000, avg: 0.58, current: MARKETS[2]!.yes },
    { id: 'p3', market: MARKETS[4]!, shares: 800, avg: 0.52, current: MARKETS[4]!.yes },
  ];
  return (
    <>
      <Stats divided style={{ marginBottom: 24 }}>
        <Stat size="sm" label={t('Position value', '持仓价值')} value={usd(positions.reduce((s, p) => s + p.shares * p.current, 0))} />
        <Stat size="sm" label={t('Unrealized PnL', '未实现盈亏')} value={<PnL value={positions.reduce((s, p) => s + p.shares * (p.current - p.avg), 0)} />} />
        <Stat size="sm" label={t('Claimable', '可领取')} value={usd(1240)} />
      </Stats>
      <DataTable
        rows={positions}
        rowKey={(p) => p.id}
        columns={[
          { key: 'market', header: t('Market', '市场'), cell: (p) => <a href={link('prediction', 'market', p.market.id)}>{t(p.market.question, p.market.zh)}</a> },
          { key: 'shares', header: t('Shares', '份额'), numeric: true, cell: (p) => p.shares.toLocaleString('en-US') },
          { key: 'avg', header: t('Avg price', '均价'), numeric: true, cell: (p) => `${(p.avg * 100).toFixed(1)}¢` },
          { key: 'now', header: t('Now', '现价'), numeric: true, cell: (p) => <LiveValue value={p.current * 100} format={(v) => `${v.toFixed(1)}¢`} /> },
          { key: 'pnl', header: 'PnL', numeric: true, cell: (p) => <PnL value={p.shares * (p.current - p.avg)} percent={((p.current - p.avg) / p.avg) * 100} />, sortValue: (p) => p.shares * (p.current - p.avg) },
        ]}
      />
      <Cluster gap={6} style={{ marginTop: 20 }}>
        <Button variant="solid" onClick={() => toast({ title: t('Winnings claimed', '收益已领取'), description: usd(1240), tone: 'positive' })}>{t('Claim winnings', '领取收益')}</Button>
        <Button href={link('lending')}>{t('Borrow USDC to trade', '借入 USDC 交易')}</Button>
      </Cluster>
    </>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const market = MARKETS.find((m) => m.id === arg);
  const body = page === 'portfolio' ? <Portfolio /> : page === 'market' ? (market ? <MarketDetail market={market} /> : <EmptyState title={t('Market not found.', '市场不存在。')} action={<Button href={link('prediction')}>{t('All markets', '全部市场')}</Button>} />) : <MarketsPage />;
  return (
    <ProductShell product="prediction" page={page === 'market' ? '' : (page ?? '')} title={page === 'market' && market ? t(market.question, market.zh) : undefined} crumbs={page === 'market' ? [{ label: t('Markets', '市场'), href: link('prediction') }, { label: arg }] : undefined} lead={!page ? t('Trade real-world outcomes. Positions settle on public prediction markets; funding from Noir is confidential.', '交易真实事件结果。仓位在公开预测市场结算，来自 Noir 的资金是机密的。') : undefined}>
      {body}
    </ProductShell>
  );
}
