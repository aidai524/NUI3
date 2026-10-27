import { useState } from 'react';
import {
  Alert, Amount, Badge, Button, Card, ChipGroup, Cluster, DataTable, Dialog, Drawer, EmptyState, Field, FileDrop, Grid, Identicon, Input,
  KeyValue, LineChart, NFTCard, Pagination, Panel, SearchInput, Slider, Sparkline, Stat, Stats, Timeline, TokenAmountInput, useToast,
} from '@nui3/react';
import { TOKENS, dayLabels, rng, walk } from '../../data';
import { useT } from '../../settings';
import { link } from '../meta';
import { ProductShell } from '../Shell';
import type { ProductProps } from '../registry';
import { Main, Side, Split, compactUsd } from '../ui';

const days = dayLabels(30);

const COLLECTIONS = [
  { id: 'shielded-punks', name: 'Shielded Punks', items: 1000, floor: 2.4, volume: 182_000, seed: 3, verified: true },
  { id: 'orchard-birds', name: 'Orchard Birds', items: 500, floor: 0.8, volume: 64_000, seed: 9, verified: true },
  { id: 'memo-art', name: 'Memo Art', items: 256, floor: 4.1, volume: 96_000, seed: 17, verified: false },
];

const ITEMS = Array.from({ length: 12 }, (_, k) => ({
  id: `nft-${k + 1}`,
  name: `Shielded Punk #${k + 101}`,
  collection: 'shielded-punks',
  collectionName: 'Shielded Punks',
  price: 2.4 + (k % 5) * 0.35,
  last: 1.8 + (k % 4) * 0.3,
  seed: `punk-${k}`,
  listed: k % 3 !== 0,
}));

function Explore() {
  const t = useT();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('price');
  const [page, setPage] = useState(1);
  const items = ITEMS.filter((x) => !q || x.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (sort === 'price' ? a.price - b.price : b.last - a.last));
  return (
    <>
      <Grid cols={3}>
        {COLLECTIONS.map((c) => (
          <Card key={c.id} interactive>
            <Cluster justify="space-between">
              <span className="nui-cluster" style={{ gap: 10 }}><Identicon value={c.id} variant="art" size={44} /><strong>{c.name}</strong></span>
              {c.verified && <Badge tone="info">{t('Verified', '已认证')}</Badge>}
            </Cluster>
            <div style={{ marginTop: 16 }}>
              <Stats>
                <Stat size="sm" label={t('Floor', '地板价')} value={`${c.floor} ZEC`} />
                <Stat size="sm" label={t('Volume', '成交量')} value={compactUsd(c.volume)} />
              </Stats>
            </div>
            <Cluster justify="space-between" style={{ marginTop: 12 }}>
              <Sparkline data={walk(c.seed, 30, c.floor, 0.05, 0.003)} />
              <Button size="sm" href={link('nft', 'collection', c.id)}>{t('View', '查看')}</Button>
            </Cluster>
          </Card>
        ))}
      </Grid>
      <Cluster justify="space-between">
        <ChipGroup aria-label={t('Sort', '排序')} value={sort} onChange={setSort} options={[{ value: 'price', label: t('Price low → high', '价格从低到高') }, { value: 'recent', label: t('Recent sales', '最近成交') }]} />
        <SearchInput label={t('Search NFTs', '搜索 NFT')} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} style={{ width: 220 }} />
      </Cluster>
      <Grid cols={4}>
        {items.map((x) => (
          <NFTCard key={x.id} name={x.name} collection={x.collectionName} seed={x.seed} href={link('nft', 'item', x.id)} price={`${x.price.toFixed(2)} ZEC`} meta={x.listed ? t('Listed', '已挂单') : t('Not listed', '未挂单')} badge={x.listed ? <Badge tone="accent">{t('For sale', '出售中')}</Badge> : undefined} />
        ))}
      </Grid>
      <Pagination page={page} pages={6} onChange={setPage} />
    </>
  );
}

function Collection({ id }: { id: string }) {
  const t = useT();
  const c = COLLECTIONS.find((x) => x.id === id) ?? COLLECTIONS[0]!;
  return (
    <>
      <Stats divided>
        <Stat size="sm" label={t('Floor', '地板价')} value={`${c.floor} ZEC`} />
        <Stat size="sm" label={t('Items', '数量')} value={c.items} />
        <Stat size="sm" label={t('Owners', '持有者')} value={Math.round(c.items * 0.62)} />
        <Stat size="sm" label={t('Volume', '总成交量')} value={compactUsd(c.volume)} />
      </Stats>
      <Panel title={t('Floor price · 30 days', '地板价 · 30 天')}>
        <LineChart label={t('Floor price', '地板价')} series={[{ name: 'floor', data: walk(c.seed, 30, c.floor, 0.06, 0.004), area: true }]} labels={days} height={220} yFormat={(v) => `${v.toFixed(2)} ZEC`} />
      </Panel>
      <Grid cols={4}>
        {ITEMS.slice(0, 8).map((x) => <NFTCard key={x.id} name={x.name} collection={c.name} seed={x.seed} href={link('nft', 'item', x.id)} price={`${x.price.toFixed(2)} ZEC`} />)}
      </Grid>
    </>
  );
}

