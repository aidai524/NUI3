import { useState } from 'react';
import {
  Alert, Amount, Badge, BondingCurve, Button, Card, ChipGroup, Cluster, Countdown, Disclosure, DonutChart, EmptyState, Field, Grid, Input,
  KeyValue, LineChart, Meter, Panel, Slider, Stat, Stats, Stepper, Timeline, TokenAmountInput, TokenIcon, useToast, type StepState,
} from '@nui3/react';
import { TOKENS, dayLabels, walk } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd, usd } from '../ui';

const days = dayLabels(30);

interface Project {
  id: string;
  name: string;
  symbol: string;
  status: 'live' | 'upcoming' | 'ended';
  raised: number;
  softCap: number;
  hardCap: number;
  price0: number;
  slope: number;
  maxSupply: number;
  sold: number;
  endsInDays: number;
  audit: string;
}

const PROJECTS: Project[] = [
  { id: 'bean', name: 'Shielded Coffee', symbol: 'BEAN', status: 'live', raised: 62000, softCap: 50000, hardCap: 150000, price0: 0.02, slope: 0.000004, maxSupply: 1_000_000, sold: 420000, endsInDays: 4, audit: 'Reviewed' },
  { id: 'noir', name: 'Noir Points', symbol: 'NOIR', status: 'upcoming', raised: 0, softCap: 100000, hardCap: 400000, price0: 0.05, slope: 0.000002, maxSupply: 5_000_000, sold: 0, endsInDays: 9, audit: 'Audited' },
  { id: 'privpay', name: 'PrivPay', symbol: 'PAY', status: 'ended', raised: 240000, softCap: 80000, hardCap: 250000, price0: 0.01, slope: 0.000006, maxSupply: 2_000_000, sold: 1_800_000, endsInDays: -3, audit: 'Reviewed' },
];

const priceAt = (p: Project, supply: number) => p.price0 + p.slope * supply;

function Projects() {
  const t = useT();
  const [tab, setTab] = useState('live');
  const rows = PROJECTS.filter((p) => p.status === tab);
  return (
    <>
      <ChipGroup aria-label={t('Status', '状态')} value={tab} onChange={setTab} options={[{ value: 'live', label: t('Live', '进行中') }, { value: 'upcoming', label: t('Upcoming', '即将开始') }, { value: 'ended', label: t('Ended', '已结束') }]} />
      <Grid cols={2} style={{ marginTop: 20 }}>
        {rows.map((p) => (
          <Card key={p.id} interactive>
            <Cluster justify="space-between">
              <span className="nui-cluster" style={{ gap: 10 }}><TokenIcon symbol={p.symbol} size="lg" /><span><strong style={{ fontSize: 18 }}>{p.name}</strong><span className="nui-text-muted" style={{ marginLeft: 8 }}>{p.symbol}</span></span></span>
              <Badge tone={p.status === 'live' ? 'positive' : 'neutral'} dot>{p.status === 'live' ? t('Live', '进行中') : p.status === 'upcoming' ? t('Soon', '即将') : t('Ended', '已结束')}</Badge>
            </Cluster>
            <div style={{ margin: '16px 0' }}>
              <Meter label={t('Raised', '已募集')} value={p.raised} max={p.hardCap} valueLabel={`${compactUsd(p.raised)} / ${compactUsd(p.hardCap)}`} marks={[{ value: p.softCap, label: t('Soft cap', '软顶') }]} />
            </div>
            <KeyValue
              items={[
                { label: t('Current price', '当前价格'), value: `${priceAt(p, p.sold).toFixed(4)} USDC` },
                { label: t('Audit', '审计'), value: p.audit },
                { label: t('Ends', '结束'), value: <Countdown to={Date.now() + p.endsInDays * 86400000} /> },
              ]}
            />
            <Button variant={p.status === 'live' ? 'solid' : 'ghost'} block style={{ marginTop: 16 }} href={link('launchpad', 'project', p.id)}>{p.status === 'live' ? t('Participate', '参与') : t('View project', '查看项目')}</Button>
          </Card>
        ))}
      </Grid>
    </>
  );
}

