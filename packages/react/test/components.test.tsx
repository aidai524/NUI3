import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import {
  Address, Amount, Button, ChipGroup, DataTable, Dialog, Field, Footer, HealthFactor, Input,
  MemoInput, PrivacyBadge, PRIVACY_LEVELS, ReceiveQR, Stepper, ThemeProvider, TokenAmountInput, TxStatus,
  ToastProvider, useToast, DEFAULT_DISCLAIMER,
} from '../src/index.js';
import { encode } from './bech32.js';

afterEach(cleanup);
const ZS = encode('zs', 69, 'bech32');
const T1 = 't1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU';

describe('ThemeProvider', () => {
  it('sets theme, density and token overrides', () => {
    const { container } = render(<ThemeProvider theme="night" density="compact" tokens={{ accent: '#7ee0c3' }}>x</ThemeProvider>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.dataset.nuiTheme).toBe('night');
    expect(el.dataset.nuiDensity).toBe('compact');
    expect(el.style.getPropertyValue('--nui-accent')).toBe('#7ee0c3');
  });
});

describe('Button', () => {
  it('renders a typed button by default and opens external links safely', () => {
    render(<><Button>Save</Button><Button href="https://z.cash">Out</Button></>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('button');
    const link = screen.getByRole('link', { name: 'Out' });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
  it('disables while loading', () => {
    render(<Button variant="solid" loading>Swap</Button>);
    const b = screen.getByRole('button', { name: 'Swap' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute('aria-busy')).toBe('true');
  });
});

describe('Field', () => {
  it('wires label, hint and error to the control', () => {
    render(<Field label="Recipient" hint="Unified address" error="Invalid address"><Input /></Field>);
    const input = screen.getByLabelText('Recipient');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual(['Invalid address', 'Unified address']);
  });
});

describe('ChipGroup', () => {
  it('selects with click and arrow keys', () => {
    function Demo() {
      const [v, setV] = useState('all');
      return <ChipGroup aria-label="Category" value={v} onChange={setV} options={[{ value: 'all', label: 'All' }, { value: 'dex', label: 'DEX' }]} />;
    }
    render(<Demo />);
    const all = screen.getByRole('button', { name: 'All' });
    all.focus();
    fireEvent.keyDown(all, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'DEX' }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('Zcash components', () => {
  it('Address shows kind, truncates, copies full value', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<Address address={ZS} />);
    expect(screen.getByText('Sapling')).toBeTruthy();
    expect(screen.getByTitle(ZS).textContent).toContain('…');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy address' })));
    expect(writeText).toHaveBeenCalledWith(ZS);
  });

  it('Amount formats base units and masks in privacy mode', () => {
    const { rerender, container } = render(<Amount value={123450000n} fiat={41.2} />);
    expect(container.textContent).toBe('1.2345ZEC≈ $41.20');
    rerender(<Amount value={123450000n} hidden />);
    expect(container.textContent).not.toContain('1.2345');
    expect(screen.getByText('Amount hidden')).toBeTruthy();
  });

  it('PrivacyBadge uses canonical wording', () => {
    const { container } = render(<PrivacyBadge level="confidential" />);
    const badge = container.querySelector('[data-level="confidential"]')!;
    expect(badge.getAttribute('title')).toBe(PRIVACY_LEVELS.confidential.description);
    expect(badge.textContent).toContain('Confidential');
  });

  it('MemoInput counts bytes and disables for transparent recipients', () => {
    const { rerender } = render(<MemoInput value="隐私" onChange={() => {}} recipient={ZS} />);
    expect(screen.getByText('6/512 bytes')).toBeTruthy();
    rerender(<MemoInput value="hi" onChange={() => {}} recipient={T1} />);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('TxStatus shows confirmations', () => {
    render(<TxStatus status="confirming" confirmations={3} required={10} />);
    expect(screen.getByRole('status').textContent).toBe('Confirming 3/10');
  });

  it('ReceiveQR renders an accessible svg', () => {
    render(<ReceiveQR value={ZS} caption="Scan to pay" />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain(ZS);
    expect(svg.querySelector('path')!.getAttribute('d')!.length).toBeGreaterThan(100);
  });
});

describe('DeFi components', () => {
  it('TokenAmountInput sanitizes typing and fills max', () => {
    const onChange = vi.fn();
    const onMax = vi.fn();
    render(<TokenAmountInput label="You pay" value="" onChange={onChange} onMax={onMax} token={{ symbol: 'ZEC', decimals: 8, balance: 250000000n }} />);
    fireEvent.change(screen.getByLabelText('You pay amount'), { target: { value: '1,23456789123' } });
    expect(onChange).toHaveBeenCalledWith('1.23456789');
    fireEvent.click(screen.getByRole('button', { name: 'Max' }));
    expect(onMax).toHaveBeenCalledWith('2.5');
    expect(screen.getByText(/Balance 2.5/)).toBeTruthy();
  });

  it('HealthFactor reports zone', () => {
    render(<HealthFactor value={1.2} />);
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('1.20, at risk');
  });
});

describe('Surfaces', () => {
  it('DataTable sorts by column', () => {
    const rows = [{ id: 'a', v: 1 }, { id: 'b', v: 3 }, { id: 'c', v: 2 }];
    render(<DataTable rowKey={(r) => r.id} rows={rows} columns={[{ key: 'id', header: 'Id', cell: (r) => r.id }, { key: 'v', header: 'Value', numeric: true, cell: (r) => r.v, sortValue: (r) => r.v }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Value' }));
    const cells = screen.getAllByRole('row').slice(1).map((r) => r.firstElementChild!.textContent);
    expect(cells).toEqual(['b', 'c', 'a']);
    expect(screen.getByRole('columnheader', { name: 'Value' }).getAttribute('aria-sort')).toBe('descending');
  });

  it('Stepper marks the active step', () => {
    render(<Stepper steps={[{ title: 'Deposit', state: 'complete' }, { title: 'Bridge', state: 'active' }, { title: 'Receive', state: 'pending' }]} />);
    expect(screen.getAllByRole('listitem')[1]!.getAttribute('aria-current')).toBe('step');
  });

  it('Footer always renders a disclaimer', () => {
    render(<Footer disclaimer="" />);
    expect(screen.getByText(DEFAULT_DISCLAIMER)).toBeTruthy();
  });

  it('Dialog renders content only when open and closes on button', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open={false} onClose={onClose} title="Confirm">Body</Dialog>);
    expect(screen.queryByText('Body')).toBeNull();
    rerender(<Dialog open onClose={onClose} title="Confirm">Body</Dialog>);
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Toast shows and dismisses', () => {
    function Trigger() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Swap submitted', tone: 'positive' })}>go</button>;
    }
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('go'));
    expect(screen.getByText('Swap submitted')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Swap submitted')).toBeNull();
  });
});
