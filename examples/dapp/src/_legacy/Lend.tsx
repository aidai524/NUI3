import { useState } from 'react';
import {
  Alert, Amount, Badge, Button, Cluster, DataTable, Dialog, Grid, HealthFactor, KeyValue, Panel, PriceChange, Shell, Stat, Stats,
  TokenAmountInput, TokenIcon, formatCompact, useToast,
} from '@nui3/react';
import { MARKETS, TOKENS } from '../data';
import { fiatOf } from './Swap';
import { PageHead } from './PageHead';

const DEBT = 2400; // USDC
const COLLATERAL_VALUE = 4758.15; // USD
const LIQ_THRESHOLD = 0.72;
const health = (debt: number) => (debt <= 0 ? Infinity : (COLLATERAL_VALUE * LIQ_THRESHOLD) / debt);

export function LendPage() {
  const { toast } = useToast();
  const [repayOpen, setRepayOpen] = useState(false);
  const [repay, setRepay] = useState('');
  const usdc = TOKENS.find((t) => t.symbol === 'USDC')!;
  const after = health(DEBT - (Number(repay) || 0));

  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead
        eyebrow="Lending"
        title="Borrow against ZEC."
        lead="Keep your ZEC exposure while unlocking USDC for trading or payments. Markets run on Rhea Lending."
        aside={
          <Stats divided>
            <Stat size="sm" label="Total supplied" value="$31.4" unit="M" />
            <Stat size="sm" label="Total borrowed" value="$18.7" unit="M" />
          </Stats>
        }
      />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <Panel title="Your position" actions={<Badge tone="positive" dot>Active</Badge>}>
          <KeyValue
            items={[
              { label: 'Collateral', value: <Amount value={500000000n} symbol="nZEC" fiat={COLLATERAL_VALUE} /> },
              { label: 'Borrowed', value: <Amount value={2400000000n} decimals={6} symbol="USDC" /> },
              { label: 'Borrow APY', value: '7.40%' },
              { label: 'Liquidation price', value: '$571.00 / ZEC' },
            ]}
          />
          <div style={{ marginTop: 20 }}><HealthFactor value={health(DEBT)} /></div>
          <Cluster style={{ marginTop: 20 }} gap={6}>
            <Button variant="solid" onClick={() => setRepayOpen(true)}>Repay</Button>
            <Button>Add collateral</Button>
          </Cluster>
        </Panel>
        <Alert tone="warning" title="Liquidation risk">
          If ZEC falls below the liquidation price, part of your collateral is sold to repay the loan, plus a 5% penalty. Lending positions are confidential on Noir but the underlying Rhea market is public.
        </Alert>
      </Grid>

      <Panel title="Markets" flush style={{ marginTop: 20 }}>
        <DataTable
          rows={MARKETS}
          rowKey={(r) => r.symbol}
          defaultSort={{ key: 'supplied', direction: 'descending' }}
          columns={[
            { key: 'asset', header: 'Asset', cell: (r) => <span className="nui-cluster" style={{ gap: 10 }}><TokenIcon symbol={r.symbol} size="sm" />{r.symbol}</span> },
            { key: 'supplied', header: 'Supplied', numeric: true, cell: (r) => formatCompact(r.supplied), sortValue: (r) => r.supplied },
            { key: 'supply', header: 'Supply APY', numeric: true, cell: (r) => <PriceChange value={r.supplyApy} />, sortValue: (r) => r.supplyApy },
            { key: 'borrow', header: 'Borrow APY', numeric: true, cell: (r) => `${r.borrowApy.toFixed(2)}%`, sortValue: (r) => r.borrowApy },
            { key: 'util', header: 'Utilization', numeric: true, cell: (r) => `${r.utilization}%`, sortValue: (r) => r.utilization },
            { key: 'ltv', header: 'Max LTV', numeric: true, cell: (r) => `${r.ltv}%` },
          ]}
        />
      </Panel>

      <Dialog
        open={repayOpen}
        onClose={() => setRepayOpen(false)}
        title="Repay USDC"
        footer={
          <>
            <Button onClick={() => setRepayOpen(false)} arrow={false}>Cancel</Button>
            <Button variant="solid" disabled={!repay} onClick={() => { setRepayOpen(false); toast({ title: 'Repayment submitted', description: `${repay} USDC`, tone: 'positive' }); setRepay(''); }}>Confirm repay</Button>
          </>
        }
      >
        <div className="nui-stack" style={{ gap: 20 }}>
          <TokenAmountInput label="Repay" value={repay} onChange={setRepay} token={usdc} onMax={() => setRepay(String(DEBT))} fiat={fiatOf(repay, usdc)} />
          <HealthFactor label="Health after repay" value={after} />
        </div>
      </Dialog>
    </Shell>
  );
}
