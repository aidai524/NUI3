import { useMemo, useState } from 'react';
import {
  Address, Alert, Amount, Badge, BarChart, BatchPayments, BatchPaymentTable, Button, Card, Checkbox, Cluster, Countdown, DataTable, Dialog, EmptyState, Field,
  Grid, Input, KeyValue, Panel, PrivacyBadge, Select, Stat, Stats, Stepper, Switch, Timeline, TxStatus, formatUnits, useToast,
  parsePaymentCsv, validatePayments, type PaymentRow, type StepState, type TxState,
} from '@nui3/react';
import { ADDR, dayLabels, walk } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, usd } from '../ui';

const PEOPLE = [
  { name: 'Ana', role: 'Engineering', address: ADDR.sapling, amount: '2.5', memo: 'October salary' },
  { name: 'Lee', role: 'Design', address: ADDR.sapling2, amount: '1.8', memo: 'October salary' },
  { name: 'Rui', role: 'Research', address: ADDR.unified, amount: '3.2', memo: 'October salary' },
  { name: 'Mara', role: 'Operations', address: ADDR.tex, amount: '1.2', memo: '' },
];

const SAMPLE_CSV = `name,address,amount,memo\n${PEOPLE.map((p) => `${p.name},${p.address},${p.amount},${p.memo}`).join('\n')}`;

const RUNS = [
  { id: 'run-2026-10', date: '2026-10-25', recipients: 4, total: 870000000n, status: 'confirmed' as TxState },
  { id: 'run-2026-09', date: '2026-09-25', recipients: 4, total: 840000000n, status: 'confirmed' as TxState },
  { id: 'run-2026-08', date: '2026-08-25', recipients: 3, total: 610000000n, status: 'confirmed' as TxState },
  { id: 'run-2026-07', date: '2026-07-25', recipients: 3, total: 600000000n, status: 'failed' as TxState },
];

function Overview() {
  const t = useT();
  const next = Date.now() + 5 * 86400000 + 3 * 3600000;
  return (
    <Split>
      <Main>
        <Stats divided>
          <Stat size="sm" label={t('October payroll', '十月工资总额')} value={<Amount value={870000000n} />} />
          <Stat size="sm" label={t('People', '收款人数')} value={PEOPLE.length} />
          <Stat size="sm" label={t('Shielded share', '屏蔽地址占比')} value="75" unit="%" />
        </Stats>
        <Panel title={t('Next scheduled run', '下次计划发放')} actions={<Badge tone="info">{t('Scheduled', '已排期')}</Badge>}>
          <Cluster justify="space-between">
            <Countdown to={next} />
            <Button variant="solid" href={link('payroll', 'new')}>{t('Run now', '立即发放')}</Button>
          </Cluster>
          <div style={{ marginTop: 16 }}>
            <KeyValue items={[{ label: t('Date', '日期'), value: '2026-10-31 09:00 UTC' }, { label: t('Recipients', '收款人'), value: '4' }, { label: t('Asset', '资产'), value: 'ZEC · Orchard' }]} />
          </div>
        </Panel>
        <Panel title={t('Payroll spend · 6 months', '工资支出 · 6 个月')}>
          <BarChart label={t('Monthly payroll', '每月工资支出')} data={walk(21, 6, 7.5, 0.08).map((v, k) => ({ label: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][k]!, value: v }))} yFormat={(v) => `${v.toFixed(1)} ZEC`} height={200} />
        </Panel>
      </Main>
      <Side>
        <Alert tone="shielded" title={t('Salaries stay private', '工资金额保持私密')}>
          {t('Shielded recipients get the amount and memo encrypted. Public recipients (TEX, t-addresses) are visible on-chain — the run shows the split before you sign.', '屏蔽地址收款人的金额和备注会加密。公开地址（TEX、t 地址）在链上可见，签名前会显示构成。')}
        </Alert>
        <Panel title={t('Recent runs', '最近发放')}>
          <Timeline items={RUNS.slice(0, 3).map((r) => ({ title: r.id, time: r.date, tone: r.status === 'confirmed' ? 'positive' as const : 'negative' as const, description: <a href={link('payroll', 'run', r.id)}>{r.recipients} {t('recipients', '位收款人')} →</a> }))} />
        </Panel>
      </Side>
    </Split>
  );
}