function ProjectDetail({ project: p }: { project: Project }) {
  const t = useT();
  const { toast } = useToast();
  const [amount, setAmount] = useState('500');
  const tokensOut = (Number(amount) || 0) / priceAt(p, p.sold);
  return (
    <Split>
      <Main>
        <Stats divided>
          <Stat size="sm" label={t('Raised', '已募集')} value={compactUsd(p.raised)} />
          <Stat size="sm" label={t('Price now', '当前价格')} value={`${priceAt(p, p.sold).toFixed(4)}`} unit="USDC" />
          <Stat size="sm" label={t('Participants', '参与人数')} value="1,240" />
        </Stats>
        <Panel title={t('Bonding curve', '联合曲线')} actions={<Badge>{t('Price rises with supply sold', '价格随售出量上升')}</Badge>}>
          <BondingCurve label={t('Bonding curve', '联合曲线')} price={(s) => priceAt(p, s)} maxSupply={p.maxSupply} sold={p.sold} priceFormat={(v) => `${v.toFixed(4)}`} supplyFormat={(v) => `${(v / 1000).toFixed(0)}K`} nowLabel={t('Now', '当前')} />
        </Panel>
        <Panel title={t('Tokenomics', '代币经济')}>
          <DonutChart label={t('Tokenomics', '代币经济')} data={[{ label: t('Public sale', '公开发售'), value: 45 }, { label: t('DEX liquidity', 'DEX 流动性'), value: 25 }, { label: t('Community', '社区'), value: 20 }, { label: t('Team (vested)', '团队（锁定）'), value: 10 }]} />
        </Panel>
        <Panel title={t('Vesting & liquidity', '释放与流动性')}>
          <LineChart label={t('Vesting', '释放')} height={200} curve="step" series={[{ name: t('Circulating', '流通量'), data: [45, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100], area: true }]} labels={['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11']} yFormat={(v) => `${v.toFixed(0)}%`} />
        </Panel>
        <Disclosure summary={t('What happens after the sale', '发售结束后')}>
          {t('25% of raised funds and the reserved tokens seed a DEX pool automatically. Team tokens vest linearly over 12 months. The sale contract is not a guarantee of returns.', '募集资金的 25% 与预留代币会自动注入 DEX 池。团队代币 12 个月线性释放。发售合约不代表收益保证。')}
        </Disclosure>
      </Main>
      <Side>
        <Panel title={t('Contribute', '参与认购')} actions={<Countdown to={Date.now() + p.endsInDays * 86400000} />}>
          <TokenAmountInput label={t('You contribute', '投入')} value={amount} onChange={setAmount} token={TOKENS[2]} onMax={setAmount} fiat={usd(Number(amount) || 0)} />
          <div style={{ marginTop: 16 }}>
            <KeyValue
              items={[
                { label: t('You receive (est.)', '预计获得'), value: `${tokensOut.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${p.symbol}` },
                { label: t('Price after your buy', '买入后价格'), value: `${priceAt(p, p.sold + tokensOut).toFixed(4)} USDC` },
                { label: t('Claimable at', '可领取时间'), value: t('After sale ends', '发售结束后') },
              ]}
            />
          </div>
          <Button variant="solid" block style={{ marginTop: 16 }} disabled={!amount || p.status !== 'live'} onClick={() => toast({ title: t('Contribution submitted', '认购已提交'), description: `${amount} USDC → ${p.symbol}`, tone: 'positive' })}>{t('Contribute', '认购')}</Button>
        </Panel>
        <Panel title={t('Project info', '项目信息')}>
          <KeyValue items={[{ label: t('Audit', '审计'), value: p.audit }, { label: t('Soft / hard cap', '软顶 / 硬顶'), value: `${compactUsd(p.softCap)} / ${compactUsd(p.hardCap)}` }, { label: t('Sale contract', '发售合约'), value: <span className="nui-mono">launch.noir</span> }]} />
        </Panel>
        <Alert tone="warning" title={t('High risk', '高风险')}>
          {t('New tokens can go to zero. If the soft cap is not reached, contributions are refundable. Do your own research.', '新代币可能归零。若未达到软顶，认购可退款。请自行研究。')}
        </Alert>
      </Side>
    </Split>
  );
}

