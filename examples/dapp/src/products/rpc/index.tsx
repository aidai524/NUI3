import { useState } from 'react';
import {
  Alert, Badge, BarChart, Button, Card, Checkbox, Cluster, CodeBlock, DataTable, Dialog, DonutChart, Field, Grid, Input, KeyValue,
  LineChart, Meter, Panel, SecretField, Stat, Stats, Switch, UptimeBar, useToast,
} from '@nui3/react';
import { rng, dayLabels, walk } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split } from '../ui';

const days = dayLabels(30);
const latency = walk(4, 48, 68, 0.15).map((v) => Math.round(v));
const requests = walk(9, 30, 1_400_000, 0.2).map((v) => Math.round(v));
const uptime = (seed: number) => {
  const r = rng(seed);
  return Array.from({ length: 45 }, (_, k) => ({ date: `d${k}`, status: (r() > 0.97 ? 'degraded' : 'operational') as 'degraded' | 'operational' }));
};

const ENDPOINTS = [
  { name: 'Zcash RPC', url: 'https://rpc.zcash.noir.example', region: 'Global', latency: 64 },
  { name: 'lightwalletd', url: 'https://lwd.noir.example:443', region: 'Global', latency: 42 },
  { name: 'Noir API', url: 'https://api.noir.example/v1', region: 'Global', latency: 38 },
  { name: 'Indexer', url: 'https://indexer.noir.example', region: 'EU / US', latency: 55 },
];

function Overview() {
  const t = useT();
  return (
    <Split>
      <Main>
        <Stats divided>
          <Stat size="sm" label={t('Requests · 30d', '请求数 · 30 天')} value="42.6" unit="M" />
          <Stat size="sm" label={t('Avg latency', '平均延迟')} value="52" unit="ms" />
          <Stat size="sm" label={t('Uptime', '可用率')} value="99.98" unit="%" />
        </Stats>
        <Panel title={t('Latency · p50 (ms)', '延迟 · p50（毫秒）')}>
          <LineChart label={t('Latency', '延迟')} series={[{ name: 'p50', data: latency, area: true }, { name: 'p95', data: latency.map((v) => v * 1.8), dashed: true }]} labels={latency.map((_, k) => `${k}:00`)} height={220} yFormat={(v) => `${v}ms`} legend />
        </Panel>
        <Panel title={t('Requests per day', '每日请求数')}>
          <BarChart label={t('Requests', '请求数')} data={requests.map((v, k) => ({ label: days[k]!, value: v }))} height={200} yFormat={(v) => `${(v / 1e6).toFixed(1)}M`} />
        </Panel>
      </Main>
      <Side>
        {ENDPOINTS.slice(0, 3).map((e, k) => (
          <Panel key={e.name} title={e.name} actions={<Badge tone="positive" dot>{t('Operational', '正常')}</Badge>}>
            <code className="nui-mono" style={{ fontSize: 12 }}>{e.url}</code>
            <div style={{ marginTop: 12 }}><UptimeBar label={t('45 days', '45 天')} days={uptime(k + 3)} /></div>
          </Panel>
        ))}
      </Side>
    </Split>
  );
}

