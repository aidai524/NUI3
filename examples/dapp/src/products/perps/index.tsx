import { useMemo, useState } from 'react';
import {
  Alert, Badge, BarChart, Button, CandleChart, Card, Cluster, DataTable, DetailList, Disclosure, DonutChart, Field, Grid, Input, KeyValue,
  LeverageSlider, LineChart, LiveValue, OrderBook, Panel, PnL, PositionTable, PriceChange, PrivacyBadge, Segmented, Sparkline,
  Stat, Stats, TabPanel, Tabs, TokenAmountInput, useToast, type Position,
} from '@nui3/react';
import { TOKENS, dayLabels } from '../../data';
import { useCandles, useOrderBook, usePrice, useTrades } from '../../sim';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd, usd } from '../ui';
import { PERP_MARKETS, fundingHistory, pnlHistory } from './data';

const days = dayLabels(30);

function Trade() {
  const t = useT();
  const { toast } = useToast();
  const [marketId, setMarketId] = useState('zec-perp');
  const market = PERP_MARKETS.find((x) => x.id === marketId)!;
  const { price, change } = usePrice(market.symbol);
  const candles = useCandles(market.symbol, 72);
  const { bids, asks } = useOrderBook(market.symbol);
  const trades = useTrades(market.symbol, 10);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState('1000');
  const [limitPrice, setLimitPrice] = useState('');
  const [tab, setTab] = useState('positions');

  const notional = (Number(margin) || 0) * leverage;
  const size = notional / price;
  const liq = price * (side === 'long' ? 1 - 0.9 / leverage : 1 + 0.9 / leverage);
  const positions: Position[] = useMemo(() => [
    { id: 'p1', market: 'ZEC-PERP', side: 'long', size: '12.5 ZEC', entry: 912.4, mark: price, liq: 741.2, leverage: 5, pnl: (price - 912.4) * 12.5, pnlPercent: ((price - 912.4) / 912.4) * 500 },
    { id: 'p2', market: 'ETH-PERP', side: 'short', size: '0.8 ETH', entry: 4380, mark: 4210, liq: 5120, leverage: 3, pnl: (4380 - 4210) * 0.8, pnlPercent: 11.6 },
  ], [price]);

  return (
    <Split>
      <Main>
        <Panel flush>
          <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', borderBottom: '1px solid var(--nui-border)' }}>
            <select className="nui-select" aria-label={t('Market', '市场')} value={marketId} onChange={(e) => setMarketId(e.target.value)} style={{ width: 190 }}>
              {PERP_MARKETS.map((x) => <option key={x.id} value={x.id}>{x.symbol}-PERP</option>)}
            </select>
            <strong style={{ fontSize: 24 }}><LiveValue value={price} format={(v) => usd(v, v < 10 ? 4 : 2)} colored /></strong>
            <PriceChange value={change} />
            <span className="nui-text-muted nui-text-small">{t('Funding', '资金费率')} {market.funding}% / 8h</span>
            <span className="nui-text-muted nui-text-small">OI {compactUsd(market.openInterest)}</span>
          </div>
          <div style={{ padding: 16 }}>
            <CandleChart label={`${market.symbol}-PERP`} candles={candles} lastPrice={price} height={360} yFormat={(v) => (v < 10 ? v.toFixed(3) : v.toFixed(0))} />
          </div>
        </Panel>
        <Panel flush>
          <div style={{ padding: '0 20px' }}>
            <Tabs id="perps" aria-label={t('Account', '账户')} value={tab} onChange={setTab} items={[{ value: 'positions', label: t('Positions', '仓位') }, { value: 'orders', label: t('Open orders', '当前委托') }, { value: 'trades', label: t('Recent trades', '最近成交') }]} />
          </div>
          <TabPanel tabsId="perps" value="positions" active={tab === 'positions'}>
            <PositionTable positions={positions} onClose={(p) => toast({ title: t('Close order submitted', '平仓委托已提交'), description: p.market, tone: 'positive' })} />
          </TabPanel>
          <TabPanel tabsId="perps" value="orders" active={tab === 'orders'}>
            <DataTable
              rows={[{ id: 'o1', market: 'ZEC-PERP', side: 'Buy', price: 930, size: 4, filled: 0 }]}
              rowKey={(r) => r.id}
              columns={[
                { key: 'm', header: t('Market', '市场'), cell: (r) => r.market },
                { key: 's', header: t('Side', '方向'), cell: (r) => r.side },
                { key: 'p', header: t('Limit price', '限价'), numeric: true, cell: (r) => usd(r.price) },
                { key: 'z', header: t('Size', '数量'), numeric: true, cell: (r) => `${r.size} ZEC` },
                { key: 'f', header: t('Filled', '已成交'), numeric: true, cell: (r) => `${r.filled}%` },
              ]}
            />
          </TabPanel>
          <TabPanel tabsId="perps" value="trades" active={tab === 'trades'}>
            <DataTable
              rows={trades}
              rowKey={(r) => String(r.id)}
              columns={[
                { key: 'side', header: t('Side', '方向'), cell: (r) => <span style={{ color: r.side === 'buy' ? 'var(--nui-positive)' : 'var(--nui-negative)' }}>{r.side === 'buy' ? t('Buy', '买') : t('Sell', '卖')}</span> },
                { key: 'price', header: t('Price', '价格'), numeric: true, cell: (r) => r.price.toFixed(2) },
                { key: 'size', header: t('Size', '数量'), numeric: true, cell: (r) => r.size.toFixed(3) },
                { key: 'time', header: t('Time', '时间'), numeric: true, cell: (r) => r.time },
              ]}
            />
          </TabPanel>
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Place order', '下单')} actions={<PrivacyBadge level="confidential" describe={false} />}>
          <Segmented aria-label={t('Side', '方向')} value={side} onChange={(v) => setSide(v as 'long' | 'short')} options={[{ value: 'long', label: t('Long', '做多') }, { value: 'short', label: t('Short', '做空') }]} />
          <div style={{ marginTop: 16 }}>
            <TokenAmountInput label={t('Margin', '保证金')} value={margin} onChange={setMargin} token={TOKENS[2]} onMax={setMargin} fiat={`${margin || 0} USDC`} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label={t('Limit price (optional)', '限价（可选）')}><Input inputMode="decimal" placeholder={t('Market price', '市价')} value={limitPrice} onChange={(e) => setLimitPrice(e.target.value.replace(/[^\d.]/g, ''))} /></Field>
          </div>
          <div style={{ marginTop: 16 }}><LeverageSlider value={leverage} onChange={setLeverage} max={market.maxLeverage} /></div>
          <div style={{ marginTop: 16 }}>
            <DetailList
              items={[
                { label: t('Position size', '仓位数量'), value: `${size.toFixed(4)} ${market.symbol}` },
                { label: t('Notional', '名义价值'), value: usd(notional) },
                { label: t('Est. liquidation', '预计强平价'), value: <span style={{ color: 'var(--nui-warning)' }}>{usd(liq)}</span> },
                { label: t('Fee', '手续费'), value: usd(notional * 0.0005) },
              ]}
            />
          </div>
          <Button variant="solid" block style={{ marginTop: 16 }} disabled={!margin} onClick={() => toast({ title: `${side === 'long' ? t('Long', '做多') : t('Short', '做空')} ${market.symbol}-PERP`, description: `${size.toFixed(4)} @ ${limitPrice || usd(price)} · ${leverage}×`, tone: 'positive' })}>
            {side === 'long' ? t('Open long', '开多') : t('Open short', '开空')}
          </Button>
        </Panel>
        <Panel title={t('Order book', '订单簿')} flush>
          <OrderBook bids={bids} asks={asks} last={price} lastDirection={change >= 0 ? 'up' : 'down'} baseSymbol={market.symbol} quoteSymbol="USDC" onSelectPrice={(p) => setLimitPrice(String(p))} />
        </Panel>
      </Side>
    </Split>
  );
}