function CreateLaunch() {
  const t = useT();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [symbol, setSymbol] = useState('BEAN');
  const [price0, setPrice0] = useState(0.02);
  const [slope, setSlope] = useState(4);
  const [hardCap, setHardCap] = useState(150000);
  const state = (k: number): StepState => (k < step ? 'complete' : k === step ? 'active' : 'pending');
  const preview: Project = { id: 'preview', name: symbol, symbol, status: 'live', raised: 0, softCap: hardCap / 3, hardCap, price0, slope: slope / 1_000_000, maxSupply: 1_000_000, sold: 200000, endsInDays: 7, audit: '—' };
  return (
    <>
      <Stepper orientation="horizontal" steps={[t('Token', '代币'), t('Curve', '曲线'), t('Review', '核对')].map((title, k) => ({ title, state: state(k) }))} />
      <Split gap={24}>
        <Main>
          <div style={{ marginTop: 24 }} className="nui-stack">
            {step === 0 && (
              <>
                <Field label={t('Token symbol', '代币符号')} hint={t('Deploy a token first, or pick one you own.', '先部署代币，或选择你持有的代币。')}><Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></Field>
                <Field label={t('Hard cap (USDC)', '硬顶（USDC）')}><Input inputMode="numeric" value={hardCap} onChange={(e) => setHardCap(Number(e.target.value.replace(/[^\d]/g, '')))} /></Field>
                <Button href={link('deploy')}>{t('Create a token first', '先创建代币')}</Button>
              </>
            )}
            {step === 1 && (
              <>
                <Slider label={t('Starting price (USDC)', '起始价格（USDC）')} value={price0} onChange={setPrice0} min={0.005} max={0.2} step={0.005} format={(v) => v.toFixed(3)} />
                <div style={{ marginTop: 16 }}>
                  <Slider label={t('Curve steepness', '曲线斜率')} value={slope} onChange={setSlope} min={1} max={20} format={(v) => `${v}`} />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <KeyValue items={[{ label: t('Token', '代币'), value: symbol }, { label: t('Hard cap', '硬顶'), value: compactUsd(hardCap) }, { label: t('Starting price', '起始价'), value: `${price0} USDC` }, { label: t('Final price at cap', '满额价格'), value: `${priceAt(preview, preview.maxSupply).toFixed(4)} USDC` }]} />
                <div style={{ marginTop: 16 }}><Alert tone="warning" title={t('Launch risk', '发售风险')}>{t('You are responsible for disclosures in your jurisdiction. Liquidity seeded at the end cannot be withdrawn for 30 days.', '你需要自行承担所在法域的披露义务。结束时注入的流动性 30 天内不可提取。')}</Alert></div>
              </>
            )}
          </div>
          <Cluster justify="space-between" style={{ marginTop: 24 }}>
            <Button disabled={step === 0} arrow={false} onClick={() => setStep((s) => s - 1)}>{t('Back', '上一步')}</Button>
            {step < 2 ? <Button variant="outline" onClick={() => setStep((s) => s + 1)}>{t('Continue', '继续')}</Button> : <Button variant="solid" onClick={() => toast({ title: t('Launch created', '发售已创建'), description: symbol, tone: 'positive' })}>{t('Launch sale', '发起发售')}</Button>}
          </Cluster>
        </Main>
        <Side>
          <div style={{ marginTop: 24 }}>
            <Panel title={t('Curve preview', '曲线预览')}>
              <BondingCurve label={t('Preview', '预览')} price={(s) => priceAt(preview, s)} maxSupply={preview.maxSupply} sold={preview.sold} priceFormat={(v) => v.toFixed(4)} supplyFormat={(v) => `${(v / 1000).toFixed(0)}K`} nowLabel={t('Example', '示例')} />
            </Panel>
          </div>
        </Side>
      </Split>
    </>
  );
}

function Mine() {
  const t = useT();
  const { toast } = useToast();
  return (
    <Grid cols={2}>
      {PROJECTS.filter((p) => p.status !== 'upcoming').map((p) => (
        <Card key={p.id}>
          <Cluster justify="space-between"><strong>{p.name}</strong><Badge tone={p.status === 'ended' ? 'positive' : 'info'}>{p.status === 'ended' ? t('Claimable', '可领取') : t('Locked', '锁定中')}</Badge></Cluster>
          <KeyValue
            items={[
              { label: t('Contributed', '投入'), value: usd(p.status === 'live' ? 500 : 2000) },
              { label: t('Tokens', '代币'), value: <Amount value={BigInt(p.status === 'live' ? 20000 : 180000) * 1000000n} decimals={6} symbol={p.symbol} /> },
              { label: t('Status', '状态'), value: p.status === 'ended' ? t('Sale settled', '已结算') : t('Until sale ends', '发售结束后可领') },
            ]}
          />
          <Cluster gap={6} style={{ marginTop: 16 }}>
            <Button variant="solid" disabled={p.status !== 'ended'} onClick={() => toast({ title: t('Tokens claimed', '代币已领取'), description: p.symbol, tone: 'positive' })}>{t('Claim', '领取')}</Button>
            <Button href={link('launchpad', 'project', p.id)}>{t('View', '查看')}</Button>
          </Cluster>
        </Card>
      ))}
    </Grid>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const project = PROJECTS.find((p) => p.id === arg);
  const body = page === 'create' ? <CreateLaunch /> : page === 'mine' ? <Mine /> : page === 'project' ? (project ? <ProjectDetail project={project} /> : <EmptyState title={t('Project not found.', '项目不存在。')} />) : <Projects />;
  return (
    <ProductShell product="launchpad" page={page === 'project' ? '' : (page ?? '')} title={page === 'project' && project ? project.name : undefined} crumbs={page === 'project' ? [{ label: t('Projects', '项目'), href: link('launchpad') }, { label: arg }] : undefined}>
      {body}
    </ProductShell>
  );
}
