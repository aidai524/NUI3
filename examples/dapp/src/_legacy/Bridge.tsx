import { useState } from 'react';
import {
  Address, Alert, Amount, Button, ChainBadge, Checkbox, DataTable, DetailList, Field, Grid, Input, Panel, PrivacyBadge, Select, Shell,
  Stepper, TokenAmountInput, TxStatus, isValidAddress, useToast, type PrivacyLevel, type TxState,
} from '@nui3/react';
import { ADDR, BRIDGE_HISTORY, TOKENS } from '../data';
import { fiatOf } from './Swap';
import { PageHead } from './PageHead';

const CHAINS: Array<{ name: string; privacy: PrivacyLevel }> = [
  { name: 'Zcash', privacy: 'shielded' },
  { name: 'Noir', privacy: 'confidential' },
  { name: 'NEAR', privacy: 'public' },
  { name: 'Ethereum', privacy: 'public' },
  { name: 'Solana', privacy: 'public' },
];
const privacyOf = (chain: string) => CHAINS.find((c) => c.name === chain)?.privacy ?? 'public';
const DECIMALS: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t.symbol, t.decimals]));

export function BridgePage() {
  const { toast } = useToast();
  const [fromChain, setFromChain] = useState('Zcash');
  const [toChain, setToChain] = useState('Noir');
  const [amount, setAmount] = useState('2.5');
  const [recipient, setRecipient] = useState('');
  const [ack, setAck] = useState(false);

  const leavesShielded = privacyOf(fromChain) === 'shielded' && privacyOf(toChain) !== 'shielded';
  const toPublic = privacyOf(toChain) === 'public';
  const recipientError = recipient && toChain === 'Zcash' && !isValidAddress(recipient, 'mainnet') ? 'Not a valid Zcash mainnet address' : undefined;

  return (
    <Shell style={{ paddingBottom: 96 }}>
      <PageHead eyebrow="Bridge" title="Move assets across chains." lead="Deposit ZEC into Noir, or withdraw to Zcash, NEAR, Ethereum and Solana." />
      <Grid cols={2} style={{ alignItems: 'start' }}>
        <Panel title="Transfer">
          <div className="nui-stack" style={{ gap: 20 }}>
            <Grid cols={2} style={{ gap: 16 }}>
              <Field label="From">
                <Select value={fromChain} onChange={(e) => { setFromChain(e.target.value); if (e.target.value === toChain) setToChain(fromChain); }}>
                  {CHAINS.map((c) => <option key={c.name}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="To">
                <Select value={toChain} onChange={(e) => { setToChain(e.target.value); if (e.target.value === fromChain) setFromChain(toChain); }}>
                  {CHAINS.map((c) => <option key={c.name}>{c.name}</option>)}
                </Select>
              </Field>
            </Grid>
            <TokenAmountInput label={`From ${fromChain}`} aside={<PrivacyBadge level={privacyOf(fromChain)} />} value={amount} onChange={setAmount} token={TOKENS[0]} onMax={setAmount} fiat={fiatOf(amount, TOKENS[0])} />
            <Field label="Recipient" hint={toChain === 'Zcash' ? 'Unified or Sapling address keeps funds shielded.' : `Your ${toChain} address.`} error={recipientError}>
              <Input mono placeholder={toChain === 'Zcash' ? 'u1… or zs1…' : '0x… / account.near'} value={recipient} onChange={(e) => setRecipient(e.target.value.trim())} />
            </Field>
            <DetailList
              items={[
                { label: 'Destination privacy', value: <PrivacyBadge level={privacyOf(toChain)} describe={false} /> },
                { label: 'Bridge fee', value: '0.1%' },
                { label: 'Estimated time', value: fromChain === 'Zcash' ? '~12 min (10 blocks)' : '~2 min' },
              ]}
            />
            {(leavesShielded || toPublic) && (
              <Alert tone="warning" title="Privacy changes on this route">
                {leavesShielded && 'Funds leave the Zcash shielded pool. '}
                {toPublic && `Transfers on ${toChain} are public: addresses and amounts are visible to anyone.`}
              </Alert>
            )}
            <Checkbox label="I understand bridge transfers are irreversible once confirmed." checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <Button
              variant="solid"
              block
              disabled={!amount || !ack || Boolean(recipientError)}
              onClick={() => toast({ title: 'Bridge transfer started', description: `${amount} ZEC · ${fromChain} → ${toChain}`, tone: 'positive' })}
            >
              Bridge {amount || '0'} ZEC
            </Button>
          </div>
        </Panel>

        <Panel title="In progress" actions={<TxStatus status="confirming" confirmations={3} required={10} />}>
          <Stepper
            steps={[
              { title: 'Deposit to shielded address', description: <Address address={ADDR.sapling} truncate={[8, 6]} />, state: 'complete' },
              { title: 'Confirmations on Zcash', description: '3 of 10 blocks · about 12 min', state: 'active' },
              { title: 'Mint nZEC on Noir', description: <PrivacyBadge level="confidential" />, state: 'pending' },
              { title: 'Available in wallet', state: 'pending' },
            ]}
          />
        </Panel>
      </Grid>

      <Panel title="History" flush style={{ marginTop: 20 }}>
        <DataTable
          rows={BRIDGE_HISTORY}
          rowKey={(r) => r.id}
          columns={[
            { key: 'route', header: 'Route', cell: (r) => <span className="nui-cluster" style={{ gap: 8 }}>{r.route.split(' → ').map((c, i) => <span key={c} className="nui-cluster" style={{ gap: 8 }}>{i > 0 && '→'}<ChainBadge name={c} /></span>)}</span> },
            { key: 'amount', header: 'Amount', numeric: true, cell: (r) => <Amount value={r.amount} decimals={DECIMALS[r.symbol] ?? 8} symbol={r.symbol} /> },
            { key: 'status', header: 'Status', cell: (r) => <TxStatus status={r.status as TxState} /> },
            { key: 'age', header: 'Age', numeric: true, cell: (r) => r.age },
          ]}
        />
      </Panel>
    </Shell>
  );
}
