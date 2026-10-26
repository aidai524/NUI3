import { useMemo, useState } from 'react';
import {
  Alert, Button, DataTable, DetailList, Field, Grid, Panel, PriceChange, PrivacyBadge, Segmented, Shell, Stat, Stats,
  SwapSwitch, TokenAmountInput, TokenPair, TokenPicker, formatFiat, tryParseUnits, useToast, type TokenInfo,
} from '@nui3/react';
import { PRICES, TOKENS, TRADES } from '../data';
import { PageHead } from './PageHead';

export function fiatOf(value: string, token?: TokenInfo | null) {
  if (!token || !value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? formatFiat(n * (PRICES[token.symbol] ?? 0)) : undefined;
}

export function SwapPage() {
  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead eyebrow="DEX" title="Swap." lead="Trade ZEC, stablecoins and new tokens. Orders route through Rhea liquidity." />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <SwapPanel />
        <div className="nui-stack" style={{ gap: 20 }}>
          <Panel title={<span className="nui-cluster" style={{ gap: 10 }}><TokenPair base={{ symbol: 'ZEC' }} quote={{ symbol: 'USDC' }} /> ZEC / USDC</span>}>
            <Stats>
              <Stat size="sm" label="Price" value="$951.63" delta={<PriceChange value={2.41} />} />
              <Stat size="sm" label="24h volume" value="3.42" unit="M" />
              <Stat size="sm" label="Liquidity" value="18.9" unit="M" />
            </Stats>
          </Panel>
          <Panel title="Recent trades" flush>
            <DataTable
              rows={TRADES}
              rowKey={(r) => r.id}
              columns={[
                { key: 'side', header: 'Side', cell: (r) => <span style={{ color: r.side === 'buy' ? 'var(--nui-positive)' : 'var(--nui-negative)', fontWeight: 600 }}>{r.side === 'buy' ? 'Buy' : 'Sell'}</span> },
                { key: 'price', header: 'Price', numeric: true, cell: (r) => r.price.toFixed(2) },
                { key: 'amount', header: 'ZEC', numeric: true, cell: (r) => r.amount.toFixed(2) },
                { key: 'age', header: 'Age', numeric: true, cell: (r) => r.age },
              ]}
            />
          </Panel>
        </div>
      </Grid>
    </Shell>
  );
}

export function SwapPanel() {
  const { toast } = useToast();
  const [from, setFrom] = useState<TokenInfo>(TOKENS[0]!);
  const [to, setTo] = useState<TokenInfo>(TOKENS[2]!);
  const [amount, setAmount] = useState('1.5');
  const [slippage, setSlippage] = useState('0.5');
  const [mode, setMode] = useState<'market' | 'limit'>('market');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);

  const out = useMemo(() => {
    const n = Number(amount);
    if (!amount || !Number.isFinite(n)) return '';
    return (((n * (PRICES[from.symbol] ?? 0)) / (PRICES[to.symbol] ?? 1)) * 0.997).toFixed(Math.min(to.decimals, 6));
  }, [amount, from, to]);

  const parsed = tryParseUnits(amount || '0', from.decimals);
  const insufficient = parsed !== null && from.balance !== undefined && parsed > BigInt(from.balance);

  return (
    <Panel title="Swap" actions={<PrivacyBadge level="confidential" />}>
      <Segmented aria-label="Order type" value={mode} onChange={setMode} options={[{ value: 'market', label: 'Market' }, { value: 'limit', label: 'Limit', disabled: true }]} />
      <div style={{ display: 'grid', marginTop: 16 }}>
        <Field label="You pay" hideLabel error={insufficient ? `Insufficient ${from.symbol} balance` : undefined}>
          <TokenAmountInput label="You pay" value={amount} onChange={setAmount} token={from} onTokenClick={() => setPicking('from')} onMax={setAmount} fiat={fiatOf(amount, from)} />
        </Field>
        <SwapSwitch onClick={() => { setFrom(to); setTo(from); setAmount(out); }} />
        <TokenAmountInput label="You receive" value={out} readOnly token={to} onTokenClick={() => setPicking('to')} fiat={fiatOf(out, to)} />
      </div>
      <div style={{ marginTop: 20 }}>
        <DetailList
          items={[
            { label: 'Rate', value: `1 ${from.symbol} = ${((PRICES[from.symbol] ?? 0) / (PRICES[to.symbol] ?? 1)).toFixed(4)} ${to.symbol}` },
            { label: 'Route', value: 'Noir → Rhea' },
            { label: 'Fee', value: '0.30%' },
            { label: 'Max slippage', value: <Segmented aria-label="Max slippage" value={slippage} onChange={setSlippage} options={['0.1', '0.5', '1', '3'].map((v) => ({ value: v, label: `${v}%` }))} /> },
          ]}
        />
      </div>
      {Number(slippage) >= 3 && <Alert tone="warning" title="High slippage" style={{ marginTop: 16 }}>Your trade may execute at a much worse price.</Alert>}
      <Button
        variant="solid"
        block
        disabled={!amount || insufficient}
        style={{ marginTop: 20 }}
        onClick={() => toast({ title: 'Swap submitted', description: `${amount} ${from.symbol} → ${out} ${to.symbol}`, tone: 'positive' })}
      >
        Review swap
      </Button>
      <TokenPicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        tokens={TOKENS}
        popular={TOKENS.slice(0, 3)}
        selected={picking === 'from' ? from : to}
        disabled={[picking === 'from' ? to : from]}
        onSelect={(t) => (picking === 'from' ? setFrom(t) : setTo(t))}
      />
    </Panel>
  );
}