function Markets() {
  const t = useT();
  return (
    <DataTable
      rows={PERP_MARKETS}
      rowKey={(x) => x.id}
      columns={[
        { key: 'm', header: t('Market', '市场'), cell: (x) => <a href={link('perps')} style={{ color: 'inherit', fontWeight: 600 }}>{x.symbol}-PERP</a> },
        { key: 'lev', header: t('Max leverage', '最大杠杆'), numeric: true, cell: (x) => `${x.maxLeverage}×` },
        { key: 'funding', header: t('Funding / 8h', '资金费率 / 8h'), numeric: true, cell: (x) => <span style={{ color: x.funding >= 0 ? 'var(--nui-positive)' : 'var(--nui-negative)' }}>{x.funding}%</span>, sortValue: (x) => x.funding },
        { key: 'oi', header: t('Open interest', '未平仓'), numeric: true, cell: (x) => compactUsd(x.openInterest), sortValue: (x) => x.openInterest },
        { key: 'vol', header: t('24h volume', '24h 成交'), numeric: true, cell: (x) => compactUsd(x.volume24h), sortValue: (x) => x.volume24h },
        { key: 'trend', header: '7d', cell: (x) => <Sparkline data={fundingHistory(x.seed)} /> },
      ]}
    />
  );
}

function Portfolio() {
  const t = useT();
  const series = pnlHistory(12);
  const pnl = series[series.length - 1]! - series[0]!;
  return (
    <Split>
      <Main>
        <Stats divided>
          <Stat size="sm" label={t('Account equity', '账户权益')} value={usd(28_420)} />
          <Stat size="sm" label={t('Free collateral', '可用保证金')} value={usd(9_120)} />
          <Stat size="sm" label={t('30d PnL', '30 天盈亏')} value={<PnL value={pnl} />} />
        </Stats>
        <Panel title={t('Realized PnL · 30 days', '已实现盈亏 · 30 天')}>
          <LineChart label="PnL" height={240} series={[{ name: 'PnL', data: series, area: true }]} labels={days} yFormat={(v) => usd(v)} referenceY={[{ value: series[0]!, label: t('Start', '期初') }]} />
        </Panel>
        <Panel title={t('Funding paid · 7 days', '资金费支出 · 7 天')}>
          <BarChart label={t('Funding', '资金费')} signed data={fundingHistory(5).slice(-14).map((v, k) => ({ label: `${k + 1}`, value: v * 1000 }))} yFormat={(v) => `$${v.toFixed(0)}`} height={180} />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Margin allocation', '保证金分布')}>
          <DonutChart label={t('Margin', '保证金')} data={[{ label: 'ZEC-PERP', value: 11200 }, { label: 'ETH-PERP', value: 6800 }, { label: t('Free', '可用'), value: 9120 }]} center={<strong>{usd(28_420)}</strong>} />
        </Panel>
        <Panel title={t('Risk', '风险')}>
          <KeyValue
            items={[
              { label: t('Account leverage', '账户杠杆'), value: '2.4×' },
              { label: t('Margin ratio', '保证金率'), value: '38.2%' },
              { label: t('Nearest liquidation', '最近强平'), value: 'ZEC $741.20' },
            ]}
          />
          <Button style={{ marginTop: 16 }} href={link('lending')}>{t('Borrow margin with ZEC', '抵押 ZEC 借入保证金')}</Button>
        </Panel>
      </Side>
    </Split>
  );
}