function Keys() {
  const t = useT();
  const { toast } = useToast();
  const [create, setCreate] = useState(false);
  const [name, setName] = useState('');
  const [keys, setKeys] = useState([{ id: 'k1', name: 'NoirWallet production', key: 'nui_live_9f2c41d0e7a86b35c1d94e0f2a7b6c8d', scopes: 'read', created: '2026-08-12', last: '2 min ago' }]);
  return (
    <>
      <Cluster justify="space-between">
        <p className="nui-text-secondary" style={{ maxWidth: '60ch' }}>{t('Keys authenticate API and lightwalletd access. Keep them server-side; rotate them quarterly.', '密钥用于 API 和 lightwalletd 访问鉴权。请保存在服务端，并每季度轮换。')}</p>
        <Button variant="solid" onClick={() => setCreate(true)}>{t('Create key', '创建密钥')}</Button>
      </Cluster>
      <Grid cols={2}>
        {keys.map((k) => (
          <Panel key={k.id} title={k.name} actions={<Badge>{k.scopes}</Badge>}>
            <SecretField value={k.key} label={k.name} />
            <div style={{ marginTop: 16 }}>
              <KeyValue items={[{ label: t('Created', '创建时间'), value: k.created }, { label: t('Last used', '最近使用'), value: k.last }]} />
            </div>
            <Cluster gap={6} style={{ marginTop: 16 }}>
              <Button size="sm" onClick={() => toast({ title: t('Key rotated', '密钥已轮换'), tone: 'positive' })}>{t('Rotate', '轮换')}</Button>
              <Button size="sm" variant="danger" onClick={() => setKeys((list) => list.filter((x) => x.id !== k.id))}>{t('Revoke', '吊销')}</Button>
            </Cluster>
          </Panel>
        ))}
      </Grid>
      <Dialog open={create} onClose={() => setCreate(false)} title={t('Create API key', '创建 API 密钥')} footer={<><Button onClick={() => setCreate(false)} arrow={false}>{t('Cancel', '取消')}</Button><Button variant="solid" disabled={!name} onClick={() => { setKeys((l) => [...l, { id: `k${l.length + 1}`, name, key: `nui_live_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`, scopes: 'read', created: '2026-10-26', last: '—' }]); setCreate(false); setName(''); toast({ title: t('Key created', '密钥已创建'), tone: 'positive' }); }}>{t('Create', '创建')}</Button></>}>
        <div className="nui-stack" style={{ gap: 16 }}>
          <Field label={t('Name', '名称')}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-service" /></Field>
          <Checkbox label={t('Read chain data', '读取链上数据')} defaultChecked />
          <Checkbox label={t('Submit transactions', '提交交易')} />
        </div>
      </Dialog>
    </>
  );
}

