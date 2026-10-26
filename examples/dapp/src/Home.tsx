import type { CSSProperties } from 'react';
import { Alert, Badge, Button, Card, Cluster, Display, Eyebrow, Grid, Lead, LiveValue, PriceChange, PrivacyBadge, Section, Sparkline, Stat, Stats, Stepper } from '@nui3/react';
import { useSettings, useT } from './settings';
import { usePrice, useHistory, type MarketId } from './sim';
import { GROUPS, PRODUCTS, link, type GroupId } from './products/meta';

function Ticker({ id }: { id: MarketId }) {
  const { price, change } = usePrice(id);
  const history = useHistory(id);
  return (
    <a href={link('perps')} className="nui-card nui-card--interactive" style={{ textDecoration: 'none', display: 'grid', gap: 10 }}>
      <Cluster justify="space-between">
        <strong>{id}</strong>
        <PriceChange value={change} />
      </Cluster>
      <Cluster justify="space-between" style={{ alignItems: 'end' }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}><LiveValue value={price} format={(v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: v < 10 ? 4 : 2 })}`} /></span>
        <Sparkline data={history} label={`${id} 24h`} />
      </Cluster>
    </a>
  );
}

export function Home() {
  const { lang } = useSettings();
  const t = useT();
  const { price, change } = usePrice('ZEC');
  return (
    <>
      <section className="nui-shell" style={{ padding: '72px 0 56px' }}>
        <Eyebrow>{t('NoirProtocol · Zcash L2 ecosystem', 'NoirProtocol · Zcash L2 生态')}</Eyebrow>
        <Display size="l" style={{ marginTop: 20 }}>{t('Private finance,', '隐私金融，')}<br />{t('built on Zcash.', '构建于 Zcash。')}</Display>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', alignItems: 'end', marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--nui-border)' }}>
          <Lead>{t('One wallet for shielded assets, bridging, trading, lending, derivatives and payments. Every screen here is built from @nui3/react.', '一个钱包完成屏蔽资产管理、跨链、交易、借贷、衍生品和支付。这里的每个页面都由 @nui3/react 组件构成。')}</Lead>
          <Stats divided>
            <Stat label={t('ZEC price', 'ZEC 价格')} value={<LiveValue value={price} format={(v) => `$${v.toFixed(2)}`} />} delta={<PriceChange value={change} />} />
            <Stat label="TVL" value="48.2" unit="M" />
            <Stat label={t('Shielded ZEC', '屏蔽 ZEC')} value="4.87" unit="M" />
          </Stats>
        </div>
        <Cluster gap={8} style={{ marginTop: 40 }}>
          <Button variant="solid" href={link('dex')}>{t('Start trading', '开始交易')}</Button>
          <Button href={link('bridge')}>{t('Bridge ZEC', '跨链 ZEC')}</Button>
          <Button href={link('docs')}>{t('Components', '组件文档')}</Button>
        </Cluster>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 72 }}>
        <Eyebrow as="h2" style={{ marginBottom: 16 }}>{t('Markets · live', '行情 · 实时')}</Eyebrow>
        <Grid cols={4} style={{ '--nui-grid-gap': '16px' } as CSSProperties}>
          {(['ZEC', 'BTC', 'ETH', 'NEAR'] as MarketId[]).map((id) => <Ticker key={id} id={id} />)}
        </Grid>
      </section>

      {(Object.keys(GROUPS) as GroupId[]).map((g) => {
        const list = PRODUCTS.filter((x) => x.group === g).sort((a, b) => a.priority - b.priority);
        return (
          <section key={g} className="nui-shell" style={{ paddingBottom: 56 }}>
            <Cluster justify="space-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--nui-border)' }}>
              <Eyebrow as="h2">{GROUPS[g][lang]}</Eyebrow>
              <span className="nui-text-muted nui-text-small">{list.length} {t('products', '个产品')}</span>
            </Cluster>
            <Grid cols={3}>
              {list.map((x) => (
                <Card key={x.id} interactive>
                  <Cluster justify="space-between" style={{ alignItems: 'start' }}>
                    <h3 className="nui-card__title">{x.name[lang]}</h3>
                    <Badge>{`Phase ${x.phase}`}</Badge>
                  </Cluster>
                  <p className="nui-card__desc">{x.tagline[lang]}</p>
                  <div className="nui-card__foot">
                    <ul className="nui-card__tags">{x.pages.filter((s) => !s.hidden).slice(0, 3).map((s) => <li key={s.id}>{s.label[lang]}</li>)}</ul>
                    <a className="nui-card__link nui-card__link--stretched" href={link(x.id)}>{t('Open', '进入')} →</a>
                  </div>
                </Card>
              ))}
            </Grid>
          </section>
        );
      })}

      <Section tone="plum">
        <Eyebrow accent>{t('How it fits together', '产品如何协同')}</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '16px 0 40px', color: 'inherit' }}>{t('Four loops, one wallet.', '四个闭环，一个钱包。')}</Display>
        <Grid cols={2}>
          {[
            { title: t('Assets & trading', '资产与交易'), steps: [t('Bridge', '跨链桥'), t('TokenDeploy', '发币'), 'DEX', 'LaunchPad'] },
            { title: t('DeFi capital', 'DeFi 资金循环'), steps: ['ZEC → Bridge', t('Lend, borrow USDC', '抵押借出 USDC'), 'DEX / Perps / Prediction', t('Repay, withdraw ZEC', '还款并提取 ZEC')] },
            { title: t('Real payments', '真实支付'), steps: [t('ZEC / stablecoins', 'ZEC / 稳定币'), 'Payroll', t('Employee receives', '员工收款'), t('Spend or invest', '消费或投资')] },
            { title: t('Developers', '开发者'), steps: ['RPC + Explorer + SDK', t('Third-party apps', '第三方应用'), t('More assets', '更多资产'), t('More volume', '更多交易')] },
          ].map((loop) => (
            <div key={loop.title} className="nui-panel" style={{ padding: 24 }}>
              <h3 className="nui-panel__title" style={{ marginBottom: 20 }}>{loop.title}</h3>
              <Stepper orientation="horizontal" steps={loop.steps.map((s, k) => ({ title: s, state: k === 0 ? 'complete' : k === 1 ? 'active' : 'pending' }))} />
            </div>
          ))}
        </Grid>
      </Section>

      <section className="nui-shell" style={{ padding: '96px 0' }}>
        <Eyebrow>{t('Privacy levels', '隐私等级')}</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '16px 0 32px' }}>{t('Not everything is equally private.', '不是所有操作都同样私密。')}</Display>
        <Grid cols={3}>
          {(['shielded', 'confidential', 'public'] as const).map((level) => (
            <Card key={level}>
              <PrivacyBadge level={level} describe={false} />
              <p className="nui-text-secondary nui-text-small" style={{ marginTop: 16 }}>
                {level === 'shielded' && t('Zcash shielded pool (Orchard, Sapling). Sender, recipient and amount are encrypted on-chain.', 'Zcash 屏蔽池（Orchard、Sapling）。发送方、接收方和金额在链上加密。')}
                {level === 'confidential' && t('Noir confidential execution. Hidden from the public, but not protected by Zcash shielded cryptography.', 'Noir 机密执行。对公众隐藏，但不受 Zcash 屏蔽密码学保护。')}
                {level === 'public' && t('Transparent addresses, NEAR, Ethereum, Solana and external DeFi. Visible to anyone.', '透明地址、NEAR、以太坊、Solana 和外部 DeFi。所有人可见。')}
              </p>
            </Card>
          ))}
        </Grid>
        <div style={{ marginTop: 20 }}>
          <Alert tone="warning" title={t('NoirProtocol is not a ZK rollup', 'NoirProtocol 不是 ZK Rollup')}>
            {t('Execution runs on NEAR and state is anchored to Zcash. It does not inherit every security guarantee of a ZK rollup.', '执行在 NEAR 上进行，状态锚定到 Zcash，并不具备 ZK Rollup 的全部安全保证。')}
          </Alert>
        </div>
      </section>
    </>
  );
}