function NewRun() {
  const t = useT();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<PaymentRow[]>(PEOPLE.map((p) => ({ name: p.name, address: p.address, amount: p.amount, memo: p.memo || undefined })));
  const [schedule, setSchedule] = useState('now');
  const [statuses, setStatuses] = useState<Array<TxState | undefined>>([]);
  const result = useMemo(() => validatePayments(rows, { decimals: 8 }), [rows]);
  const state = (k: number): StepState => (k < step ? 'complete' : k === step ? 'active' : 'pending');

  const execute = () => {
    setStep(3);
    result.rows.forEach((_, k) => {
      setTimeout(() => setStatuses((s) => { const n = [...s]; n[k] = 'confirming'; return n; }), 600 * (k + 1));
      setTimeout(() => setStatuses((s) => { const n = [...s]; n[k] = 'confirmed'; return n; }), 600 * (k + 1) + 2400);
    });
    setTimeout(() => toast({ title: t('Payroll run completed', '工资发放完成'), description: `${result.valid} ${t('recipients', '位收款人')}`, tone: 'positive' }), 600 * result.rows.length + 2600);
  };

  return (
    <>
      <Stepper orientation="horizontal" steps={[t('Recipients', '收款人'), t('Schedule', '排期'), t('Review', '核对'), t('Execute', '执行')].map((title, k) => ({ title, state: state(k) }))} />
      <div>
        {step === 0 && (
          <Split>
            <Main>
              <BatchPaymentTable rows={rows} onChange={setRows} />
            </Main>
            <Side>
              <Button onClick={() => setRows(parsePaymentCsv(SAMPLE_CSV))}>{t('Load sample CSV', '载入示例 CSV')}</Button>
              <Alert tone="info">{t('Memos are only sent to shielded recipients; transparent rows are flagged.', '备注只会发送给屏蔽地址；透明地址行会被标记。')}</Alert>
            </Side>
          </Split>
        )}
        {step === 1 && (
          <Grid cols={2}>
            <Panel title={t('Schedule', '排期')}>
              <div className="nui-stack" style={{ gap: 20 }}>
                <Field label={t('When', '时间')}>
                  <Select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                    <option value="now">{t('Immediately', '立即')}</option>
                    <option value="monthly">{t('Monthly · last day 09:00 UTC', '每月最后一天 09:00 UTC')}</option>
                    <option value="weekly">{t('Weekly · Friday', '每周五')}</option>
                  </Select>
                </Field>
                <Switch label={t('Require approval above 10 ZEC', '超过 10 ZEC 需要审批')} checked onChange={() => undefined} />
                <Switch label={t('Issue payment receipts', '生成付款凭证')} checked onChange={() => undefined} />
              </div>
            </Panel>
            <Alert tone="info" title={t('Disclosure', '披露')}>
              {t('Recurring runs store an encrypted recipient list. You can disclose individual payments later with a viewing key.', '周期性发放会保存加密的收款人名单，之后可通过查看密钥披露单笔付款。')}
            </Alert>
          </Grid>
        )}
        {step >= 2 && (
          <>
            <BatchPayments rows={rows} statuses={statuses} />
            <div style={{ marginTop: 20 }}>
              <KeyValue
                items={[
                  { label: t('Total', '总额'), value: <Amount value={result.total} exact /> },
                  { label: t('Network fee (est.)', '预计网络费'), value: <Amount value={BigInt(result.valid) * 10000n} /> },
                  { label: t('Schedule', '排期'), value: schedule === 'now' ? t('Immediately', '立即') : schedule },
                  { label: t('Privacy', '隐私'), value: <Cluster gap={4} justify="flex-end"><PrivacyBadge level="shielded" describe={false} />{result.rows.some((r) => !r.shielded) && <PrivacyBadge level="public" describe={false} />}</Cluster> },
                ]}
              />
            </div>
          </>
        )}
      </div>
      <Cluster justify="space-between">
        <Button disabled={step === 0 || step === 3} arrow={false} onClick={() => setStep((s) => s - 1)}>{t('Back', '上一步')}</Button>
        {step < 2 && <Button variant="outline" disabled={result.valid === 0 || result.invalid > 0} onClick={() => setStep((s) => s + 1)}>{t('Continue', '继续')}</Button>}
        {step === 2 && <Button variant="solid" onClick={execute}>{t('Sign & run payroll', '签名并发放')}</Button>}
      </Cluster>
    </>
  );
}

