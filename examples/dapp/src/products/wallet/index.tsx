import { useMemo, useState } from 'react';
import {
  Address, Alert, Amount, Badge, Button, ChipGroup, Cluster, DataTable, DetailList, Dialog, DonutChart, Field, Grid, Input, KeyValue,
  MemoInput, Pagination, Panel, PoolBadge, ReceiveQR, SearchInput, SecretField, Segmented, Select, Stat, Stats, Switch, SyncProgress,
  Timeline, TokenIcon, TxStatus, buildPaymentUri, formatUnits, isMemoValid, isValidAddress, useToast,
} from '@nui3/react';
import { ADDR, PRICES, TOKENS } from '../../data';
import { useSettings, useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, usd } from '../ui';

function usePortfolio() {
  const held = TOKENS.filter((x) => x.balance !== undefined && BigInt(x.balance) > 0n);
  const total = held.reduce((s, x) => s + Number(formatUnits(x.balance!, x.decimals)) * (PRICES[x.symbol] ?? 0), 0);
  return { held, total };
}

function Overview() {
  const t = useT();
  const { hideBalances } = useSettings();
  const { held, total } = usePortfolio();
  return (
    <Split>
      <Main>
        <Panel>
          <Stats>
            <Stat label={t('Total value', '总资产')} value={hideBalances ? '••••••' : usd(total, 0)} />
            <Stat label={t('Shielded ZEC', '屏蔽 ZEC')} value={<Amount value={1284500000n} symbol={null} hidden={hideBalances} />} />
            <Stat label={t('24h change', '24h 变化')} value={<span style={{ color: 'var(--nui-positive)' }}>+2.4%</span>} />
          </Stats>
          <div style={{ marginTop: 24 }}><SyncProgress height={3104920} tip={3120448} from={2900000} eta="4 min" /></div>
        </Panel>
        <Panel title={t('Balances', '余额')} flush actions={<Button size="sm" href={link('wallet', 'send')}>{t('Send', '发送')}</Button>}>
          <DataTable
            rows={held}
            rowKey={(x) => `${x.chain}:${x.symbol}`}
            columns={[
              { key: 'asset', header: t('Asset', '资产'), cell: (x) => <span className="nui-cluster" style={{ gap: 10 }}><TokenIcon symbol={x.symbol} size="sm" />{x.symbol}<span className="nui-text-muted">{x.chain}</span></span> },
              { key: 'pool', header: t('Pool', '池'), cell: (x) => (x.chain === 'Zcash' ? <PoolBadge pool="orchard" /> : <span className="nui-text-muted">—</span>) },
              { key: 'balance', header: t('Balance', '余额'), numeric: true, cell: (x) => <Amount value={x.balance!} decimals={x.decimals} symbol={null} hidden={hideBalances} /> },
              { key: 'value', header: t('Value', '价值'), numeric: true, cell: (x) => (hideBalances ? '••••' : usd(Number(formatUnits(x.balance!, x.decimals)) * (PRICES[x.symbol] ?? 0))) },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Allocation', '资产分布')}>
          <DonutChart
            label={t('Portfolio allocation', '资产分布')}
            data={held.map((x) => ({ label: x.symbol, value: Number(formatUnits(x.balance!, x.decimals)) * (PRICES[x.symbol] ?? 0) }))}
            center={<strong>{hideBalances ? '••••' : usd(total, 0)}</strong>}
          />
        </Panel>
        <Panel title={t('Recent activity', '最近动态')}>
          <Timeline
            items={[
              { title: t('Received 2.5 ZEC', '收到 2.5 ZEC'), time: '12 min', tone: 'positive', description: t('Orchard · shielded', 'Orchard · 屏蔽') },
              { title: t('Swap ZEC → USDC', '兑换 ZEC → USDC'), time: '2 h', tone: 'accent' },
              { title: t('Bridge to Noir', '跨链到 Noir'), time: '1 d', tone: 'info', description: 'nZEC' },
            ]}
          />
          <Button href={link('wallet', 'activity')}>{t('All activity', '全部动态')}</Button>
        </Panel>
      </Side>
    </Split>
  );
}

function Send() {
  const t = useT();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.5');
  const [memo, setMemo] = useState('');
  const [fee, setFee] = useState('standard');
  const [review, setReview] = useState(false);
  const [signing, setSigning] = useState(false);
  const info = recipient ? isValidAddress(recipient, 'mainnet') : false;
  const error = recipient && !info ? t('Invalid Zcash mainnet address', '无效的 Zcash 主网地址') : undefined;
  const memoError = memo && !isMemoValid(memo) ? t('Memo exceeds 512 bytes', '备注超过 512 字节') : undefined;

  const confirm = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setReview(false);
      toast({ title: t('Transaction submitted', '交易已提交'), description: `${amount} ZEC`, tone: 'positive' });
    }, 2000);
  };

  return (
    <Split>
      <Main>
        <Panel title={t('Send ZEC', '发送 ZEC')}>
          <div className="nui-stack" style={{ gap: 20 }}>
            <Field label={t('Recipient', '收款地址')} error={error} hint={t('Unified, Sapling, TEX or transparent addresses are supported.', '支持 Unified、Sapling、TEX 和透明地址。')}>
              <Input mono placeholder="u1… / zs1… / t1…" value={recipient} onChange={(e) => setRecipient(e.target.value.trim())} />
            </Field>
            {info && <Address address={recipient} truncate={[16, 10]} />}
            <Field label={t('Amount', '数量')}>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
            </Field>
            <Field label={t('Memo', '备注')} hint={t('Encrypted. Only shielded recipients can receive memos.', '加密。只有屏蔽地址可以接收备注。')}>
              <MemoInput value={memo} onChange={setMemo} recipient={recipient} />
            </Field>
            {memoError && <Alert tone="negative">{memoError}</Alert>}
            <Field label={t('Fee', '手续费')}>
              <Segmented aria-label={t('Fee', '手续费')} value={fee} onChange={setFee} options={[{ value: 'economy', label: t('Economy · 0.00001', '经济 · 0.00001') }, { value: 'standard', label: t('Standard · 0.0001', '标准 · 0.0001') }, { value: 'fast', label: t('Fast · 0.001', '快速 · 0.001') }]} />
            </Field>
            <Button variant="solid" block disabled={!info || !amount || Boolean(memoError)} onClick={() => setReview(true)}>{t('Review transaction', '预览交易')}</Button>
          </div>
        </Panel>
      </Main>
      <Side>
        <Alert tone="shielded" title={t('Shielded by default', '默认屏蔽')}>
          {t('Sends from this wallet use the Orchard pool. Choosing a transparent recipient reveals the amount and recipient on-chain.', '本钱包默认使用 Orchard 池发送。选择透明地址收款会在链上公开金额和接收方。')}
        </Alert>
      </Side>
      <Dialog open={review} onClose={() => !signing && setReview(false)} dismissible={!signing} title={t('Confirm send', '确认发送')} footer={<><Button disabled={signing} onClick={() => setReview(false)} arrow={false}>{t('Cancel', '取消')}</Button><Button variant="solid" loading={signing} onClick={confirm}>{t('Sign & send', '签名并发送')}</Button></>}>
        <KeyValue
          items={[
            { label: t('To', '收款方'), value: <Address address={recipient || ADDR.unified} /> },
            { label: t('Amount', '数量'), value: `${amount} ZEC · ${usd(Number(amount) * 951.63)}` },
            { label: t('Fee', '手续费'), value: fee === 'fast' ? '0.001 ZEC' : fee === 'economy' ? '0.00001 ZEC' : '0.0001 ZEC' },
            { label: t('Memo', '备注'), value: memo || t('None', '无') },
          ]}
        />
      </Dialog>
    </Split>
  );
}

