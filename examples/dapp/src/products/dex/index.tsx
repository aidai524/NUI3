import { useState } from 'react';
import {
  Alert, Amount, Badge, BarChart, Button, Card, ChipGroup, Cluster, DataTable, DetailList, DonutChart, EmptyState, Field, Grid, KeyValue,
  LineChart, Meter, Panel, PrivacyBadge, SearchInput, Sparkline, Stat, Stats, Timeline, TokenAmountInput, TokenIcon, TokenPair,
  formatAmount, useToast,
} from '@nui3/react';
import { dayLabels } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd, usd } from '../ui';
import { Swap } from './Swap';
import { DEX_TOKENS, POOLS, apyHistory, tvlHistory, volumeHistory, type Pool } from './data';

const days = dayLabels(30);

function Pools() {
  const t = useT();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'tvl' | 'apr' | 'volume'>('tvl');
  const pools = POOLS.filter((p) => !q || `${p.base}${p.quote}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b[sort === 'volume' ? 'volume24h' : sort] - a[sort === 'volume' ? 'volume24h' : sort]);
  return (
    <>
      <Stats divided style={{ marginBottom: 24 }}>
        <Stat size="sm" label={t('Total liquidity', '总流动性')} value={compactUsd(POOLS.reduce((s, p) => s + p.tvl, 0))} />
        <Stat size="sm" label={t('24h volume', '24h 成交')} value={compactUsd(POOLS.reduce((s, p) => s + p.volume24h, 0))} />
        <Stat size="sm" label={t('Pools', '池数量')} value={POOLS.length} />
      </Stats>
      <Split>
        <Main>
          <Cluster justify="space-between">
            <ChipGroup aria-label={t('Sort pools', '池排序')} value={sort} onChange={(v) => setSort(v as typeof sort)} options={[{ value: 'tvl', label: 'TVL' }, { value: 'volume', label: t('Volume', '成交量') }, { value: 'apr', label: 'APR' }]} />
            <SearchInput label={t('Search pools', '搜索池')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ width: 220 }} />
          </Cluster>
          <DataTable
            rows={pools}
            rowKey={(p) => p.id}
            empty={<EmptyState title={t('No pools match.', '没有匹配的池。')} />}
            columns={[
              { key: 'pool', header: t('Pool', '池'), cell: (p) => <a href={link('dex', 'pool', p.id)} className="nui-cluster" style={{ gap: 10, color: 'inherit', textDecoration: 'none' }}><TokenPair base={{ symbol: p.base }} quote={{ symbol: p.quote }} /><strong>{p.base}/{p.quote}</strong><Badge>{p.fee}%</Badge></a> },
              { key: 'tvl', header: 'TVL', numeric: true, cell: (p) => compactUsd(p.tvl), sortValue: (p) => p.tvl },
              { key: 'vol', header: t('24h volume', '24h 成交'), numeric: true, cell: (p) => compactUsd(p.volume24h), sortValue: (p) => p.volume24h },
              { key: 'apr', header: 'APR', numeric: true, cell: (p) => <span style={{ color: 'var(--nui-positive)', fontWeight: 600 }}>{p.apr}%</span>, sortValue: (p) => p.apr },
              { key: 'trend', header: t('30d APR', '30 天 APR'), cell: (p) => <Sparkline data={apyHistory(p.seed)} label="APR" /> },
            ]}
          />
        </Main>
        <Side>
          <Panel title={t('Volume · 30 days', '成交量 · 30 天')}>
            <BarChart label={t('DEX volume', 'DEX 成交量')} data={volumeHistory(7).map((v, k) => ({ label: days[k]!, value: v }))} yFormat={(v) => compactUsd(v)} height={220} />
          </Panel>
          <Panel title={t('Liquidity by pool', '池流动性占比')}>
            <DonutChart label={t('Liquidity share', '流动性占比')} data={POOLS.map((p) => ({ label: `${p.base}/${p.quote}`, value: p.tvl }))} center={<strong>{compactUsd(POOLS.reduce((s, p) => s + p.tvl, 0))}</strong>} />
          </Panel>
        </Side>
      </Split>
    </>
  );
}

function PoolDetail({ pool }: { pool: Pool }) {
  const t = useT();
  return (
    <Split>
      <Main>
        <Stats divided>
          <Stat size="sm" label="TVL" value={compactUsd(pool.tvl)} />
          <Stat size="sm" label={t('24h volume', '24h 成交')} value={compactUsd(pool.volume24h)} />
          <Stat size="sm" label={t('Fees earned · LP', 'LP 手续费收益')} value={`${pool.apr}%`} />
        </Stats>
        <Panel title={t('Liquidity · 30 days', '流动性 · 30 天')}>
          <LineChart label="TVL" height={240} series={[{ name: 'TVL', data: tvlHistory(pool.seed), area: true }]} labels={days} yFormat={(v) => compactUsd(v)} />
        </Panel>
        <Panel title={t('Recent activity', '最近动态')}>
          <Timeline
            items={[
              { title: t('Swap 12.5 ZEC → USDC', '兑换 12.5 ZEC → USDC'), time: '2 min', tone: 'accent', description: t('Fee 0.3% · route Noir → Rhea', '手续费 0.3% · 路由 Noir → Rhea') },
              { title: t('Liquidity added', '添加流动性'), time: '26 min', tone: 'positive', description: `+${compactUsd(24_000)} · u1…9f2c` },
              { title: t('Liquidity removed', '移除流动性'), time: '1 h', tone: 'negative', description: `−${compactUsd(8_200)} · u1…41ab` },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Pool parameters', '池参数')}>
          <KeyValue
            items={[
              { label: t('Pair', '交易对'), value: `${pool.base}/${pool.quote}` },
              { label: t('Fee tier', '费率档'), value: `${pool.fee}%` },
              { label: t('Execution', '执行环境'), value: <PrivacyBadge level="confidential" describe={false} /> },
              { label: t('Underlying venue', '底层市场'), value: <PrivacyBadge level="public" describe={false} /> },
              { label: t('Protocol', '协议'), value: 'Rhea AMM' },
            ]}
          />
          <Cluster gap={6} style={{ marginTop: 20 }}>
            <Button variant="solid" href={link('dex', 'add')}>{t('Add liquidity', '添加流动性')}</Button>
            <Button href={link('dex')}>{t('Swap', '兑换')}</Button>
          </Cluster>
        </Panel>
        <Alert tone="info" title={t('Impermanent loss', '无常损失')}>
          {t('Providing liquidity exposes you to both assets. If their relative price moves, you may end up with less value than simply holding.', '提供流动性会让你同时持有两种资产。相对价格变化时，收益可能低于单纯持币。')}
        </Alert>
      </Side>
    </Split>
  );
}

function AddLiquidity() {
  const t = useT();
  const { toast } = useToast();
  const [a, setA] = useState('2');
  const [b, setB] = useState('1900');
  const [pool, setPool] = useState(POOLS[0]!);
  const total = Number(a) * 951.63 + Number(b);
  return (
    <Split>
      <Main>
        <Panel title={t('Add liquidity', '添加流动性')}>
          <Field label={t('Pool', '池')}>
            <select className="nui-select" value={pool.id} onChange={(e) => setPool(POOLS.find((p) => p.id === e.target.value)!)}>
              {POOLS.map((p) => <option key={p.id} value={p.id}>{p.base}/{p.quote} · {p.fee}%</option>)}
            </select>
          </Field>
          <div className="nui-stack" style={{ gap: 16, marginTop: 16 }}>
            <TokenAmountInput label={pool.base} value={a} onChange={setA} token={{ symbol: pool.base, decimals: 8, balance: 1284500000n }} onMax={setA} />
            <TokenAmountInput label={pool.quote} value={b} onChange={setB} token={{ symbol: pool.quote, decimals: 6, balance: 2500120000n }} onMax={setB} />
          </div>
          <div style={{ marginTop: 20 }}>
            <DetailList
              items={[
                { label: t('Deposit value', '存入价值'), value: usd(total || 0) },
                { label: t('Share of pool', '池份额'), value: `${((total / (pool.tvl + total)) * 100).toFixed(3)}%` },
                { label: t('Est. APR', '预计 APR'), value: `${pool.apr}%` },
              ]}
            />
          </div>
          <Button variant="solid" block style={{ marginTop: 20 }} disabled={!a || !b} onClick={() => toast({ title: t('Liquidity added', '流动性已添加'), description: `${pool.base}/${pool.quote} · ${usd(total)}`, tone: 'positive' })}>{t('Supply', '存入')}</Button>
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Your deposit', '存入构成')}>
          <DonutChart label={t('Deposit split', '存入比例')} data={[{ label: pool.base, value: Number(a) * 951.63 || 1 }, { label: pool.quote, value: Number(b) || 1 }]} center={<strong>{usd(total || 0)}</strong>} />
        </Panel>
        <Panel title={t('Pool utilization', '池利用率')}>
          <Meter label={t('Your share after deposit', '存入后你的份额')} value={total} max={pool.tvl / 100} valueLabel={`${((total / (pool.tvl + total)) * 100).toFixed(3)}%`} />
        </Panel>
      </Side>
    </Split>
  );
}

function Positions() {
  const t = useT();
  const { toast } = useToast();
  return (
    <Grid cols={2}>
      {POOLS.slice(0, 2).map((p, k) => (
        <Card key={p.id}>
          <Cluster justify="space-between">
            <span className="nui-cluster" style={{ gap: 10 }}><TokenPair base={{ symbol: p.base }} quote={{ symbol: p.quote }} /><strong>{p.base}/{p.quote}</strong></span>
            <Badge tone="positive" dot>{t('Active', '进行中')}</Badge>
          </Cluster>
          <KeyValue
            items={[
              { label: t('Liquidity', '流动性'), value: usd(k ? 4200 : 12800) },
              { label: t('Pool share', '池份额'), value: k ? '0.102%' : '0.068%' },
              { label: t('Unclaimed fees', '未领取手续费'), value: <Amount value={k ? 18200000n : 52400000n} decimals={6} symbol="USDC" /> },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            <Meter label={t('Fees vs target', '手续费目标进度')} value={k ? 18 : 52} max={100} tone="positive" valueLabel={`${k ? 18 : 52}%`} />
          </div>
          <Cluster gap={6} style={{ marginTop: 16 }}>
            <Button variant="solid" onClick={() => toast({ title: t('Fees claimed', '手续费已领取'), tone: 'positive' })}>{t('Claim fees', '领取手续费')}</Button>
            <Button href={link('dex', 'pool', p.id)}>{t('Manage', '管理')}</Button>
          </Cluster>
        </Card>
      ))}
    </Grid>
  );
}

function Tokens() {
  const t = useT();
  const [q, setQ] = useState('');
  return (
    <>
      <SearchInput label={t('Search tokens', '搜索代币')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ maxWidth: 320, marginBottom: 20 }} />
      <DataTable
        rows={DEX_TOKENS.filter((x) => !q || `${x.symbol}${x.name}`.toLowerCase().includes(q.toLowerCase()))}
        rowKey={(x) => x.symbol}
        columns={[
          { key: 'token', header: t('Token', '代币'), cell: (x) => <span className="nui-cluster" style={{ gap: 10 }}><TokenIcon symbol={x.symbol} /><span><strong>{x.symbol}</strong><span className="nui-text-muted" style={{ marginLeft: 8 }}>{x.name}</span></span>{x.verified && <Badge tone="info">{t('Verified', '已认证')}</Badge>}</span> },
          { key: 'price', header: t('Price', '价格'), numeric: true, cell: (x) => usd(x.price, x.price < 10 ? 4 : 2), sortValue: (x) => x.price },
          { key: 'change', header: '24h', numeric: true, cell: (x) => <span style={{ color: x.change >= 0 ? 'var(--nui-positive)' : 'var(--nui-negative)' }}>{x.change > 0 ? '+' : ''}{x.change}%</span>, sortValue: (x) => x.change },
          { key: 'volume', header: t('Volume', '成交量'), numeric: true, cell: (x) => compactUsd(x.volume), sortValue: (x) => x.volume },
          { key: 'liq', header: t('Liquidity', '流动性'), numeric: true, cell: (x) => compactUsd(x.liquidity) },
          { key: 'chart', header: '7d', cell: (x) => <Sparkline data={apyHistory(x.seed)} /> },
        ]}
      />
      <Alert tone="warning" title={t('Unverified tokens', '未认证代币')} style={{ marginTop: 20 }}>
        {t('Anyone can create a token. Check the contract before trading unverified assets.', '任何人都可以发币。交易未认证资产前请核对合约。')}
      </Alert>
    </>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const pool = POOLS.find((p) => p.id === arg);
  let body;
  switch (page) {
    case undefined: body = <Swap />; break;
    case 'pools': body = <Pools />; break;
    case 'pool': body = pool ? <PoolDetail pool={pool} /> : <EmptyState title={t('Pool not found.', '池不存在。')} action={<Button href={link('dex', 'pools')}>{t('All pools', '全部池')}</Button>} />; break;
    case 'add': body = <AddLiquidity />; break;
    case 'positions': body = <Positions />; break;
    case 'tokens': body = <Tokens />; break;
    default: body = <Swap />;
  }
  return (
    <ProductShell product="dex" page={page === 'pool' ? 'pools' : (page ?? '')} title={page === 'pool' && pool ? `${pool.base} / ${pool.quote}` : undefined} lead={!page ? t('Swap ZEC, stablecoins and new tokens through Rhea liquidity.', '通过 Rhea 流动性兑换 ZEC、稳定币和新代币。') : undefined} crumbs={page === 'pool' ? [{ label: t('Pools', '流动性池'), href: link('dex', 'pools') }, { label: arg }] : undefined}>
      {body}
    </ProductShell>
  );
}
