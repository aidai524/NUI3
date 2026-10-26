import { useMemo, useState } from 'react';
import {
  Alert, Amount, Badge, BarChart, Button, Card, Cluster, DataTable, DetailList, Dialog, Disclosure, DonutChart, Drawer, EmptyState, Grid,
  HealthFactor, InfoTip, KeyValue, LineChart, Meter, Panel, PriceChange, Sparkline, Stat, Stats, Switch, TokenAmountInput, TokenIcon, useToast,
} from '@nui3/react';
import { MARKETS, TOKENS, dayLabels, walk } from '../../data';
import { usePrice } from '../../sim';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd, usd } from '../ui';

const days = dayLabels(30);
const DEBT = 2400;
const COLLATERAL_ZEC = 5;
const LIQ_THRESHOLD = 0.72;

const rateModel = Array.from({ length: 21 }, (_, k) => k * 5).map((u) => ({ u, apy: u <= 80 ? 2 + (u / 80) * 4 : 6 + ((u - 80) / 20) * 24 }));

function Dashboard() {
  const t = useT();
  const { toast } = useToast();
  const { price } = usePrice('ZEC');
  const [action, setAction] = useState<'repay' | 'supply' | null>(null);
  const [amount, setAmount] = useState('');
  const [emode, setEmode] = useState(false);
  const collateralValue = COLLATERAL_ZEC * price;
  const health = (debt: number) => (debt <= 0 ? Infinity : (collateralValue * LIQ_THRESHOLD) / debt);
  const currentHealth = health(DEBT);
  const liqPrice = DEBT / (COLLATERAL_ZEC * LIQ_THRESHOLD);
  const after = health(DEBT - (action === 'repay' ? Number(amount) || 0 : 0));
  const priceSeries = walk(11, 30, 880, 0.02, 0.002).concat(price);

  return (
    <>
      <Split>
        <Main>
          <Stats divided>
            <Stat size="sm" label={t('Net worth', '净值')} value={usd(collateralValue - DEBT)} />
            <Stat size="sm" label={t('Collateral', '抵押品')} value={<Amount value={BigInt(COLLATERAL_ZEC) * 100000000n} symbol="nZEC" />} />
            <Stat size="sm" label={t('Debt', '负债')} value={<Amount value={2400000000n} decimals={6} symbol="USDC" />} />
          </Stats>
          <Panel title={t('Health factor', '健康系数')} actions={<Badge tone={currentHealth > 1.5 ? 'positive' : 'warning'} dot>{currentHealth > 1.5 ? t('Safe', '安全') : t('Watch', '关注')}</Badge>}>
            <HealthFactor value={currentHealth} />
            <div style={{ marginTop: 16 }}>
              <KeyValue
                items={[
                  { label: t('ZEC mark price', 'ZEC 标记价'), value: usd(price) },
                  { label: t('Liquidation price', '清算价格'), value: `${usd(liqPrice)} / ZEC` },
                  { label: t('Borrow APY', '借款利率'), value: '7.40%' },
                ]}
              />
            </div>
            <Cluster gap={6} style={{ marginTop: 16 }}>
              <Button variant="solid" onClick={() => setAction('repay')}>{t('Repay', '还款')}</Button>
              <Button onClick={() => setAction('supply')}>{t('Add collateral', '增加抵押')}</Button>
            </Cluster>
          </Panel>
          <Panel title={t('ZEC price vs liquidation', 'ZEC 价格与清算线')}>
            <LineChart
              label={t('Liquidation monitor', '清算监控')}
              height={240}
              series={[{ name: 'ZEC', data: priceSeries, area: true }]}
              labels={days.concat('now')}
              yFormat={(v) => `$${v.toFixed(0)}`}
              referenceY={[{ value: liqPrice, label: t('Liquidation', '清算线') }]}
              yMin={Math.min(liqPrice * 0.8, ...priceSeries) }
            />
          </Panel>
        </Main>
        <Side>
          <Panel title={t('Collateral & debt mix', '抵押与负债构成')}>
            <DonutChart label={t('Position mix', '仓位构成')} data={[{ label: 'nZEC collateral', value: collateralValue }, { label: 'USDC debt', value: DEBT }]} center={<strong>{usd(collateralValue - DEBT)}</strong>} />
          </Panel>
          <Panel title={t('Efficiency mode', '效率模式')}>
            <Switch label={t('E-Mode · stablecoin debt only', 'E-Mode · 仅限稳定币负债')} checked={emode} onChange={setEmode} />
            <p className="nui-text-muted nui-text-small" style={{ marginTop: 12 }}>{t('Higher LTV (80%) when all debt is in stablecoins. Liquidation threshold stays at 72% for nZEC collateral.', '当负债全部为稳定币时可获得更高 LTV（80%）。nZEC 抵押的清算阈值仍为 72%。')}</p>
          </Panel>
          <Alert tone="warning" title={t('Liquidation risk', '清算风险')}>
            {t('If ZEC falls below the liquidation price, part of your collateral is sold with a 5% penalty. Positions are confidential on Noir; the Rhea market is public.', '若 ZEC 跌破清算价，部分抵押品将以 5% 罚金被出售。Noir 上的仓位是机密的，Rhea 市场是公开的。')}
          </Alert>
        </Side>
      </Split>
      <Drawer open={action !== null} onClose={() => setAction(null)} title={action === 'repay' ? t('Repay USDC', '偿还 USDC') : t('Add collateral', '增加抵押')} footer={<Button variant="solid" block disabled={!amount} onClick={() => { setAction(null); toast({ title: t('Submitted', '已提交'), description: `${amount} ${action === 'repay' ? 'USDC' : 'nZEC'}`, tone: 'positive' }); setAmount(''); }}>{t('Confirm', '确认')}</Button>}>
        <div className="nui-stack" style={{ gap: 20 }}>
          <TokenAmountInput label={action === 'repay' ? t('Repay', '还款') : t('Supply', '存入')} value={amount} onChange={setAmount} token={action === 'repay' ? TOKENS[2] : TOKENS[1]} onMax={setAmount} />
          {action === 'repay' ? <HealthFactor label={t('Health after repay', '还款后健康系数')} value={after} /> : <HealthFactor label={t('Health after supply', '存入后健康系数')} value={health(DEBT) * (1 + (Number(amount) || 0) / COLLATERAL_ZEC)} />}
          <DetailList items={[{ label: t('Gas', 'Gas'), value: '0.0002 ZEC' }, { label: t('Execution', '执行'), value: 'Noir · confidential' }]} />
        </div>
      </Drawer>
    </>
  );
}

