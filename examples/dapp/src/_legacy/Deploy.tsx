import { useState } from 'react';
import {
  Alert, Badge, Button, Checkbox, Cluster, Field, Grid, Input, InputGroup, KeyValue, Panel, PrivacyBadge, Segmented, Shell, Stepper,
  Switch, TokenIcon, formatAmount, tryParseUnits, useToast, type StepState,
} from '@nui3/react';
import { PageHead } from './PageHead';

const STEPS = ['Details', 'Supply', 'Review'] as const;

export function DeployPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Shielded Coffee');
  const [symbol, setSymbol] = useState('BEAN');
  const [template, setTemplate] = useState<'tkn' | 'tknx'>('tkn');
  const [supply, setSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('6');
  const [mintable, setMintable] = useState(false);
  const [fee, setFee] = useState('0');
  const [listOnDex, setListOnDex] = useState(true);
  const [ack, setAck] = useState(false);

  const symbolError = symbol && !/^[A-Z0-9]{2,10}$/.test(symbol) ? '2–10 characters, A–Z and 0–9' : undefined;
  const supplyUnits = tryParseUnits(supply || '0', Number(decimals) || 0);
  const supplyError = supply && (supplyUnits === null || supplyUnits <= 0n) ? 'Enter a positive whole amount' : undefined;
  const canNext = step === 0 ? Boolean(name && symbol && !symbolError) : step === 1 ? Boolean(supply && !supplyError) : ack;

  const state = (i: number): StepState => (i < step ? 'complete' : i === step ? 'active' : 'pending');

  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead eyebrow="TokenDeploy" title="Create a token." lead="Issue a TKN or TKNX token on Noir and list it on the DEX in one flow." />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <Panel title="New token" actions={<Badge>Step {step + 1} of {STEPS.length}</Badge>}>
          <Stepper orientation="horizontal" steps={STEPS.map((title, i) => ({ title, state: state(i) }))} />
          <div className="nui-stack" style={{ gap: 20, marginTop: 28 }}>
            {step === 0 && (
              <>
                <Field label="Template" hint="TKNX adds transfer fees and deflationary burns.">
                  <Segmented aria-label="Template" value={template} onChange={setTemplate} options={[{ value: 'tkn', label: 'TKN · standard' }, { value: 'tknx', label: 'TKNX · extended' }]} />
                </Field>
                <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label="Symbol" error={symbolError}><Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></Field>
              </>
            )}
            {step === 1 && (
              <>
                <Grid cols={2} style={{ gap: 16 }}>
                  <Field label="Total supply" error={supplyError}><InputGroup inputMode="numeric" end={symbol} value={supply} onChange={(e) => setSupply(e.target.value.replace(/[^\d]/g, ''))} /></Field>
                  <Field label="Decimals"><InputGroup inputMode="numeric" value={decimals} onChange={(e) => setDecimals(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} /></Field>
                </Grid>
                <Switch label="Owner can mint more later" checked={mintable} onChange={setMintable} />
                {template === 'tknx' && <Field label="Transfer fee" hint="Charged on every transfer, sent to the treasury."><InputGroup end="%" value={fee} onChange={(e) => setFee(e.target.value)} /></Field>}
                <Switch label="Create a DEX pool after deploy" checked={listOnDex} onChange={setListOnDex} />
              </>
            )}
            {step === 2 && (
              <>
                <KeyValue
                  items={[
                    { label: 'Token', value: <span className="nui-cluster" style={{ gap: 8, justifyContent: 'flex-end' }}><TokenIcon symbol={symbol} size="sm" />{name} · {symbol}</span> },
                    { label: 'Template', value: template.toUpperCase() },
                    { label: 'Supply', value: `${formatAmount(supplyUnits ?? 0n, { decimals: Number(decimals) || 0 })} ${symbol}` },
                    { label: 'Mintable', value: mintable ? 'Yes' : 'No — fixed supply' },
                    { label: 'DEX pool', value: listOnDex ? `${symbol} / USDC` : 'None' },
                    { label: 'Execution', value: <PrivacyBadge level="confidential" describe={false} /> },
                    { label: 'Deploy fee', value: '5 USDC' },
                  ]}
                />
                <Alert tone="warning" title="Token parameters are permanent">
                  Name, symbol and decimals{mintable ? '' : ' and supply'} cannot be changed after deploy. Token contracts are not reviewed by Noir.
                </Alert>
                <Checkbox label="I have checked the parameters above." checked={ack} onChange={(e) => setAck(e.target.checked)} />
              </>
            )}
            <Cluster justify="space-between">
              <Button disabled={step === 0} arrow={false} onClick={() => setStep((s) => s - 1)}>Back</Button>
              {step < STEPS.length - 1 ? (
                <Button variant="outline" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</Button>
              ) : (
                <Button variant="solid" disabled={!canNext} onClick={() => toast({ title: `${symbol} deployed`, description: listOnDex ? `Pool ${symbol}/USDC is ready for liquidity.` : undefined, tone: 'positive' })}>
                  Deploy token
                </Button>
              )}
            </Cluster>
          </div>
        </Panel>

        <Panel title="Preview" sunken>
          <Cluster gap={4}>
            <TokenIcon symbol={symbol || '?'} size="lg" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{name || 'Untitled'}</div>
              <div className="nui-text-muted nui-text-small">{symbol || '—'} · {template.toUpperCase()}</div>
            </div>
          </Cluster>
          <p className="nui-text-secondary nui-text-small" style={{ marginTop: 20 }}>
            This is how the token appears in the DEX token picker and the Explorer token page.
          </p>
        </Panel>
      </Grid>
    </Shell>
  );
}