function Item({ id }: { id: string }) {
  const t = useT();
  const { toast } = useToast();
  const item = ITEMS.find((x) => x.id === id) ?? ITEMS[0]!;
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState('');
  const traits = [['Background', 'Plum'], ['Pool', 'Orchard'], ['Visor', 'Gold'], ['Rarity', 'Top 12%']];
  return (
    <Split>
      <Main>
        <Panel flush>
          <Identicon value={item.seed} variant="art" size={640} label={item.name} className="nui-nft__art" />
        </Panel>
        <Panel title={t('Price history', '价格历史')}>
          <LineChart label={t('Sales', '成交历史')} height={200} series={[{ name: 'price', data: walk(21, 20, item.last, 0.08, 0.01), area: true }]} labels={dayLabels(20)} yFormat={(v) => `${v.toFixed(2)} ZEC`} />
        </Panel>
        <Panel title={t('Offers', '报价')} flush>
          <DataTable
            rows={[{ from: 'u1…9f2c', price: item.price * 0.9, exp: '2 d' }, { from: 'u1…41ab', price: item.price * 0.82, exp: '12 h' }]}
            rowKey={(r) => r.from}
            columns={[
              { key: 'from', header: t('From', '来自'), cell: (r) => <span className="nui-mono">{r.from}</span> },
              { key: 'price', header: t('Offer', '报价'), numeric: true, cell: (r) => `${r.price.toFixed(2)} ZEC` },
              { key: 'exp', header: t('Expires', '过期'), numeric: true, cell: (r) => r.exp },
            ]}
          />
        </Panel>
      </Main>
      <Side>
        <Panel title={item.name} actions={<Badge tone="accent">{item.listed ? t('For sale', '出售中') : t('Owned', '持有中')}</Badge>}>
          <Stat size="sm" label={t('Price', '价格')} value={`${item.price.toFixed(2)} ZEC`} />
          <p className="nui-text-muted nui-text-small" style={{ margin: '8px 0 16px' }}>{t('Last sale', '上次成交')} {item.last.toFixed(2)} ZEC</p>
          <Cluster gap={6}>
            <Button variant="solid" onClick={() => toast({ title: t('Purchase submitted', '购买已提交'), description: item.name, tone: 'positive' })}>{t('Buy now', '立即购买')}</Button>
            <Button onClick={() => setOfferOpen(true)}>{t('Make offer', '出价')}</Button>
          </Cluster>
          <div style={{ marginTop: 20 }}>
            <KeyValue items={[{ label: t('Collection', '合集'), value: item.collectionName }, { label: t('Token standard', '标准'), value: 'Noir NFT-1' }, { label: t('Royalty', '版税'), value: '2.5%' }]} />
          </div>
        </Panel>
        <Panel title={t('Traits', '特征')}>
          <Grid cols={2} style={{ gap: 10 }}>
            {traits.map(([k, v]) => (
              <div key={k} style={{ border: '1px solid var(--nui-border)', padding: 12 }}>
                <div className="nui-eyebrow" style={{ fontSize: 10 }}>{k}</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </Grid>
        </Panel>
        <Panel title={t('Provenance', '流转记录')}>
          <Timeline
            items={[
              { title: t('Listed for sale', '挂单出售'), time: '2 h', tone: 'accent', description: `${item.price.toFixed(2)} ZEC` },
              { title: t('Sold', '成交'), time: '12 d', tone: 'positive', description: `${item.last.toFixed(2)} ZEC` },
              { title: t('Minted', '铸造'), time: '2026-02', tone: 'info' },
            ]}
          />
        </Panel>
      </Side>
      <Drawer open={offerOpen} onClose={() => setOfferOpen(false)} title={t('Make an offer', '提交报价')} footer={<Button variant="solid" block disabled={!offer} onClick={() => { setOfferOpen(false); toast({ title: t('Offer submitted', '报价已提交'), description: `${offer} ZEC`, tone: 'positive' }); }}>{t('Submit offer', '提交报价')}</Button>}>
        <TokenAmountInput label={t('Offer', '报价')} value={offer} onChange={setOffer} token={TOKENS[0]} onMax={setOffer} />
        <p className="nui-text-muted nui-text-small" style={{ marginTop: 16 }}>{t('Offers are held in escrow for 48 hours and can be cancelled before acceptance.', '报价托管 48 小时，被接受前可取消。')}</p>
      </Drawer>
    </Split>
  );
}

function Create() {
  const t = useT();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [royalty, setRoyalty] = useState(2.5);
  const [fileName, setFileName] = useState('');
  const [mintOpen, setMintOpen] = useState(false);
  return (
    <Split>
      <Main>
        <div className="nui-stack" style={{ gap: 20 }}>
          <FileDrop accept="image/*" maxSize={10_000_000} onFiles={(f) => setFileName(f[0]!.name)} label={fileName || t('Artwork', '作品文件')} hint={t('PNG, JPG, SVG or GIF · up to 10 MB', 'PNG、JPG、SVG 或 GIF · 最大 10 MB')} />
          <Field label={t('Name', '名称')}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shielded Punk #999" /></Field>
          <Field label={t('Description', '描述')}><textarea className="nui-textarea" rows={3} /></Field>
          <Slider label={t('Royalty', '版税')} value={royalty} onChange={setRoyalty} min={0} max={10} step={0.5} marks={[0, 2.5, 5, 7.5, 10]} format={(v) => `${v}%`} />
          <Button variant="solid" disabled={!name} onClick={() => setMintOpen(true)}>{t('Mint NFT', '铸造 NFT')}</Button>
        </div>
      </Main>
      <Side>
        <NFTCard name={name || 'Untitled'} collection={t('My collection', '我的合集')} seed={name || 'preview'} price={t('Not listed', '未挂单')} />
        <Alert tone="info">{t('Metadata is stored on public storage. Ownership can be held confidentially on Noir.', '元数据存储于公开存储，Noir 上的所有权可以保密持有。')}</Alert>
      </Side>
      <Dialog open={mintOpen} onClose={() => setMintOpen(false)} title={t('Confirm mint', '确认铸造')} footer={<Button variant="solid" onClick={() => { setMintOpen(false); toast({ title: t('NFT minted', 'NFT 已铸造'), description: name, tone: 'positive' }); }}>{t('Mint', '铸造')}</Button>}>
        <KeyValue items={[{ label: t('Name', '名称'), value: name }, { label: t('Royalty', '版税'), value: `${royalty}%` }, { label: t('Mint fee', '铸造费'), value: '0.01 ZEC' }]} />
      </Dialog>
    </Split>
  );
}

function Mine() {
  const t = useT();
  const { toast } = useToast();
  const [listFor, setListFor] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  return (
    <>
      <Grid cols={4}>
        {ITEMS.slice(0, 4).map((x) => (
          <div key={x.id}>
            <NFTCard name={x.name} collection={x.collectionName} seed={x.seed} price={x.listed ? `${x.price.toFixed(2)} ZEC` : t('Not listed', '未挂单')} />
            <Button size="sm" block variant="outline" style={{ marginTop: 8 }} onClick={() => setListFor(x.id)}>{t('List for sale', '挂单出售')}</Button>
          </div>
        ))}
      </Grid>
      <Drawer open={listFor !== null} onClose={() => setListFor(null)} title={t('List for sale', '挂单出售')} footer={<Button variant="solid" block disabled={!price} onClick={() => { setListFor(null); toast({ title: t('Listed', '已挂单'), description: `${price} ZEC`, tone: 'positive' }); }}>{t('Confirm listing', '确认挂单')}</Button>}>
        <TokenAmountInput label={t('Price', '价格')} value={price} onChange={setPrice} token={TOKENS[0]} />
      </Drawer>
    </>
  );
}

export default function Product({ path }: ProductProps) {
  const t = useT();
  const [page, arg] = path;
  const body = page === 'collection' ? <Collection id={arg ?? ''} /> : page === 'item' ? <Item id={arg ?? ''} /> : page === 'create' ? <Create /> : page === 'mine' ? <Mine /> : <Explore />;
  const parent = page === 'item' ? '' : page === 'collection' ? '' : (page ?? '');
  return (
    <ProductShell product="nft" page={parent} title={page === 'collection' ? COLLECTIONS.find((c) => c.id === arg)?.name : page === 'item' ? arg : undefined} crumbs={page === 'collection' || page === 'item' ? [{ label: t('Explore', '探索'), href: link('nft') }, { label: arg }] : undefined}>
      {body}
    </ProductShell>
  );
}