function Markets() {
  const t = useT();
  return (
    <DataTable
      rows={MARKETS}
      rowKey={(r) => r.symbol}
      defaultSort={{ key: 'supplied', direction: 'descending' }}
      columns={[
        { key: 'asset', header: t('Asset', '资产'), cell: (r) => <a href={link('lending', 'market', r.symbol)} className="nui-cluster" style={{ gap: 10, color: 'inherit', textDecoration: 'none' }}><TokenIcon symbol={r.symbol} size="sm" /><strong>{r.symbol}</strong></a> },
        { key: 'supplied', header: t('Supplied', '已存入'), numeric: true, cell: (r) => compactUsd(r.supplied).replace('$', ''), sortValue: (r) => r.supplied },
        { key: 'supply', header: t('Supply APY', '存款利率'), numeric: true, cell: (r) => <PriceChange value={r.supplyApy} />, sortValue: (r) => r.supplyApy },
        { key: 'borrow', header: t('Borrow APY', '借款利率'), numeric: true, cell: (r) => `${r.borrowApy.toFixed(2)}%`, sortValue: (r) => r.borrowApy },
        { key: 'util', header: t('Utilization', '利用率'), cell: (r) => <div style={{ minWidth: 140 }}><Meter label="" value={r.utilization} max={100} valueLabel={`${r.utilization}%`} tone={r.utilization > 75 ? 'warning' : 'accent'} /></div> },
        { key: 'trend', header: '30d APY', cell: (r) => <Sparkline data={walk(r.supplyApy * 100, 30, r.supplyApy, 0.08)} /> },
      ]}
    />
  );
}

