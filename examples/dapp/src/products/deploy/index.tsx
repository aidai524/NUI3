import { useMemo, useState } from 'react';
import {
  Alert, Badge, Button, Card, Checkbox, Cluster, CodeBlock, DataTable, Dialog, DonutChart, EmptyState, Field, Grid, Input, InputGroup,
  KeyValue, LineChart, Panel, Slider, Sparkline, Stat, Stats, Stepper, Switch, TokenIcon, formatAmount, tryParseUnits, useToast,
  type StepState,
} from '@nui3/react';
import { dayLabels, walk } from '../../data';
import { useTxProgress } from '../../sim';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split } from '../ui';

const days = dayLabels(30);

const MY_TOKENS = [
  { symbol: 'BEAN', name: 'Shielded Coffee', supply: 1_000_000, holders: 1240, template: 'TKN', mintable: false, seed: 3 },
  { symbol: 'NOIR', name: 'Noir Points', supply: 100_000_000, holders: 24800, template: 'TKNX', mintable: true, seed: 9 },
];

function Create() {
  const t = useT();
  const { toast } = useToast();
  const progress = useTxProgress(3, 3000, 0);
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<'tkn' | 'tknx'>('tkn');
  const [name, setName] = useState('Shielded Coffee');
  const [symbol, setSymbol] = useState('BEAN');
  const [supply, setSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('6');
  const [mintable, setMintable] = useState(false);
  const [fee, setFee] = useState('0');
  const [burn, setBurn] = useState(false);
  const [alloc, setAlloc] = useState([60, 25, 15]);
  const [ack, setAck] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const symbolError = symbol && !/^[A-Z0-9]{2,10}$/.test(symbol) ? t('2–10 characters, A–Z and 0–9', '2–10 位，仅限 A–Z 和 0–9') : undefined;
  const units = tryParseUnits(supply || '0', Number(decimals) || 0);
  const state = (k: number): StepState => (k < step ? 'complete' : k === step ? 'active' : 'pending');
  const total = alloc.reduce((s, x) => s + x, 0);
  const config = JSON.stringify({ name, symbol, decimals: Number(decimals), supply: Number(supply), template: template.toUpperCase(), mintable, transferFeeBps: Number(fee) * 100, deflationary: burn, allocations: { community: alloc[0], liquidity: alloc[1], team: alloc[2] } }, null, 2);

  const setAllocAt = (k: number, v: number) => setAlloc((a) => a.map((x, j) => (j === k ? v : x)));
  const canNext = step === 0 ? true : step === 1 ? Boolean(name && symbol && !symbolError) : step === 2 ? Boolean(units && units > 0n && total === 100) : true;

  return (
    <>
      <Stepper orientation="horizontal" steps={[t('Template', '模板'), t('Details', '信息'), t('Supply', '分配'), t('Features', '功能'), t('Review', '核对')].map((title, k) => ({ title, state: state(k) }))} />
      <Split gap={24}>
        <Main>
          <div style={{ marginTop: 24 }}>
            {step === 0 && (
              <Grid cols={2}>
                {(['tkn', 'tknx'] as const).map((tp) => (
                  <Card key={tp} interactive>
                    <Cluster justify="space-between"><h3 className="nui-card__title">{tp.toUpperCase()}</h3>{template === tp && <Badge tone="accent">{t('Selected', '已选')}</Badge>}</Cluster>
                    <p className="nui-card__desc">{tp === 'tkn' ? t('Standard token: fixed or mintable supply, no transfer logic. Cheapest to deploy.', '标准代币：固定或可增发供应，无转账逻辑，部署成本最低。') : t('Extended token: transfer fees, deflationary burns and max-wallet rules.', '扩展代币：转账手续费、通缩销毁和单地址持仓上限。')}</p>
                    <Button onClick={() => setTemplate(tp)}>{t('Use template', '使用模板')}</Button>
                  </Card>
                ))}
              </Grid>
            )}
            {step === 1 && (
              <div className="nui-stack" style={{ gap: 20 }}>
                <Field label={t('Name', '名称')}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label={t('Symbol', '符号')} error={symbolError}><Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></Field>
                <Grid cols={2} style={{ gap: 16 }}>
                  <Field label={t('Total supply', '总供应量')}><InputGroup inputMode="numeric" end={symbol} value={supply} onChange={(e) => setSupply(e.target.value.replace(/[^\d]/g, ''))} /></Field>
                  <Field label={t('Decimals', '小数位')}><InputGroup inputMode="numeric" value={decimals} onChange={(e) => setDecimals(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} /></Field>
                </Grid>
              </div>
            )}
            {step === 2 && (
              <>
                {['Community', 'Liquidity', 'Team'].map((label, k) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <Slider label={label} value={alloc[k]!} onChange={(v) => setAllocAt(k, v)} min={0} max={100} marks={[0, 25, 50, 75, 100]} format={(v) => `${v}%`} />
                  </div>
                ))}
                {total !== 100 && <Alert tone="negative">{t('Allocations must add up to 100%.', '分配合计必须为 100%。')} ({total}%)</Alert>}
              </>
            )}
            {step === 3 && (
              <div className="nui-stack" style={{ gap: 20 }}>
                <Switch label={t('Owner can mint more later', '所有者之后可增发')} checked={mintable} onChange={setMintable} />
                {template === 'tknx' && (
                  <>
                    <Field label={t('Transfer fee', '转账手续费')} hint={t('Charged on every transfer to the treasury.', '每笔转账收取，进入国库。')}><InputGroup end="%" value={fee} onChange={(e) => setFee(e.target.value)} /></Field>
                    <Switch label={t('Deflationary burn on transfer', '转账时通缩销毁')} checked={burn} onChange={setBurn} />
                  </>
                )}
              </div>
            )}
            {step === 4 && (
              <>
                <KeyValue
                  items={[
                    { label: t('Token', '代币'), value: `${name} · ${symbol}` },
                    { label: t('Template', '模板'), value: template.toUpperCase() },
                    { label: t('Supply', '供应量'), value: `${formatAmount(units ?? 0n, { decimals: Number(decimals) || 0 })} ${symbol}` },
                    { label: t('Mintable', '可增发'), value: mintable ? t('Yes', '是') : t('No — fixed supply', '否 · 固定供应') },
                    { label: t('Deploy fee', '部署费'), value: '5 USDC' },
                  ]}
                />
                <div style={{ marginTop: 16 }}><CodeBlock language="json" code={config} /></div>
                <div style={{ marginTop: 16 }}>
                  <Alert tone="warning" title={t('Parameters are permanent', '参数不可更改')}>
                    {t('Name, symbol and decimals cannot change after deploy. Token contracts are not reviewed by Noir.', '名称、符号和小数位部署后不可更改。代币合约未经 Noir 审核。')}
                  </Alert>
                </div>
                <div style={{ marginTop: 16 }}><Checkbox label={t('I have checked the parameters above.', '我已核对以上参数。')} checked={ack} onChange={(e) => setAck(e.target.checked)} /></div>
              </>
            )}
            {deploying && (
              <div style={{ marginTop: 24 }}>
                <Stepper steps={[{ title: t('Sign deployment', '签名部署'), state: 'complete' }, { title: t('Confirm on Noir', 'Noir 确认'), state: progress.status === 'confirmed' ? 'complete' : 'active', description: `${progress.confirmations}/${progress.required}` }, { title: t('Token live', '代币已上线'), state: progress.status === 'confirmed' ? 'complete' : 'pending' }]} />
              </div>
            )}
          </div>
          <Cluster justify="space-between" style={{ marginTop: 28 }}>
            <Button disabled={step === 0 || deploying} arrow={false} onClick={() => setStep((s) => s - 1)}>{t('Back', '上一步')}</Button>
            {step < 4 ? (
              <Button variant="outline" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>{t('Continue', '继续')}</Button>
            ) : (
              <Button variant="solid" disabled={!ack || deploying} onClick={() => { setDeploying(true); progress.restart(); toast({ title: t('Deploying token', '正在部署代币'), description: symbol }); }}>{t('Deploy token', '部署代币')}</Button>
            )}
          </Cluster>
        </Main>
        <Side>
          <div style={{ marginTop: 24 }}>
            <Panel title={t('Preview', '预览')} sunken>
              <Cluster gap={4}>
                <TokenIcon symbol={symbol || '?'} size="lg" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{name || 'Untitled'}</div>
                  <div className="nui-text-muted nui-text-small">{symbol || '—'} · {template.toUpperCase()}</div>
                </div>
              </Cluster>
              <div style={{ marginTop: 20 }}>
                <DonutChart label={t('Distribution', '分配')} data={[{ label: 'Community', value: alloc[0]! }, { label: 'Liquidity', value: alloc[1]! }, { label: 'Team', value: alloc[2]! }]} center={<strong>{total}%</strong>} size={140} />
              </div>
            </Panel>
          </div>
        </Side>
      </Split>
    </>
  );
}

function MyTokens() {
  const t = useT();
  return (
    <DataTable
      rows={MY_TOKENS}
      rowKey={(x) => x.symbol}
      columns={[
        { key: 'token', header: t('Token', '代币'), cell: (x) => <a href={link('deploy', 'token', x.symbol)} className="nui-cluster" style={{ gap: 10, color: 'inherit', textDecoration: 'none' }}><TokenIcon symbol={x.symbol} size="sm" /><strong>{x.symbol}</strong><span className="nui-text-muted">{x.name}</span></a> },
        { key: 'template', header: t('Template', '模板'), cell: (x) => <Badge>{x.template}</Badge> },
        { key: 'supply', header: t('Supply', '供应量'), numeric: true, cell: (x) => x.supply.toLocaleString('en-US') },
        { key: 'holders', header: t('Holders', '持有者'), numeric: true, cell: (x) => x.holders.toLocaleString('en-US') },
        { key: 'mintable', header: t('Mintable', '可增发'), cell: (x) => (x.mintable ? t('Yes', '是') : '—') },
        { key: 'trend', header: '30d', cell: (x) => <Sparkline data={walk(x.seed, 30, 100, 0.05, 0.003)} /> },
      ]}
    />
  );
}

function Manage({ symbol }: { symbol: string }) {
  const t = useT();
  const { toast } = useToast();
  const token = MY_TOKENS.find((x) => x.symbol === symbol);
  const [dialog, setDialog] = useState<'mint' | 'renounce' | null>(null);
  const [amount, setAmount] = useState('');
  if (!token) return <EmptyState title={t('Token not found.', '代币不存在。')} />;
  return (
    <Split>
      <Main>
        <Panel title={t('Circulating supply', '流通供应量')}>
          <LineChart label={t('Supply', '供应量')} series={[{ name: token.symbol, data: walk(token.seed, 30, token.supply * 0.8, 0.01, 0.003), area: true }]} labels={days} height={220} yFormat={(v) => `${(v / 1000).toFixed(0)}K`} />
        </Panel>
        <Panel title={t('Top holders', '主要持有者')} flush>
          <DataTable
            rows={[{ a: 'u1…9f2c', share: 18.2 }, { a: 'u1…41ab', share: 9.4 }, { a: 'zs1…77de', share: 6.1 }]}
            rowKey={(r) => r.a}
            columns={[{ key: 'a', header: t('Address', '地址'), cell: (r) => <span className="nui-mono">{r.a}</span> }, { key: 's', header: t('Share', '占比'), numeric: true, cell: (r) => `${r.share}%` }]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Owner actions', '所有者操作')}>
          <div className="nui-stack" style={{ gap: 12 }}>
            <Button variant="outline" disabled={!token.mintable} onClick={() => setDialog('mint')}>{t('Mint more', '增发')}</Button>
            <Button variant="outline" onClick={() => toast({ title: t('Burn submitted', '销毁已提交'), tone: 'positive' })}>{t('Burn', '销毁')}</Button>
            <Button variant="outline" onClick={() => toast({ title: t('Ownership transfer started', '所有权转移已开始') })}>{t('Transfer ownership', '转移所有权')}</Button>
            <Button variant="danger" onClick={() => setDialog('renounce')}>{t('Renounce ownership', '放弃所有权')}</Button>
          </div>
          <Button style={{ marginTop: 16 }} href={link('dex', 'add')}>{t('Create DEX pool', '创建 DEX 池')}</Button>
          <Button href={link('launchpad', 'create')}>{t('Launch a sale', '发起发售')}</Button>
        </Panel>
      </Side>
      <Dialog open={dialog === 'mint'} onClose={() => setDialog(null)} title={t('Mint tokens', '增发代币')} footer={<Button variant="solid" disabled={!amount} onClick={() => { setDialog(null); toast({ title: t('Minted', '已增发'), description: `${amount} ${token.symbol}`, tone: 'positive' }); }}>{t('Mint', '增发')}</Button>}>
        <Field label={t('Amount', '数量')}><Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} /></Field>
      </Dialog>
      <Dialog open={dialog === 'renounce'} onClose={() => setDialog(null)} title={t('Renounce ownership?', '放弃所有权？')} footer={<><Button onClick={() => setDialog(null)} arrow={false}>{t('Cancel', '取消')}</Button><Button variant="danger" onClick={() => { setDialog(null); toast({ title: t('Ownership renounced', '已放弃所有权'), tone: 'positive' }); }}>{t('Renounce', '确认放弃')}</Button></>}>
        <Alert tone="negative" title={t('Irreversible', '不可撤销')}>{t('You will permanently lose the ability to mint, burn or change parameters.', '你将永久失去增发、销毁和修改参数的能力。')}</Alert>
      </Dialog>
    </Split>
  );
}

function Templates() {
  const t = useT();
  const rows = [
    { f: t('Fixed supply', '固定供应'), tkn: true, tknx: true },
    { f: t('Mintable supply', '可增发'), tkn: true, tknx: true },
    { f: t('Transfer fee', '转账手续费'), tkn: false, tknx: true },
    { f: t('Deflationary burn', '通缩销毁'), tkn: false, tknx: true },
    { f: t('Max wallet rule', '单地址持仓上限'), tkn: false, tknx: true },
    { f: t('Deploy cost', '部署成本'), tkn: '5 USDC', tknx: '12 USDC' },
  ];
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.f}
      columns={[
        { key: 'f', header: t('Feature', '功能'), cell: (r) => r.f },
        { key: 'tkn', header: 'TKN', cell: (r) => (typeof r.tkn === 'boolean' ? (r.tkn ? '✓' : '—') : r.tkn) },
        { key: 'tknx', header: 'TKNX', cell: (r) => (typeof r.tknx === 'boolean' ? (r.tknx ? '✓' : '—') : r.tknx) },
      ]}
    />
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const body = page === 'tokens' ? <MyTokens /> : page === 'token' ? <Manage symbol={arg ?? ''} /> : page === 'templates' ? <Templates /> : <Create />;
  return (
    <ProductShell product="deploy" page={page === 'token' ? 'tokens' : (page ?? '')} title={page === 'token' ? arg : undefined} crumbs={page === 'token' ? [{ label: t('My tokens', '我的代币'), href: link('deploy', 'tokens') }, { label: arg }] : undefined} lead={!page ? t('Issue a TKN or TKNX token and list it on the DEX in one flow.', '发行 TKN 或 TKNX 代币，并在同一流程中接入 DEX。') : undefined}>
      {body}
    </ProductShell>
  );
}
