import { useState } from 'react';
import {
  Address, Alert, Amount, Button, ChainBadge, Checkbox, DataTable, DetailList, EmptyState, Field, Grid, Hash, Input, KeyValue,
  Meter, Panel, PrivacyBadge, Select, Shell, Stat, Stats, Stepper, Timeline, TokenAmountInput, TxStatus, UptimeBar, isValidAddress, useToast,
} from '@nui3/react';
import { ADDR, TOKENS } from '../../data';
import { useTxProgress } from '../../sim';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, SectionTitle, Side, Split, usd } from '../ui';
import { ROUTES, TRANSFERS, uptimeDays, type Transfer } from './data';

const CHAINS = ['Zcash', 'Noir', 'NEAR', 'Ethereum', 'Solana', 'Bitcoin'];
const privacyOf = (c: string) => (c === 'Zcash' ? 'shielded' : c === 'Noir' ? 'confidential' : 'public') as 'shielded' | 'confidential' | 'public';
const decimalsOf = (s: string) => TOKENS.find((x) => x.symbol === s)?.decimals ?? 8;

function TransferForm() {
  const t = useT();
  const { toast } = useToast();
  const [fromChain, setFromChain] = useState('Zcash');
  const [toChain, setToChain] = useState('Noir');
  const [amount, setAmount] = useState('2.5');
  const [recipient, setRecipient] = useState('');
  const [ack, setAck] = useState(false);
  const progress = useTxProgress(10, 4000, 3);
  const leavesShielded = privacyOf(fromChain) === 'shielded' && privacyOf(toChain) !== 'shielded';
  const toPublic = privacyOf(toChain) === 'public';
  const recipientError = recipient && toChain === 'Zcash' && !isValidAddress(recipient, 'mainnet') ? t('Not a valid Zcash mainnet address', '不是有效的 Zcash 主网地址') : undefined;

  return (
    <Split>
      <Main>
        <Panel title={t('Transfer', '转账')}>
          <div className="nui-stack" style={{ gap: 20 }}>
            <Grid cols={2} style={{ gap: 16 }}>
              <Field label={t('From', '转出链')}>
                <Select value={fromChain} onChange={(e) => { setFromChain(e.target.value); if (e.target.value === toChain) setToChain(fromChain); }}>
                  {CHAINS.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label={t('To', '转入链')}>
                <Select value={toChain} onChange={(e) => { setToChain(e.target.value); if (e.target.value === fromChain) setFromChain(toChain); }}>
                  {CHAINS.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </Grid>
            <TokenAmountInput label={`${t('From', '来自')} ${fromChain}`} aside={<PrivacyBadge level={privacyOf(fromChain)} />} value={amount} onChange={setAmount} token={TOKENS[0]} onMax={setAmount} fiat={usd(Number(amount) * 951.63 || 0)} />
            <Field label={t('Recipient', '收款地址')} hint={toChain === 'Zcash' ? t('Unified or Sapling keeps funds shielded.', 'Unified 或 Sapling 地址可保持屏蔽。') : t('Address on the destination chain.', '目标链地址。')} error={recipientError}>
              <Input mono placeholder={toChain === 'Zcash' ? 'u1… or zs1…' : '0x… / account.near'} value={recipient} onChange={(e) => setRecipient(e.target.value.trim())} />
            </Field>
            <DetailList
              items={[
                { label: t('Destination privacy', '目标隐私等级'), value: <PrivacyBadge level={privacyOf(toChain)} describe={false} /> },
                { label: t('Bridge fee', '跨链手续费'), value: '0.1%' },
                { label: t('Estimated time', '预计时间'), value: fromChain === 'Zcash' ? '~12 min (10 blocks)' : '~2 min' },
              ]}
            />
            {(leavesShielded || toPublic) && (
              <Alert tone="warning" title={t('Privacy changes on this route', '该路线的隐私等级会变化')}>
                {leavesShielded && t('Funds leave the Zcash shielded pool. ', '资金将离开 Zcash 屏蔽池。')}
                {toPublic && t(`Transfers on ${toChain} are public: addresses and amounts are visible to anyone.`, `在 ${toChain} 上的转账是公开的：地址和金额所有人可见。`)}
              </Alert>
            )}
            <Checkbox label={t('I understand bridge transfers are irreversible once confirmed.', '我理解跨链转账一经确认不可撤销。')} checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <Button variant="solid" block disabled={!amount || !ack || Boolean(recipientError)} onClick={() => toast({ title: t('Bridge transfer started', '跨链转账已开始'), description: `${amount} ZEC · ${fromChain} → ${toChain}`, tone: 'positive' })}>
              {t('Bridge', '跨链')} {amount || '0'} ZEC
            </Button>
          </div>
        </Panel>
      </Main>
      <Side>
        <Panel title={t('In progress', '进行中')} actions={<TxStatus status={progress.status} confirmations={progress.confirmations} required={progress.required} />}>
          <Stepper
            steps={[
              { title: t('Deposit to shielded address', '充值到屏蔽地址'), description: <Address address={ADDR.sapling} truncate={[8, 6]} />, state: 'complete' },
              { title: t('Confirmations on Zcash', '等待 Zcash 确认'), description: `${progress.confirmations} / ${progress.required} ${t('blocks', '个区块')}`, state: progress.status === 'confirmed' ? 'complete' : 'active' },
              { title: t('Mint nZEC on Noir', '在 Noir 铸造 nZEC'), description: <PrivacyBadge level="confidential" />, state: progress.status === 'confirmed' ? 'active' : 'pending' },
              { title: t('Available in wallet', '钱包可用'), state: 'pending' },
            ]}
          />
          <div style={{ marginTop: 20 }}>
            <Meter label={t('Daily route limit', '当日路线限额')} value={182} max={500} valueLabel="182 / 500 ZEC" />
          </div>
        </Panel>
        <Panel title={t('Route health', '路线可用率')}>
          <UptimeBar label={t('Zcash → Noir · 45 days', 'Zcash → Noir · 45 天')} days={uptimeDays(4)} />
        </Panel>
      </Side>
    </Split>
  );
}

function History({ onOpen }: { onOpen: (id: string) => void }) {
  const t = useT();
  return (
    <DataTable
      rows={TRANSFERS}
      rowKey={(r) => r.id}
      onRowClick={(r) => onOpen(r.id)}
      columns={[
        { key: 'id', header: 'ID', cell: (r) => <a href={link('bridge', 'tx', r.id)} className="nui-mono">{r.id}</a> },
        { key: 'route', header: t('Route', '路线'), cell: (r) => <span className="nui-cluster" style={{ gap: 8 }}>{r.route.split(' → ').map((c, k) => <span key={c} className="nui-cluster" style={{ gap: 8 }}>{k > 0 && '→'}<ChainBadge name={c} /></span>)}</span> },
        { key: 'amount', header: t('Amount', '数量'), numeric: true, cell: (r) => `${r.amount} ${r.symbol}` },
        { key: 'value', header: t('Value', '价值'), numeric: true, cell: (r) => usd(r.usd), sortValue: (r) => r.usd },
        { key: 'status', header: t('Status', '状态'), cell: (r) => <TxStatus status={r.status} confirmations={r.status === 'confirming' ? r.confirmations : undefined} required={r.required} /> },
        { key: 'age', header: t('Age', '时间'), numeric: true, cell: (r) => r.age },
      ]}
    />
  );
}

function TransferDetail({ transfer }: { transfer: Transfer }) {
  const t = useT();
  const failed = transfer.status === 'failed' || transfer.status === 'refunded';
  return (
    <Split>
      <Main>
        <Panel title={t('Transfer', '转账详情')} actions={<TxStatus status={transfer.status} confirmations={transfer.confirmations} required={transfer.required} />}>
          <KeyValue
            items={[
              { label: t('Route', '路线'), value: transfer.route },
              { label: t('Amount', '数量'), value: `${transfer.amount} ${transfer.symbol} · ${usd(transfer.usd)}` },
              { label: t('Deposit address', '充值地址'), value: <Address address={ADDR.sapling} /> },
              { label: t('Source tx', '来源交易'), value: <Hash value="46e768905750424dadd650ca6163eadd8a018dd6f1b7f5e11c511b173d1bd5f2" truncate={[12, 8]} href={link('explorer', 'tx', '46e768905750424dadd650ca6163eadd8a018dd6f1b7f5e11c511b173d1bd5f2')} /> },
              { label: t('Confirmations', '确认数'), value: `${transfer.confirmations} / ${transfer.required}` },
            ]}
          />
        </Panel>
        {failed && (
          <Alert tone="negative" title={transfer.status === 'refunded' ? t('Transfer refunded', '转账已退回') : t('Transfer failed', '转账失败')} action={<Button variant="outline" size="sm" href={link('bridge', 'recovery')}>{t('Recover', '恢复资金')}</Button>}>
            {t('The destination transaction could not be executed. Your funds are safe and can be recovered to the source address.', '目标链交易未能执行。你的资金安全，可以退回来源地址。')}
          </Alert>
        )}
      </Main>
      <Side>
        <Panel title={t('Timeline', '进度时间线')}>
          <Timeline
            items={[
              { title: t('Deposit detected', '检测到充值'), time: '12:04', tone: 'positive', description: t('Zcash shielded pool', 'Zcash 屏蔽池') },
              { title: t('Waiting for confirmations', '等待区块确认'), time: '12:06', tone: transfer.confirmations >= transfer.required ? 'positive' : 'accent', description: `${transfer.confirmations}/${transfer.required}` },
              { title: failed ? t('Destination execution failed', '目标链执行失败') : t('Mint on Noir', '在 Noir 铸造'), time: '12:16', tone: failed ? 'negative' : transfer.status === 'confirmed' ? 'positive' : 'neutral', description: failed ? t('Relayer timeout', '中继超时') : 'nZEC' },
              { title: transfer.status === 'refunded' ? t('Refund completed', '退款完成') : t('Available in wallet', '钱包可用'), time: '12:20', tone: transfer.status === 'confirmed' || transfer.status === 'refunded' ? 'positive' : 'neutral' },
            ]}
          />
        </Panel>
      </Side>
    </Split>
  );
}

function Routes() {
  const t = useT();
  return (
    <Grid cols={2}>
      {ROUTES.map((r, k) => (
        <Panel key={`${r.from}${r.to}`} title={`${r.from} → ${r.to}`} actions={<PrivacyBadge level={privacyOf(r.to)} describe={false} />}>
          <KeyValue
            items={[
              { label: t('Fee', '手续费'), value: `${r.fee}%` },
              { label: t('ETA', '预计时间'), value: r.eta },
              { label: t('Uptime · 90d', '可用率 · 90 天'), value: `${r.uptime}%` },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            <Meter label={t('Daily limit used', '当日限额使用')} value={r.used} max={r.dailyLimit} valueLabel={`${r.used.toLocaleString()} / ${r.dailyLimit.toLocaleString()}`} tone={r.used / r.dailyLimit > 0.8 ? 'warning' : 'accent'} />
          </div>
          <div style={{ marginTop: 16 }}>
            <UptimeBar label={t('Last 45 days', '近 45 天')} days={uptimeDays(k + 2)} />
          </div>
        </Panel>
      ))}
    </Grid>
  );
}

function Recovery() {
  const t = useT();
  const { toast } = useToast();
  const [id, setId] = useState('br-1039');
  const failed = TRANSFERS.filter((x) => x.status === 'failed' || x.status === 'refunded');
  return (
    <Split>
      <Main>
        <Panel title={t('Recover a transfer', '恢复转账')}>
          <Field label={t('Transfer ID', '转账 ID')} hint={t('Find it in your bridge history or deposit receipt.', '可在跨链历史或充值凭证中找到。')}>
            <Input mono value={id} onChange={(e) => setId(e.target.value)} />
          </Field>
          <div style={{ marginTop: 20 }}>
            <DataTable
              rows={failed}
              rowKey={(r) => r.id}
              columns={[
                { key: 'id', header: 'ID', cell: (r) => <span className="nui-mono">{r.id}</span> },
                { key: 'route', header: t('Route', '路线'), cell: (r) => r.route },
                { key: 'amount', header: t('Amount', '数量'), numeric: true, cell: (r) => `${r.amount} ${r.symbol}` },
                { key: 'status', header: t('Status', '状态'), cell: (r) => <TxStatus status={r.status} /> },
              ]}
            />
          </div>
          <Button variant="solid" style={{ marginTop: 20 }} onClick={() => toast({ title: t('Recovery submitted', '恢复申请已提交'), description: id, tone: 'positive' })}>{t('Recover to source address', '退回来源地址')}</Button>
        </Panel>
      </Main>
      <Side>
        <Alert tone="info" title={t('Your funds are recoverable', '资金可以恢复')}>
          {t('Failed transfers never leave the bridge contract without a destination confirmation. Recovery returns the full amount minus the source-chain fee.', '失败的转账在没有目标链确认前不会离开跨链合约。恢复会退回全额（扣除源链手续费）。')}
        </Alert>
      </Side>
    </Split>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const transfer = TRANSFERS.find((x) => x.id === arg);
  let body;
  switch (page) {
    case undefined: body = <TransferForm />; break;
    case 'history': body = <History onOpen={() => undefined} />; break;
    case 'tx': body = transfer ? <TransferDetail transfer={transfer} /> : <EmptyState title={t('Transfer not found.', '转账不存在。')} action={<Button href={link('bridge', 'history')}>{t('History', '历史')}</Button>} />; break;
    case 'routes': body = <Routes />; break;
    case 'recovery': body = <Recovery />; break;
    default: body = <TransferForm />;
  }
  return (
    <ProductShell product="bridge" page={page === 'tx' ? 'history' : (page ?? '')} title={page === 'tx' ? arg : undefined} crumbs={page === 'tx' ? [{ label: t('History', '历史'), href: link('bridge', 'history') }, { label: arg }] : undefined} lead={!page ? t('Deposit ZEC into Noir, or withdraw to other chains.', '将 ZEC 存入 Noir，或提取到其他链。') : undefined}>
      {body}
    </ProductShell>
  );
}