function MarketDetail({ symbol }: { symbol: string }) {
  const t = useT();
  const market = MARKETS.find((m) => m.symbol === symbol);
  if (!market) return <EmptyState title={t('Market not found.', '市场不存在。')} />;
  return (
    <Split>
      <Main>
        <Panel title={t('Interest rate model', '利率模型')} actions={<InfoTip content={t('Borrow APY jumps after the 80% utilization kink to attract repayments.', '利用率超过 80% 拐点后，借款利率陡增以吸引还款。')} />}>
          <LineChart
            label={t('Rate model', '利率模型')}
            height={240}
            series={[{ name: 'Borrow APY', data: rateModel.map((p) => p.apy), area: true }]}
            labels={rateModel.map((p) => `${p.u}%`)}
            yFormat={(v) => `${v.toFixed(0)}%`}
            referenceX={[{ index: 16, label: 'Kink 80%' }]}
            markers={[{ index: Math.round(market.utilization / 5), series: 0, label: t('Now', '当前') }]}
          />
        </Panel>
        <Panel title={t('APY history · 30 days', '利率历史 · 30 天')}>
          <LineChart label={t('APY history', '利率历史')} height={200} series={[{ name: 'Supply', data: walk(market.supplyApy * 10, 30, market.supplyApy, 0.06) }, { name: 'Borrow', data: walk(market.borrowApy * 10, 30, market.borrowApy, 0.06), dashed: true }]} labels={days} yFormat={(v) => `${v.toFixed(1)}%`} legend />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Parameters', '风险参数')}>
          <KeyValue
            items={[
              { label: 'Max LTV', value: `${market.ltv}%` },
              { label: t('Liquidation threshold', '清算阈值'), value: '72%' },
              { label: t('Liquidation penalty', '清算罚金'), value: '5%' },
              { label: t('Supply cap', '存款上限'), value: compactUsd(market.supplied * 1.4) },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            <Meter label={t('Supply cap used', '存款上限使用')} value={market.utilization} max={100} valueLabel={`${market.utilization}%`} />
          </div>
          <Cluster gap={6} style={{ marginTop: 16 }}>
            <Button variant="solid" href={link('lending')}>{t('Supply / borrow', '存入 / 借出')}</Button>
            <Button href={link('dex')}>{t('Get USDC', '获取 USDC')}</Button>
          </Cluster>
        </Panel>
      </Side>
    </Split>
  );
}

function Liquidations() {
  const t = useT();
  const rows = [
    { id: 'l1', account: 'u1…9f2c', collateral: '12.4 nZEC', debt: 8200, penalty: 410, time: '2 h' },
    { id: 'l2', account: 'u1…41ab', collateral: '3.1 nZEC', debt: 1450, penalty: 72, time: '7 h' },
    { id: 'l3', account: 'zs1…77de', collateral: '28.0 nZEC', debt: 19400, penalty: 970, time: '1 d' },
  ];
  return (
    <Split>
      <Main>
        <Panel title={t('Recent liquidations', '最近清算')} flush>
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: 'account', header: t('Account', '账户'), cell: (r) => <span className="nui-mono">{r.account}</span> },
              { key: 'collateral', header: t('Seized collateral', '被清算抵押品'), cell: (r) => r.collateral },
              { key: 'debt', header: t('Debt covered', '覆盖负债'), numeric: true, cell: (r) => usd(r.debt) },
              { key: 'penalty', header: t('Penalty', '罚金'), numeric: true, cell: (r) => usd(r.penalty) },
              { key: 'time', header: t('Time', '时间'), numeric: true, cell: (r) => r.time },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Liquidation volume · 14d', '清算量 · 14 天')}>
          <BarChart label={t('Liquidations', '清算量')} data={walk(31, 14, 9000, 0.5).map((v, k) => ({ label: `${k + 1}`, value: Math.round(v) }))} height={200} yFormat={(v) => compactUsd(v)} />
        </Panel>
        <Disclosure summary={t('How liquidation works', '清算如何触发')}>
          {t('When health factor drops to 1.0, liquidators can repay part of the debt and claim collateral plus a 5% bonus. No liquidator can see your identity on Noir, only the position parameters needed to execute.', '当健康系数降至 1.0，清算人可偿还部分负债并获得抵押品及 5% 奖励。在 Noir 上清算人看不到你的身份，只能看到执行所需的仓位参数。')}
        </Disclosure>
      </Side>
    </Split>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const body = page === 'markets' ? <Markets /> : page === 'market' ? <MarketDetail symbol={arg ?? ''} /> : page === 'liquidations' ? <Liquidations /> : <Dashboard />;
  return (
    <ProductShell product="lending" page={page === 'market' ? 'markets' : (page ?? '')} title={page === 'market' ? `${arg} ${t('market', '市场')}` : undefined} crumbs={page === 'market' ? [{ label: t('Markets', '市场'), href: link('lending', 'markets') }, { label: arg }] : undefined}>
      {body}
    </ProductShell>
  );
}