function RunDetail({ id }: { id: string }) {
  const t = useT();
  const run = RUNS.find((r) => r.id === id);
  if (!run) return <EmptyState title={t('Run not found.', '发放记录不存在。')} action={<Button href={link('payroll', 'history')}>{t('History', '历史')}</Button>} />;
  return (
    <>
      <Panel title={run.id} actions={<TxStatus status={run.status} />}>
        <KeyValue
          items={[
            { label: t('Date', '日期'), value: run.date },
            { label: t('Recipients', '收款人'), value: run.recipients },
            { label: t('Total', '总额'), value: <Amount value={run.total} exact /> },
            { label: t('Authorization', '授权'), value: 'multisig 2/3' },
          ]}
        />
        <Cluster gap={6} style={{ marginTop: 16 }}>
          <Button variant="solid" onClick={() => undefined}>{t('Export receipts', '导出凭证')}</Button>
          <Button href={link('wallet', 'activity')}>{t('View in wallet', '在钱包中查看')}</Button>
        </Cluster>
      </Panel>
      <div>
        <BatchPayments rows={PEOPLE.map((p) => ({ name: p.name, address: p.address, amount: p.amount, memo: p.memo || undefined }))} statuses={PEOPLE.map(() => run.status)} />
      </div>
    </>
  );
}

function People() {
  const t = useT();
  return (
    <DataTable
      rows={PEOPLE}
      rowKey={(p) => p.name}
      columns={[
        { key: 'name', header: t('Name', '姓名'), cell: (p) => <strong>{p.name}</strong> },
        { key: 'role', header: t('Team', '团队'), cell: (p) => p.role },
        { key: 'address', header: t('Address', '地址'), cell: (p) => <Address address={p.address} /> },
        { key: 'amount', header: t('Monthly', '每月金额'), numeric: true, cell: (p) => `${p.amount} ZEC` },
        { key: 'privacy', header: t('Privacy', '隐私'), cell: (p) => <PrivacyBadge level={p.address.startsWith('tex') ? 'public' : 'shielded'} describe={false} /> },
      ]}
    />
  );
}

function History() {
  const t = useT();
  return (
    <DataTable
      rows={RUNS}
      rowKey={(r) => r.id}
      columns={[
        { key: 'id', header: t('Run', '批次'), cell: (r) => <a href={link('payroll', 'run', r.id)} className="nui-mono">{r.id}</a> },
        { key: 'date', header: t('Date', '日期'), cell: (r) => r.date },
        { key: 'people', header: t('Recipients', '收款人'), numeric: true, cell: (r) => r.recipients },
        { key: 'total', header: t('Total', '总额'), numeric: true, cell: (r) => <Amount value={r.total} /> },
        { key: 'status', header: t('Status', '状态'), cell: (r) => <TxStatus status={r.status} /> },
      ]}
    />
  );
}

export default function Product({ path }: ProductProps) {
  const [page, arg] = path;
  const body = page === 'new' ? <NewRun /> : page === 'run' ? <RunDetail id={arg ?? ''} /> : page === 'people' ? <People /> : page === 'history' ? <History /> : <Overview />;
  return (
    <ProductShell product="payroll" page={page === 'run' ? 'history' : (page ?? '')} crumbs={page === 'run' ? [{ label: 'History', href: link('payroll', 'history') }, { label: arg }] : undefined} title={page === 'run' ? arg : undefined}>
      {body}
    </ProductShell>
  );
}
