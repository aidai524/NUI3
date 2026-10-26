import { useMemo, useState } from 'react';
import {
  Address, Amount, DataTable, Field, Grid, Input, MemoInput, Panel, PoolBadge, ReceiveQR, Segmented, Shell, Stat, Stats, Switch, SyncProgress,
  TokenIcon, buildPaymentUri, formatUnits, isMemoValid,
} from '@nui3/react';
import { ADDR, PRICES, TOKENS } from '../data';
import { PageHead } from './PageHead';

export function WalletPage() {
  const [hidden, setHidden] = useState(false);
  const [receiveAs, setReceiveAs] = useState<'unified' | 'sapling'>('unified');
  const [amount, setAmount] = useState('0.25');
  const [memo, setMemo] = useState('Invoice #2026-10');

  const address = receiveAs === 'unified' ? ADDR.unified : ADDR.sapling2;
  const uri = useMemo(() => {
    const valid = /^\d{1,8}(\.\d{1,8})?$/.test(amount);
    return buildPaymentUri({ address, amount: valid ? amount : undefined, memo: memo && isMemoValid(memo) ? memo : undefined });
  }, [address, amount, memo]);

  const held = TOKENS.filter((t) => t.balance !== undefined && BigInt(t.balance) > 0n);
  const total = held.reduce((sum, t) => sum + Number(formatUnits(t.balance!, t.decimals)) * (PRICES[t.symbol] ?? 0), 0);

  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead
        eyebrow="Wallet"
        title="Your assets."
        aside={<Switch label="Hide balances" checked={hidden} onChange={setHidden} />}
      />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <div className="nui-stack" style={{ gap: 20 }}>
          <Panel>
            <Stats>
              <Stat label="Total value" value={hidden ? '••••••' : `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
              <Stat label="Shielded ZEC" value={<Amount value={1284500000n} symbol={null} hidden={hidden} />} />
            </Stats>
            <div style={{ marginTop: 24 }}><SyncProgress height={3104920} tip={3120448} from={2900000} eta="4 min left" /></div>
          </Panel>
          <Panel title="Balances" flush>
            <DataTable
              rows={held}
              rowKey={(t) => `${t.chain}:${t.symbol}`}
              columns={[
                { key: 'asset', header: 'Asset', cell: (t) => <span className="nui-cluster" style={{ gap: 10 }}><TokenIcon symbol={t.symbol} size="sm" />{t.symbol}<span className="nui-text-muted">{t.chain}</span></span> },
                { key: 'pool', header: 'Pool', cell: (t) => (t.chain === 'Zcash' ? <PoolBadge pool="orchard" /> : <span className="nui-text-muted">—</span>) },
                { key: 'balance', header: 'Balance', numeric: true, cell: (t) => <Amount value={t.balance!} decimals={t.decimals} symbol={null} hidden={hidden} /> },
              ]}
            />
          </Panel>
        </div>

        <Panel title="Receive" actions={<PoolBadge pool={receiveAs === 'unified' ? 'orchard' : 'sapling'} />}>
          <Segmented aria-label="Address type" value={receiveAs} onChange={setReceiveAs} options={[{ value: 'unified', label: 'Unified' }, { value: 'sapling', label: 'Sapling' }]} />
          <div style={{ display: 'grid', justifyItems: 'center', gap: 16, marginTop: 20 }}>
            <ReceiveQR value={uri} size={188} caption={`ZIP-321${amount ? ` · ${amount} ZEC` : ''}`} />
            <Address address={address} truncate={[12, 8]} />
          </div>
          <div className="nui-stack" style={{ gap: 20, marginTop: 24 }}>
            <Field label="Request amount" hint="Optional. Included in the QR code.">
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
            </Field>
            <Field label="Memo" hint="Encrypted. Only the recipient can read it.">
              <MemoInput value={memo} onChange={setMemo} recipient={address} />
            </Field>
          </div>
        </Panel>
      </Grid>
    </Shell>
  );
}