function Usage() {
  const t = useT();
  return (
    <Split>
      <Main>
        <Panel title={t('Quota · October', '配额 · 十月')}>
          <div className="nui-stack" style={{ gap: 20 }}>
            <Meter label={t('Requests', '请求数')} value={42.6} max={100} valueLabel="42.6M / 100M" />
            <Meter label={t('Compact block bandwidth', 'Compact Block 带宽')} value={820} max={1000} valueLabel="820 / 1000 GB" tone="warning" />
            <Meter label={t('API keys', '密钥数量')} value={1} max={5} valueLabel="1 / 5" />
          </div>
        </Panel>
        <Panel title={t('Errors by method', '按方法的错误')}>
          <DataTable
            rows={[
              { m: 'getcompactblocks', err: 0.12, p95: 180 },
              { m: 'sendrawtransaction', err: 0.42, p95: 240 },
              { m: 'noir.getStateRoot', err: 0.03, p95: 60 },
              { m: 'z_getbalance', err: 0.08, p95: 96 },
            ]}
            rowKey={(r) => r.m}
            columns={[
              { key: 'm', header: t('Method', '方法'), cell: (r) => <code className="nui-mono">{r.m}</code> },
              { key: 'err', header: t('Error rate', '错误率'), numeric: true, cell: (r) => `${r.err}%` },
              { key: 'p95', header: 'p95', numeric: true, cell: (r) => `${r.p95}ms` },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={t('Requests by method', '请求构成')}>
          <DonutChart label={t('Methods', '方法')} data={[{ label: 'getcompactblocks', value: 52 }, { label: 'z_getbalance', value: 22 }, { label: 'noir.getStateRoot', value: 16 }, { label: 'other', value: 10 }]} />
        </Panel>
        <Button href={link('rpc', 'plans')}>{t('Upgrade plan', '升级套餐')}</Button>
      </Side>
    </Split>
  );
}

function DocsPage() {
  const t = useT();
  return (
    <Grid cols={2} style={{ alignItems: 'start' }}>
      <Panel title={t('Latest block · lightwalletd', '最新区块 · lightwalletd')}>
        <CodeBlock
          snippets={[
            { label: 'curl', code: `curl https://lwd.noir.example:443/v1/blocks/latest \\\n  -H "x-api-key: $NOIR_KEY"` },
            { label: 'JS', code: `const res = await fetch('https://lwd.noir.example/v1/blocks/latest', {\n  headers: { 'x-api-key': process.env.NOIR_KEY }\n});\nconst { height } = await res.json();` },
            { label: 'Python', code: `import os, requests\nr = requests.get(\n  'https://lwd.noir.example/v1/blocks/latest',\n  headers={'x-api-key': os.environ['NOIR_KEY']}\n)\nprint(r.json()['height'])` },
          ]}
        />
      </Panel>
      <Panel title={t('Noir state root', 'Noir 状态根')}>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://api.noir.example/v1 \\\n  -H "content-type: application/json" \\\n  -H "x-api-key: $NOIR_KEY" \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"noir_getStateRoot","params":[1042]}'`}
        />
        <p className="nui-text-secondary nui-text-small" style={{ marginTop: 16 }}>
          {t('Verify the returned root against the anchor transaction on Zcash (see Explorer → Anchors).', '将返回的状态根与 Zcash 上的锚定交易核对（见浏览器 → 锚定）。')}
        </p>
        <Button href={link('explorer', 'anchors')}>{t('View anchors', '查看锚定')}</Button>
      </Panel>
      <Panel title={t('Send a shielded transaction', '发送屏蔽交易')}>
        <CodeBlock language="bash" code={`# Build with your wallet SDK, then broadcast\nzcash-cli sendrawtransaction "$RAW_TX"\n\n# Memo fields are encrypted; never log plaintext memos.`} />
      </Panel>
      <Alert tone="warning" title={t('Do not expose keys in the browser', '不要在浏览器暴露密钥')}>
        {t('Browser apps should call your own backend, or use the public rate-limited endpoint. Private keys and viewing keys never belong in frontend code.', '浏览器应用应调用你自己的后端，或使用公开限流端点。私钥和查看密钥绝不能出现在前端代码里。')}
      </Alert>
    </Grid>
  );
}

function Plans() {
  const t = useT();
  const plans = [
    { name: 'Free', price: 0, req: '1M / mo', keys: 1, support: 'Community', current: false },
    { name: 'Builder', price: 49, req: '100M / mo', keys: 5, support: 'Email', current: true },
    { name: 'Scale', price: 399, req: '2B / mo', keys: 25, support: 'Dedicated', current: false },
  ];
  return (
    <Grid cols={3}>
      {plans.map((p) => (
        <Card key={p.name}>
          <Cluster justify="space-between">
            <h3 className="nui-card__title">{p.name}</h3>
            {p.current && <Badge tone="accent">{t('Current', '当前')}</Badge>}
          </Cluster>
          <Stat size="sm" label={t('per month', '每月')} value={`$${p.price}`} />
          <div style={{ marginTop: 16 }}>
            <KeyValue items={[{ label: t('Requests', '请求数'), value: p.req }, { label: 'API keys', value: p.keys }, { label: t('Support', '支持'), value: p.support }, { label: 'SLA', value: p.price ? '99.9%' : '—' }]} />
          </div>
          <Button variant={p.current ? 'outline' : 'solid'} block style={{ marginTop: 20 }}>{p.current ? t('Manage', '管理') : t('Choose', '选择')}</Button>
        </Card>
      ))}
    </Grid>
  );
}

export default function Product({ path }: ProductProps) {
  const [page] = path;
  const body = page === 'keys' ? <Keys /> : page === 'usage' ? <Usage /> : page === 'docs' ? <DocsPage /> : page === 'plans' ? <Plans /> : <Overview />;
  return <ProductShell product="rpc" page={page ?? ''}>{body}</ProductShell>;
}