function Receive() {
  const t = useT();
  const [kind, setKind] = useState<'unified' | 'sapling'>('unified');
  const [amount, setAmount] = useState('0.25');
  const [memo, setMemo] = useState('Invoice #2026-10');
  const address = kind === 'unified' ? ADDR.unified : ADDR.sapling2;
  const uri = useMemo(() => buildPaymentUri({ address, amount: /^\d{1,8}(\.\d{1,8})?$/.test(amount) ? amount : undefined, memo: memo && isMemoValid(memo) ? memo : undefined }), [address, amount, memo]);
  return (
    <Split>
      <Main>
        <Panel title={t('Receive', '收款')} actions={<PoolBadge pool={kind === 'unified' ? 'orchard' : 'sapling'} />}>
          <Segmented aria-label={t('Address type', '地址类型')} value={kind} onChange={(v) => setKind(v as 'unified' | 'sapling')} options={[{ value: 'unified', label: 'Unified' }, { value: 'sapling', label: 'Sapling' }]} />
          <div style={{ display: 'grid', justifyItems: 'center', gap: 16, marginTop: 20 }}>
            <ReceiveQR value={uri} size={200} caption={`ZIP-321${amount ? ` · ${amount} ZEC` : ''}`} />
            <Address address={address} truncate={[12, 8]} />
          </div>
          <div className="nui-stack" style={{ gap: 20, marginTop: 24 }}>
            <Field label={t('Request amount', '请求金额')} hint={t('Optional. Included in the QR code.', '可选，会写入二维码。')}>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
            </Field>
            <Field label={t('Memo', '备注')}><MemoInput value={memo} onChange={setMemo} recipient={address} /></Field>
          </div>
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Payment URI', '支付链接')}>
          <code className="nui-mono" style={{ wordBreak: 'break-all', fontSize: 12 }}>{uri}</code>
        </Panel>
      </Side>
    </Split>
  );
}

