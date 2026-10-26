import { useState } from 'react';
import {
  Address, Alert, Amount, Badge, Button, ChipGroup, Cluster, DataTable, DonutChart, EmptyState, Field, Grid, Hash, Input, KeyValue,
  LineChart, LiveValue, Pagination, Panel, PoolBadge, PrivacyBadge, SearchInput, Sparkline, Stat, Stats, Stepper, Timeline, TxStatus,
  parseAddress, useToast, type Column,
} from '@nui3/react';
import { ACTIVITY, ADDR, TOKENS, dayLabels } from '../../data';
import { useBlockHeight, usePrice } from '../../sim';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd } from '../ui';
import { ANCHORS, BLOCKS, EXPLORER_TOKENS, supplySeries, txSeries } from './data';

const days = dayLabels(30);
const DECIMALS: Record<string, number> = { ...Object.fromEntries(TOKENS.map((x) => [x.symbol, x.decimals])), TKN: 6 };

const amountCell = (r: (typeof ACTIVITY)[number]) => (r.privacy === 'shielded' ? <span className="nui-text-muted">Shielded</span> : <Amount value={r.amount} decimals={DECIMALS[r.symbol] ?? 8} symbol={r.symbol} />);

const txColumns: Column<(typeof ACTIVITY)[number]>[] = [
  { key: 'hash', header: 'Transaction', cell: (r) => <Hash value={r.hash} href={link('explorer', 'tx', r.hash)} /> },
  { key: 'kind', header: 'Type', cell: (r) => r.kind },
  { key: 'privacy', header: 'Privacy', cell: (r) => <PrivacyBadge level={r.privacy} describe={false} /> },
  { key: 'amount', header: 'Amount', numeric: true, cell: amountCell, sortValue: (r) => (r.privacy === 'shielded' ? -1n : r.amount) },
  { key: 'status', header: 'Status', cell: (r) => <TxStatus status={r.status} /> },
  { key: 'height', header: 'Block', numeric: true, cell: (r) => <a href={link('explorer', 'block', String(r.height))}>#{r.height.toLocaleString('en-US')}</a>, sortValue: (r) => r.height },
];

function Search() {
  const t = useT();
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const go = () => {
    const v = q.trim();
    if (!v) return;
    if (parseAddress(v)) { location.hash = link('explorer', 'address', v); setError(''); return; }
    if (/^\d+$/.test(v)) { location.hash = link('explorer', 'block', v); setError(''); return; }
    if (/^[0-9a-f]{64}$/i.test(v)) { location.hash = link('explorer', 'tx', v); setError(''); return; }
    const token = EXPLORER_TOKENS.find((x) => x.symbol.toLowerCase() === v.toLowerCase());
    if (token) { location.hash = link('explorer', 'token', token.symbol); setError(''); return; }
    setError(t('No transaction, block, address or token matches.', '没有匹配的交易、区块、地址或代币。'));
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Input placeholder={t('Search hash / block / address / token', '搜索哈希 / 区块 / 地址 / 代币')} mono value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} aria-label={t('Search', '搜索')} />
        </div>
        <Button variant="outline" onClick={go}>{t('Search', '搜索')}</Button>
      </div>
      {error && <p className="nui-field__error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

function Overview() {
  const t = useT();
  const height = useBlockHeight();
  const { price } = usePrice('ZEC');
  const latest = BLOCKS.slice(0, 6);
  return (
    <>
      <div style={{ marginBottom: 24 }}><Search /></div>
      <Stats divided style={{ marginBottom: 24 }}>
        <Stat size="sm" label={t('Block height', '区块高度')} value={<LiveValue value={height} format={(v) => v.toLocaleString('en-US')} />} />
        <Stat size="sm" label={t('ZEC price', 'ZEC 价格')} value={<LiveValue value={price} format={(v) => `$${v.toFixed(2)}`} />} />
        <Stat size="sm" label={t('Shielded pool', '屏蔽池占比')} value="31.2" unit="%" />
        <Stat size="sm" label={t('RPC uptime', 'RPC 可用率')} value="99.98" unit="%" />
      </Stats>
      <Split>
        <Main>
          <Panel title={t('Transactions per day · 30d', '每日交易数 · 30 天')}>
            <LineChart label={t('Daily transactions', '每日交易数')} series={[{ name: 'txs', data: txSeries, area: true }]} labels={days} height={220} yFormat={(v) => compactUsd(v).replace('$', '')} />
          </Panel>
          <Panel title={t('Latest transactions', '最新交易')} flush actions={<Button size="sm" href={link('explorer', 'txs')}>{t('All', '全部')}</Button>}>
            <DataTable rows={ACTIVITY} rowKey={(r) => r.hash} columns={txColumns.slice(0, 5)} />
          </Panel>
        </Main>
        <Side>
          <Panel title={t('Value pools', '价值池')}>
            <DonutChart label={t('Pool share', '池占比')} data={[{ label: 'Orchard', value: 22.4 }, { label: 'Sapling', value: 8.8 }, { label: 'Transparent', value: 68.8 }]} center={<strong>31.2%</strong>} />
          </Panel>
          <Panel title={t('Latest blocks', '最新区块')} flush actions={<Button size="sm" href={link('explorer', 'blocks')}>{t('All', '全部')}</Button>}>
            <DataTable
              rows={latest}
              rowKey={(b) => String(b.height)}
              columns={[
                { key: 'h', header: t('Height', '高度'), cell: (b) => <a href={link('explorer', 'block', String(b.height))}>#{b.height.toLocaleString('en-US')}</a> },
                { key: 'txs', header: 'Txs', numeric: true, cell: (b) => b.txs },
                { key: 'shielded', header: t('Shielded', '屏蔽'), numeric: true, cell: (b) => `${b.shieldedPct}%` },
              ]}
            />
          </Panel>
        </Side>
      </Split>
      <Alert tone="shielded" title={t('What the explorer shows', '浏览器展示范围')} style={{ marginTop: 20 }}>
        {t('Only public data or data disclosed with a viewing key. Shielded senders, recipients, amounts and memos are never displayed.', '仅展示公开数据或经查看密钥披露的数据。屏蔽交易的发送方、接收方、金额和备注不会显示。')}
      </Alert>
    </>
  );
}

function Txs() {
  const t = useT();
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState(1);
  const kinds = ['Bridge in', 'Swap', 'Lend', 'Bridge out', 'Deploy'];
  const rows = ACTIVITY.filter((r) => kind === 'all' || r.kind === kind);
  return (
    <>
      <ChipGroup aria-label={t('Type', '类型')} value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={[{ value: 'all', label: t('All', '全部') }, ...kinds.map((k) => ({ value: k, label: k }))]} />
      <div style={{ marginTop: 20 }}>
        <DataTable rows={rows} rowKey={(r) => r.hash} columns={txColumns} defaultSort={{ key: 'height', direction: 'descending' }} />
      </div>
      <div style={{ marginTop: 16 }}><Pagination page={page} pages={8} onChange={setPage} /></div>
    </>
  );
}

function TxDetail({ hash }: { hash: string }) {
  const t = useT();
  const tx = ACTIVITY.find((r) => r.hash === hash);
  if (!tx) return <EmptyState title={t('Transaction not found.', '交易不存在。')} hint={t('It may not be indexed yet, or the hash is wrong.', '可能尚未被索引，或哈希有误。')} action={<Button href={link('explorer', 'txs')}>{t('All transactions', '全部交易')}</Button>} />;
  const shielded = tx.privacy === 'shielded';
  return (
    <Split>
      <Main>
        <Panel title={tx.kind} actions={<TxStatus status={tx.status} confirmations={3} required={10} />}>
          <KeyValue
            items={[
              { label: 'Hash', value: <Hash value={tx.hash} truncate={[14, 10]} /> },
              { label: t('Block', '区块'), value: <a href={link('explorer', 'block', String(tx.height))}>#{tx.height.toLocaleString('en-US')}</a> },
              { label: t('From', '发送方'), value: shielded ? <span className="nui-text-muted">Shielded</span> : <Address address={ADDR.unified} /> },
              { label: t('To', '接收方'), value: shielded ? <span className="nui-text-muted">Shielded</span> : <Address address={ADDR.tex} /> },
              { label: t('Amount', '金额'), value: amountCell(tx) },
              { label: t('Fee', '手续费'), value: <Amount value={10000n} /> },
            ]}
          />
        </Panel>
        {shielded && <Alert tone="shielded" title={t('Shielded transaction', '屏蔽交易')}>{t('Sender, recipient, amount and memo are encrypted. Holders of a viewing key can disclose them.', '发送方、接收方、金额和备注均已加密。查看密钥持有者可以披露。')}</Alert>}
      </Main>
      <Side>
        <Panel title={t('Execution', '执行信息')}>
          <KeyValue
            items={[
              { label: t('Privacy', '隐私等级'), value: <PrivacyBadge level={tx.privacy} /> },
              { label: t('Pool', '价值池'), value: <PoolBadge pool={shielded ? 'orchard' : 'transparent'} /> },
              { label: t('Anchor', '锚定'), value: <Badge tone="info">NoirRoot verified</Badge> },
            ]}
          />
        </Panel>
      </Side>
    </Split>
  );
}

function Blocks() {
  const t = useT();
  return (
    <DataTable
      rows={BLOCKS}
      rowKey={(b) => String(b.height)}
      columns={[
        { key: 'height', header: t('Height', '高度'), cell: (b) => <a href={link('explorer', 'block', String(b.height))}>#{b.height.toLocaleString('en-US')}</a>, sortValue: (b) => b.height },
        { key: 'hash', header: 'Hash', cell: (b) => <Hash value={b.hash} /> },
        { key: 'txs', header: 'Txs', numeric: true, cell: (b) => b.txs, sortValue: (b) => b.txs },
        { key: 'size', header: 'Size', numeric: true, cell: (b) => `${b.size} KB` },
        { key: 'shielded', header: t('Shielded', '屏蔽占比'), numeric: true, cell: (b) => `${b.shieldedPct}%` },
        { key: 'age', header: t('Age', '时间'), numeric: true, cell: (b) => b.age },
      ]}
    />
  );
}

function BlockDetail({ height }: { height: string }) {
  const t = useT();
  const block = BLOCKS.find((b) => String(b.height) === height) ?? BLOCKS[0]!;
  return (
    <Split>
      <Main>
        <Panel title={`#${Number(height).toLocaleString('en-US')}`}>
          <KeyValue
            items={[
              { label: 'Hash', value: <Hash value={block.hash} truncate={[16, 12]} /> },
              { label: t('Transactions', '交易数'), value: block.txs },
              { label: t('Size', '大小'), value: `${block.size} KB` },
              { label: t('Shielded share', '屏蔽占比'), value: `${block.shieldedPct}%` },
              { label: t('Time', '时间'), value: block.age },
            ]}
          />
        </Panel>
        <Panel title={t('Transactions in this block', '本区块交易')} flush>
          <DataTable rows={ACTIVITY.slice(0, 3)} rowKey={(r) => r.hash} columns={txColumns.slice(0, 4)} />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Pool breakdown', '价值池构成')}>
          <DonutChart label={t('Block pools', '区块池')} data={[{ label: 'Orchard', value: block.shieldedPct * 0.7 }, { label: 'Sapling', value: block.shieldedPct * 0.3 }, { label: 'Transparent', value: 100 - block.shieldedPct }]} />
        </Panel>
      </Side>
    </Split>
  );
}

function AddressPage({ address }: { address: string }) {
  const t = useT();
  const info = parseAddress(address);
  if (!info) return <EmptyState title={t('Not a Zcash address.', '不是 Zcash 地址。')} />;
  if (info.shielded) {
    return (
      <Panel title={t('Shielded address', '屏蔽地址')}>
        <Address address={address} truncate={false} />
        <Alert tone="shielded" title={t('Balance and history are private', '余额和历史是私密的')} style={{ marginTop: 20 }}>
          {t('This address belongs to a shielded pool. The explorer cannot show balances, counterparties or amounts. A viewing key holder can disclose them selectively.', '该地址属于屏蔽池，浏览器无法显示余额、对手方和金额。查看密钥持有者可以选择性披露。')}
        </Alert>
      </Panel>
    );
  }
  return (
    <Split>
      <Main>
        <Panel title={t('Address', '地址')}>
          <Address address={address} truncate={false} />
          <div style={{ marginTop: 20 }}>
            <Stats>
              <Stat size="sm" label={t('Balance', '余额')} value={<Amount value={152000000n} />} />
              <Stat size="sm" label={t('Transactions', '交易数')} value="42" />
              <Stat size="sm" label={t('First seen', '首次出现')} value="2024-03" />
            </Stats>
          </div>
        </Panel>
        <Panel title={t('Public history', '公开历史')} flush>
          <DataTable rows={ACTIVITY.filter((r) => r.privacy !== 'shielded')} rowKey={(r) => r.hash} columns={txColumns.slice(0, 5)} />
        </Panel>
      </Main>
      <Side>
        <Alert tone="warning" title={t('Public address', '公开地址')}>
          {t('All balances and transfers of this address are visible to anyone. Use a Unified or Sapling address for privacy.', '该地址的余额和转账对所有人可见。需要隐私请使用 Unified 或 Sapling 地址。')}
        </Alert>
      </Side>
    </Split>
  );
}

function Tokens() {
  const t = useT();
  return (
    <DataTable
      rows={EXPLORER_TOKENS}
      rowKey={(x) => x.symbol}
      columns={[
        { key: 'token', header: t('Token', '代币'), cell: (x) => <a href={link('explorer', 'token', x.symbol)} style={{ fontWeight: 600 }}>{x.symbol}<span className="nui-text-muted" style={{ marginLeft: 8 }}>{x.name}</span></a> },
        { key: 'supply', header: t('Supply', '供应量'), numeric: true, cell: (x) => compactUsd(x.supply).replace('$', ''), sortValue: (x) => x.supply },
        { key: 'holders', header: t('Holders', '持有者'), numeric: true, cell: (x) => x.holders.toLocaleString('en-US') },
        { key: 'shielded', header: t('Shielded', '屏蔽占比'), numeric: true, cell: (x) => `${x.shielded}%` },
        { key: 'verified', header: '', cell: (x) => (x.verified ? <Badge tone="info">{t('Verified', '已认证')}</Badge> : null) },
      ]}
    />
  );
}

function TokenDetail({ symbol }: { symbol: string }) {
  const t = useT();
  const token = EXPLORER_TOKENS.find((x) => x.symbol === symbol);
  if (!token) return <EmptyState title={t('Token not found.', '代币不存在。')} />;
  return (
    <Split>
      <Main>
        <Panel title={t('Supply · 30 days', '供应量 · 30 天')}>
          <LineChart label={t('Supply', '供应量')} series={[{ name: token.symbol, data: supplySeries, area: true }]} labels={days} height={220} yFormat={(v) => compactUsd(v).replace('$', '')} />
        </Panel>
        <Panel title={t('Top holders', '主要持有者')} flush>
          <DataTable
            rows={[ADDR.unified, ADDR.sapling, ADDR.tex]}
            rowKey={(a) => a}
            columns={[
              { key: 'address', header: t('Address', '地址'), cell: (a) => <Address address={a} /> },
              { key: 'share', header: t('Share', '占比'), numeric: true, cell: (_, k) => (k === 2 ? '—' : `${[12.4, 6.1][k]}%`) },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={token.symbol}>
          <KeyValue
            items={[
              { label: t('Name', '名称'), value: token.name },
              { label: t('Supply', '供应量'), value: token.supply.toLocaleString('en-US') },
              { label: t('Holders', '持有者'), value: token.holders.toLocaleString('en-US') },
              { label: t('Shielded share', '屏蔽占比'), value: `${token.shielded}%` },
            ]}
          />
          <Button style={{ marginTop: 16 }} href={link('dex', 'pools')}>{t('Trade on DEX', '在 DEX 交易')}</Button>
        </Panel>
      </Side>
    </Split>
  );
}

function BridgeStatus() {
  const t = useT();
  return (
    <Grid cols={2}>
      {ACTIVITY.filter((r) => r.kind.startsWith('Bridge')).map((r) => (
        <Panel key={r.hash} title={r.kind} actions={<TxStatus status={r.status} />}>
          <Stepper
            steps={[
              { title: t('Source confirmed', '源链已确认'), state: 'complete' },
              { title: t('Relayer signed', '中继已签名'), state: r.status === 'failed' ? 'error' : 'complete' },
              { title: t('Destination executed', '目标链已执行'), state: r.status === 'confirmed' ? 'complete' : r.status === 'failed' ? 'error' : 'active' },
            ]}
          />
          <div style={{ marginTop: 12 }}><Hash value={r.hash} href={link('explorer', 'tx', r.hash)} /></div>
        </Panel>
      ))}
    </Grid>
  );
}

function Anchors() {
  const t = useT();
  return (
    <>
      <Alert tone="info" title={t('State anchoring, not a ZK rollup', '状态锚定，而非 ZK Rollup')} style={{ marginBottom: 20 }}>
        {t('Noir commits its state root to Zcash. Execution runs on NEAR; anchoring gives an auditable checkpoint, not full rollup security.', 'Noir 将状态根提交到 Zcash。执行在 NEAR 上进行；锚定提供可审计的检查点，而非完整的 Rollup 安全性。')}
      </Alert>
      <DataTable
        rows={ANCHORS}
        rowKey={(a) => String(a.epoch)}
        columns={[
          { key: 'epoch', header: 'Epoch', cell: (a) => `#${a.epoch}` },
          { key: 'root', header: 'Noir state root', cell: (a) => <Hash value={a.root} /> },
          { key: 'tx', header: t('Zcash tx', 'Zcash 交易'), cell: (a) => <Hash value={a.zcashTx} href={link('explorer', 'tx', a.zcashTx)} /> },
          { key: 'height', header: t('Height', '高度'), numeric: true, cell: (a) => `#${a.height.toLocaleString('en-US')}` },
          { key: 'verified', header: t('Verification', '验证'), cell: (a) => (a.verified ? <Badge tone="positive" dot>{t('Verified', '已验证')}</Badge> : <Badge tone="warning" dot>{t('Pending', '待验证')}</Badge>) },
        ]}
      />
    </>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const parents: Record<string, string> = { tx: 'txs', block: 'blocks', address: '', token: 'tokens' };
  const parent = page ? (parents[page] ?? page) : '';
  let body;
  switch (page) {
    case undefined: body = <Overview />; break;
    case 'txs': body = <Txs />; break;
    case 'tx': body = <TxDetail hash={arg ?? ''} />; break;
    case 'blocks': body = <Blocks />; break;
    case 'block': body = <BlockDetail height={arg ?? ''} />; break;
    case 'address': body = <AddressPage address={arg ?? ''} />; break;
    case 'tokens': body = <Tokens />; break;
    case 'token': body = <TokenDetail symbol={arg ?? ''} />; break;
    case 'bridge': body = <BridgeStatus />; break;
    case 'anchors': body = <Anchors />; break;
    default: body = <Overview />;
  }
  return (
    <ProductShell product="explorer" page={parent} title={page && arg ? (page === 'token' ? arg : `${page} ${arg.slice(0, 12)}…`) : undefined} crumbs={page && arg ? [{ label: parent || t('Search', '搜索'), href: link('explorer', parent) }, { label: arg.slice(0, 20) }] : undefined}>
      {body}
    </ProductShell>
  );
}
