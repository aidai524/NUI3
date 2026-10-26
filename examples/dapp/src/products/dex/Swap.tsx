import { useMemo, useState } from 'react';
import {
  Alert, Button, DataTable, DetailList, Disclosure, Field, LineChart, Panel, PrivacyBadge, Segmented, Stat, Stats,
  SwapSwitch, TokenAmountInput, TokenPicker, TokenPair, formatFiat, tryParseUnits, useToast, type TokenInfo,
} from '@nui3/react';
import { PRICES, TOKENS, dayLabels } from '../../data';
import { useHistory, useTrades } from '../../sim';
import { useT } from '../../settings';
import { Main, Side, Split, usd } from '../ui';

export const fiatOf = (value: string, token?: TokenInfo | null) => {
  if (!token || !value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? formatFiat(n * (PRICES[token.symbol] ?? 0)) : undefined;
};

export function Swap() {
  const t = useT();
  const { toast } = useToast();
  const [from, setFrom] = useState<TokenInfo>(TOKENS[0]!);
  const [to, setTo] = useState<TokenInfo>(TOKENS[2]!);
  const [amount, setAmount] = useState('1.5');
  const [slippage, setSlippage] = useState('0.5');
  const [mode, setMode] = useState<'market' | 'limit'>('market');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const history = useHistory('ZEC');
  const trades = useTrades('ZEC', 8);

  const out = useMemo(() => {
    const n = Number(amount);
    if (!amount || !Number.isFinite(n)) return '';
    return (((n * (PRICES[from.symbol] ?? 0)) / (PRICES[to.symbol] ?? 1)) * 0.997).toFixed(Math.min(to.decimals, 6));
  }, [amount, from, to]);
  const parsed = tryParseUnits(amount || '0', from.decimals);
  const insufficient = parsed !== null && from.balance !== undefined && parsed > BigInt(from.balance);

  return (
    <Split>
      <Main>
      <Panel title={t('Swap', '兑换')} actions={<PrivacyBadge level="confidential" />}>
        <Segmented aria-label={t('Order type', '订单类型')} value={mode} onChange={setMode} options={[{ value: 'market', label: t('Market', '市价') }, { value: 'limit', label: t('Limit · soon', '限价 · 即将'), disabled: true }]} />
        <div style={{ display: 'grid', marginTop: 16 }}>
          <Field label={t('You pay', '支付')} hideLabel error={insufficient ? t(`Insufficient ${from.symbol} balance`, `${from.symbol} 余额不足`) : undefined}>
            <TokenAmountInput label={t('You pay', '支付')} value={amount} onChange={setAmount} token={from} onTokenClick={() => setPicking('from')} onMax={setAmount} fiat={fiatOf(amount, from)} />
          </Field>
          <SwapSwitch onClick={() => { setFrom(to); setTo(from); setAmount(out); }} />
          <TokenAmountInput label={t('You receive', '获得')} value={out} readOnly token={to} onTokenClick={() => setPicking('to')} fiat={fiatOf(out, to)} />
        </div>
        <div style={{ marginTop: 20 }}>
          <DetailList
            items={[
              { label: t('Rate', '汇率'), value: `1 ${from.symbol} = ${((PRICES[from.symbol] ?? 0) / (PRICES[to.symbol] ?? 1)).toFixed(4)} ${to.symbol}` },
              { label: t('Route', '路由'), value: 'Noir → Rhea' },
              { label: t('Fee', '手续费'), value: '0.30%' },
              { label: t('Max slippage', '最大滑点'), value: <Segmented aria-label={t('Max slippage', '最大滑点')} value={slippage} onChange={setSlippage} options={['0.1', '0.5', '1', '3'].map((v) => ({ value: v, label: `${v}%` }))} /> },
            ]}
          />
        </div>
        {Number(slippage) >= 3 && <Alert tone="warning" title={t('High slippage', '滑点过高')} style={{ marginTop: 16 }}>{t('Your trade may execute at a much worse price.', '成交价格可能明显差于预期。')}</Alert>}
        <Button variant="solid" block disabled={!amount || insufficient} style={{ marginTop: 20 }} onClick={() => toast({ title: t('Swap submitted', '兑换已提交'), description: `${amount} ${from.symbol} → ${out} ${to.symbol}`, tone: 'positive' })}>
          {t('Review swap', '预览兑换')}
        </Button>
        <TokenPicker open={picking !== null} onClose={() => setPicking(null)} tokens={TOKENS} popular={TOKENS.slice(0, 3)} selected={picking === 'from' ? from : to} disabled={[picking === 'from' ? to : from]} onSelect={(tk) => (picking === 'from' ? setFrom(tk) : setTo(tk))} />
      </Panel>
      </Main>
      <Side>
      <Panel title={<span className="nui-cluster" style={{ gap: 10 }}><TokenPair base={{ symbol: 'ZEC' }} quote={{ symbol: 'USDC' }} /> ZEC / USDC</span>}>
        <Stats>
          <Stat size="sm" label={t('Price', '价格')} value={usd(history[history.length - 1] ?? 951.63)} />
          <Stat size="sm" label={t('24h volume', '24h 成交')} value="3.42" unit="M" />
          <Stat size="sm" label={t('Liquidity', '流动性')} value="18.9" unit="M" />
        </Stats>
        <div style={{ marginTop: 16 }}>
          <LineChart label={t('ZEC price 24h', 'ZEC 24 小时价格')} height={200} series={[{ name: 'ZEC', data: history, area: true }]} labels={history.map((_, k) => `${k}:00`)} yFormat={(v) => `$${v.toFixed(0)}`} />
        </div>
      </Panel>

      <Panel title={t('Recent trades', '最近成交')} flush>
        <DataTable
          rows={trades}
          rowKey={(r) => String(r.id)}
          columns={[
            { key: 'side', header: t('Side', '方向'), cell: (r) => <span style={{ color: r.side === 'buy' ? 'var(--nui-positive)' : 'var(--nui-negative)', fontWeight: 600 }}>{r.side === 'buy' ? t('Buy', '买') : t('Sell', '卖')}</span> },
            { key: 'price', header: t('Price', '价格'), numeric: true, cell: (r) => r.price.toFixed(2) },
            { key: 'size', header: 'ZEC', numeric: true, cell: (r) => r.size.toFixed(3) },
            { key: 'time', header: t('Time', '时间'), numeric: true, cell: (r) => r.time },
          ]}
        />
      </Panel>

      <Disclosure summary={t('How routing and privacy work', '路由与隐私如何工作')}>
        {t('Swaps execute on Noir through Rhea liquidity. Your Noir balances are confidential, but the underlying Rhea pool is public. Withdrawing to Zcash returns funds to the shielded pool.', '兑换在 Noir 上通过 Rhea 流动性执行。你的 Noir 余额是机密的，但底层 Rhea 池是公开的；提回 Zcash 后资金回到屏蔽池。')}
      </Disclosure>
      </Side>
    </Split>
  );
}