function Funding() {
  const t = useT();
  return (
    <Grid cols={2} style={{ alignItems: 'start' }}>
      {PERP_MARKETS.slice(0, 4).map((x) => (
        <Card key={x.id}>
          <Cluster justify="space-between">
            <strong>{x.symbol}-PERP</strong>
            <Badge tone={x.funding >= 0 ? 'positive' : 'negative'}>{x.funding}% / 8h</Badge>
          </Cluster>
          <BarChart label={`${x.symbol} funding`} signed height={140} data={fundingHistory(x.seed).slice(-16).map((v, k) => ({ label: `${k}`, value: v }))} yFormat={(v) => `${v.toFixed(2)}%`} />
          <p className="nui-text-muted nui-text-small" style={{ marginTop: 12 }}>
            {x.funding >= 0 ? t('Longs pay shorts while funding is positive.', '资金费率为正时，多头支付给空头。') : t('Shorts pay longs while funding is negative.', '资金费率为负时，空头支付给多头。')}
          </p>
        </Card>
      ))}
      <Disclosure summary={t('How funding is settled', '资金费如何结算')}>
        {t('Funding is exchanged between longs and shorts every 8 hours to keep the perpetual price close to the index. Noir settles it confidentially; the index itself is public.', '资金费每 8 小时在多空之间结算，使永续价格贴近指数。Noir 以机密方式结算，指数本身是公开的。')}
      </Disclosure>
    </Grid>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page] = path;
  const body = page === 'markets' ? <Markets /> : page === 'portfolio' ? <Portfolio /> : page === 'funding' ? <Funding /> : <Trade />;
  return (
    <ProductShell product="perps" page={page ?? ''} compact={!page} title={!page ? t('Perpetual futures', '永续合约') : undefined} lead={!page ? undefined : t('Leveraged trading with confidential positions on Noir.', '在 Noir 上以机密仓位进行杠杆交易。')}>
      {body}
      {!page && <Alert tone="warning" title={t('Leverage risk', '杠杆风险')}>{t('Leveraged positions can be liquidated quickly. Only trade with funds you can afford to lose. Positions are confidential on Noir; the underlying venue is public.', '杠杆仓位可能很快爆仓，请只用可承受损失的资金。仓位在 Noir 上是机密的，底层交易场所是公开的。')}</Alert>}
    </ProductShell>
  );
}
