import { Badge, Button, Card, Cluster, Display, Eyebrow, Grid, Lead, PriceChange, ProjectCard, Section, Stat, Stats } from '@nui3/react';
import { to } from '../router';

// Roadmap from the NoirProtocol plan. Live = has a page in this example.
const PRODUCTS = [
  { name: 'Bridge', desc: 'Move ZEC, USDC, BTC, ETH and SOL in and out of Noir, with status tracking and recovery.', route: 'bridge', phase: 1 },
  { name: 'TokenDeploy', desc: 'Create, issue and manage TKN / TKNX tokens, then list them on the DEX in one step.', route: 'deploy', phase: 1 },
  { name: 'DEX', desc: 'Swap ZEC, stablecoins and new tokens. Routed through Rhea liquidity.', route: 'swap', phase: 1 },
  { name: 'Explorer', desc: 'Public transactions, tokens, contracts and cross-chain state. Never shielded data.', route: 'explorer', phase: 1 },
  { name: 'Lending', desc: 'Borrow USDC against ZEC without selling it. Health factor and liquidation management.', route: 'lend', phase: 2 },
  { name: 'Wallet', desc: 'Balances, receive with QR and encrypted memo, light-wallet sync.', route: 'wallet', phase: 1 },
  { name: 'Perps', desc: 'Perpetual futures with margin, leverage and funding.', phase: 2 },
  { name: 'Prediction', desc: 'Prediction markets via Polymarket, funded with ZEC.', phase: 2 },
  { name: 'Payroll', desc: 'Shielded salary runs, batch payouts and payment receipts.', phase: 3 },
  { name: 'RPC', desc: 'Zcash RPC, lightwalletd and Noir state APIs with keys and quotas.', phase: 3 },
  { name: 'NFTTrade', desc: 'Mint, list, buy and transfer NFTs.', phase: 4 },
  { name: 'LaunchPad', desc: 'Token sales, bonding curves and initial DEX liquidity.', phase: 4 },
];

export function Home() {
  const live = PRODUCTS.filter((p) => p.route);
  const planned = PRODUCTS.filter((p) => !p.route);
  return (
    <>
      <section className="nui-shell" style={{ padding: '72px 0 56px' }}>
        <Eyebrow>NUI3 · Example dApp</Eyebrow>
        <Display size="l" style={{ marginTop: 20 }}>Private finance,<br />built on Zcash.</Display>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', alignItems: 'end', marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--nui-border)' }}>
          <Lead>Every screen in this app is built from @nui3/react. Switch the theme in the header to see the same pages re-skinned through tokens alone.</Lead>
          <Stats divided>
            <Stat label="ZEC price" value="$951.63" delta={<PriceChange value={2.41} />} />
            <Stat label="TVL" value="48.2" unit="M" />
            <Stat label="Shielded ZEC" value="4.87" unit="M" />
          </Stats>
        </div>
        <Cluster gap={8} style={{ marginTop: 40 }}>
          <Button variant="solid" href={to('swap')}>Start trading</Button>
          <Button href={to('bridge')}>Bridge ZEC</Button>
        </Cluster>
      </section>

      <section className="nui-shell" style={{ paddingBottom: 96 }}>
        <Eyebrow as="h2" style={{ marginBottom: 20 }}>Products · live in this example</Eyebrow>
        <Grid cols={3}>
          {live.map((p, i) => (
            <ProjectCard key={p.name} index={i + 1} name={p.name} description={p.desc} href={to(p.route!)} tags={[`phase ${p.phase}`]} />
          ))}
        </Grid>
      </section>

      <Section tone="plum">
        <Eyebrow accent>Roadmap</Eyebrow>
        <Display as="h2" size="s" style={{ margin: '16px 0 40px', color: 'inherit' }}>Coming next.</Display>
        <Grid cols={3}>
          {planned.map((p) => (
            <Card key={p.name}>
              <Cluster justify="space-between">
                <h3 className="nui-card__title">{p.name}</h3>
                <Badge>Phase {p.phase}</Badge>
              </Cluster>
              <p className="nui-card__desc" style={{ marginBottom: 0 }}>{p.desc}</p>
            </Card>
          ))}
        </Grid>
      </Section>
    </>
  );
}
