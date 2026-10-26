import { useMemo, useState } from 'react';
import {
  Address, Alert, Amount, Badge, Breadcrumb, Button, ChipGroup, Cluster, DataTable, EmptyState, Grid, Hash, KeyValue, Panel, PoolBadge,
  PrivacyBadge, SearchInput, Shell, Stat, Stats, TxStatus, type Column,
} from '@nui3/react';
import { ACTIVITY, ADDR, TOKENS, type ExplorerRow } from '../data';
import { to } from '../router';
import { PageHead } from './PageHead';

const DECIMALS: Record<string, number> = { ...Object.fromEntries(TOKENS.map((t) => [t.symbol, t.decimals])), TKN: 6 };

const amountCell = (r: ExplorerRow) =>
  // Shielded amounts are private: explorers must not display them.
  r.privacy === 'shielded' ? <span className="nui-text-muted">Shielded</span> : <Amount value={r.amount} decimals={DECIMALS[r.symbol] ?? 8} symbol={r.symbol} />;

const columns: Column<ExplorerRow>[] = [
  { key: 'hash', header: 'Transaction', cell: (r) => <Hash value={r.hash} href={to('tx', r.hash)} /> },
  { key: 'kind', header: 'Type', cell: (r) => r.kind },
  { key: 'privacy', header: 'Privacy', cell: (r) => <PrivacyBadge level={r.privacy} describe={false} /> },
  { key: 'amount', header: 'Amount', numeric: true, cell: amountCell, sortValue: (r) => (r.privacy === 'shielded' ? -1n : r.amount) },
  { key: 'status', header: 'Status', cell: (r) => <TxStatus status={r.status} /> },
  { key: 'height', header: 'Block', numeric: true, cell: (r) => `#${r.height.toLocaleString('en-US')}`, sortValue: (r) => r.height },
  { key: 'age', header: 'Age', numeric: true, cell: (r) => r.age },
];

export function ExplorerPage() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ACTIVITY.filter((r) => (kind === 'all' || r.kind === kind) && (!needle || [r.hash, r.kind, r.symbol, String(r.height)].some((f) => f.toLowerCase().includes(needle))));
  }, [q, kind]);
  const kinds = ['Bridge in', 'Swap', 'Lend', 'Bridge out', 'Deploy'];

  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead
        eyebrow="Explorer"
        title="Recent activity."
        aside={
          <Stats divided>
            <Stat size="sm" label="Block height" value="3,120,448" />
            <Stat size="sm" label="Shielded pool" value="31.2" unit="%" />
            <Stat size="sm" label="RPC uptime" value="99.98" unit="%" />
          </Stats>
        }
      />
      <Cluster justify="space-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--nui-border)' }}>
        <ChipGroup aria-label="Transaction type" value={kind} onChange={setKind} options={[{ value: 'all', label: 'All' }, ...kinds.map((k) => ({ value: k, label: k, count: ACTIVITY.filter((r) => r.kind === k).length }))]} />
        <SearchInput label="Search transactions" placeholder="Hash, block, token…" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ width: 260 }} />
      </Cluster>
      <DataTable
        caption="Recent transactions"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.hash}
        defaultSort={{ key: 'height', direction: 'descending' }}
        empty={<EmptyState title="No transactions match." hint="Try a different hash, block or token." action={<Button onClick={() => { setQ(''); setKind('all'); }}>Clear filters</Button>} />}
      />
      <div style={{ marginTop: 20 }}>
        <Alert tone="shielded" title="What the explorer shows">
          Only public data or data disclosed with a viewing key. Shielded senders, recipients, amounts and memos are never displayed.
        </Alert>
      </div>
    </Shell>
  );
}

export function TxPage({ hash }: { hash?: string }) {
  const tx = ACTIVITY.find((r) => r.hash === hash);
  if (!tx) {
    return (
      <Shell style={{ padding: '56px 0 96px' }}>
        <EmptyState title="Transaction not found." hint="It may not be indexed yet, or the hash is wrong." action={<Button href={to('explorer')}>Back to explorer</Button>} />
      </Shell>
    );
  }
  const shielded = tx.privacy === 'shielded';
  return (
    <Shell style={{ paddingBottom: 96 }}>
      <div style={{ paddingTop: 40 }}>
        <Breadcrumb items={[{ label: 'Explorer', href: to('explorer') }, { label: tx.kind }, { label: `${tx.hash.slice(0, 8)}…` }]} />
      </div>
      <PageHead eyebrow={tx.kind} title="Transaction." aside={<Cluster gap={4}><PrivacyBadge level={tx.privacy} /><TxStatus status={tx.status} confirmations={3} required={10} /></Cluster>} />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <Panel title="Details">
          <KeyValue
            items={[
              { label: 'Hash', value: <Hash value={tx.hash} truncate={[14, 10]} /> },
              { label: 'Block', value: `#${tx.height.toLocaleString('en-US')}` },
              { label: 'Age', value: tx.age },
              { label: 'From', value: shielded ? <span className="nui-text-muted">Shielded</span> : <Address address={ADDR.unified} /> },
              { label: 'To', value: shielded ? <span className="nui-text-muted">Shielded</span> : <Address address={ADDR.tex} /> },
              { label: 'Amount', value: amountCell(tx) },
              { label: 'Fee', value: <Amount value={10000n} /> },
            ]}
          />
        </Panel>
        <Panel title="Anchoring">
          <KeyValue
            items={[
              { label: 'Pools touched', value: <Cluster gap={3} justify="flex-end"><PoolBadge pool={shielded ? 'orchard' : 'transparent'} /></Cluster> },
              { label: 'Noir state root', value: <Hash value="9f2c41d0e7a86b35c1d94e0f2a7b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b" /> },
              { label: 'Anchored on Zcash', value: <Badge tone="info">NoirRoot verified</Badge> },
            ]}
          />
          {shielded && (
            <div style={{ marginTop: 20 }}>
              <Alert tone="shielded" title="Shielded transaction">Sender, recipient, amount and memo are encrypted. Holders of a viewing key can disclose them.</Alert>
            </div>
          )}
        </Panel>
      </Grid>
    </Shell>
  );
}