const ACTIVITY_ITEMS = [
  { kind: 'receive', title: 'Received 2.5 ZEC', zh: '收到 2.5 ZEC', time: '12 min', tone: 'positive' as const },
  { kind: 'send', title: 'Sent 0.4 ZEC', zh: '发送 0.4 ZEC', time: '1 h', tone: 'neutral' as const },
  { kind: 'swap', title: 'Swap 1.2 ZEC → USDC', zh: '兑换 1.2 ZEC → USDC', time: '2 h', tone: 'accent' as const },
  { kind: 'bridge', title: 'Bridge 0.75 ZEC to Noir', zh: '跨链 0.75 ZEC 到 Noir', time: '1 d', tone: 'info' as const },
  { kind: 'receive', title: 'Received 120 USDC', zh: '收到 120 USDC', time: '2 d', tone: 'positive' as const },
  { kind: 'send', title: 'Payroll run · 4 recipients', zh: '工资发放 · 4 位收款人', time: '3 d', tone: 'neutral' as const },
];

function Activity() {
  const t = useT();
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const items = ACTIVITY_ITEMS.filter((x) => (kind === 'all' || x.kind === kind) && (!q || x.title.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <Cluster justify="space-between" style={{ marginBottom: 20 }}>
        <ChipGroup aria-label={t('Activity type', '动态类型')} value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={[{ value: 'all', label: t('All', '全部') }, { value: 'receive', label: t('Received', '收款') }, { value: 'send', label: t('Sent', '发送') }, { value: 'swap', label: t('Swap', '兑换') }, { value: 'bridge', label: t('Bridge', '跨链') }]} />
        <SearchInput label={t('Search activity', '搜索动态')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ width: 220 }} />
      </Cluster>
      <Panel>
        <Timeline items={items.map((x) => ({ title: t(x.title, x.zh), time: x.time, tone: x.tone, description: <TxStatus status="confirmed" /> }))} />
      </Panel>
      <Pagination page={page} pages={3} onChange={setPage} />
    </>
  );
}

function SettingsPage() {
  const t = useT();
  const { hideBalances, setHideBalances, lang, setLang, theme, setTheme } = useSettings();
  const [autoLock, setAutoLock] = useState(true);
  const [hideIp, setHideIp] = useState(true);
  return (
    <Grid cols={2} style={{ alignItems: 'start' }}>
      <Panel title={t('Privacy & display', '隐私与显示')}>
        <div className="nui-stack" style={{ gap: 20 }}>
          <Switch label={t('Hide balances everywhere', '全局隐藏余额')} checked={hideBalances} onChange={setHideBalances} />
          <Switch label={t('Auto-lock after 5 minutes', '5 分钟后自动锁定')} checked={autoLock} onChange={setAutoLock} />
          <Switch label={t('Route lightwalletd over Tor', '通过 Tor 连接 lightwalletd')} checked={hideIp} onChange={setHideIp} />
          <Field label={t('Language', '语言')}>
            <Segmented aria-label={t('Language', '语言')} value={lang} onChange={(v) => setLang(v as 'en' | 'zh')} options={[{ value: 'en', label: 'English' }, { value: 'zh', label: '中文' }]} />
          </Field>
          <Field label={t('Theme', '主题')}>
            <Segmented aria-label={t('Theme', '主题')} value={theme} onChange={(v) => setTheme(v as 'paper' | 'night' | 'jade')} options={[{ value: 'paper', label: t('Paper', '纸白') }, { value: 'night', label: t('Night', '暗夜') }, { value: 'jade', label: t('Custom', '自定义') }]} />
          </Field>
        </div>
      </Panel>
      <Panel title={t('Viewing key', '查看密钥')}>
        <p className="nui-text-secondary nui-text-small" style={{ marginBottom: 16 }}>
          {t('Share a viewing key to disclose your shielded history to an auditor without allowing them to spend.', '分享查看密钥可向审计方披露屏蔽历史，而对方无法花费资金。')}
        </p>
        <SecretField value="zxviews1q0d3w2x9y8z7a6b5c4d3e2f1g0h9j8k7l6m5n4p3q2r1s0t" label={t('Full viewing key', '完整查看密钥')} />
        <div style={{ marginTop: 20 }}>
          <KeyValue
            items={[
              { label: t('Default pool', '默认池'), value: <PoolBadge pool="orchard" /> },
              { label: t('Birthday height', '钱包生日高度'), value: '2,900,000' },
              { label: t('Node', '节点'), value: 'lightwalletd.noir.example:443' },
            ]}
          />
        </div>
      </Panel>
    </Grid>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page] = path;
  const body = page === 'send' ? <Send /> : page === 'receive' ? <Receive /> : page === 'activity' ? <Activity /> : page === 'settings' ? <SettingsPage /> : <Overview />;
  return (
    <ProductShell product="wallet" page={page ?? ''} lead={!page ? t('Shielded balances, sends and receives in one place.', '集中管理屏蔽余额、发送和收款。') : undefined}>
      {body}
    </ProductShell>
  );
}
