import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  BarChart, BatchPayments, BatchPaymentTable, BondingCurveChart, CandleChart, CodeBlock, Countdown, DepthChart, DonutChart, FileDrop, Header, Identicon, LeverageSlider, LineChart,
  LocaleProvider, Meter, OrderBook, OutcomeButton, Pagination, PnL, PositionTable, PriceChart, PrivacyBadge, SecretField, Sparkline, SubNav, Timeline,
  TxStatus, UptimeBar, niceTicks, paginationRange, parseCsv, parsePaymentCsv, validatePayments, zh,
} from '../src/index.js';
import { encode } from './bech32.js';

afterEach(cleanup);
const ZS = encode('zs', 69, 'bech32');
const T1 = 't1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU';

describe('i18n', () => {
  it('localizes built-in strings', () => {
    render(<LocaleProvider locale="zh"><PrivacyBadge level="shielded" /><TxStatus status="confirmed" /></LocaleProvider>);
    expect(screen.getByText('屏蔽')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('已确认');
  });
  it('accepts partial overrides', () => {
    render(<LocaleProvider locale="zh" messages={{ txConfirmed: '完成' }}><TxStatus status="confirmed" /></LocaleProvider>);
    expect(screen.getByRole('status').textContent).toBe('完成');
  });
  it('zh pack defines every key', () => {
    expect(Object.values(zh).every((v) => typeof v === 'string' && v.length > 0)).toBe(true);
  });
});

describe('charts', () => {
  it('niceTicks covers the range with round steps', () => {
    expect(niceTicks(0, 97, 4)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(5, 5).length).toBeGreaterThan(1);
  });
  it('render accessible svgs', () => {
    render(
      <>
        <LineChart label="ZEC price" series={[{ name: 'ZEC', data: [1, 3, 2, 5], area: true }]} labels={['a', 'b', 'c', 'd']} />
        <CandleChart label="ZEC/USDC" candles={[{ t: '1', o: 1, h: 3, l: 0.5, c: 2, v: 10 }, { t: '2', o: 2, h: 2.5, l: 1, c: 1.2, v: 5 }]} lastPrice={1.2} />
        <BarChart label="Volume" data={[{ label: 'Mon', value: 3 }, { label: 'Tue', value: -1 }]} signed />
        <DonutChart label="Pool share" data={[{ label: 'Orchard', value: 60 }, { label: 'Sapling', value: 40 }]} />
        <DepthChart label="Depth" bids={[[99, 1], [98, 2]]} asks={[[101, 1], [102, 3]]} />
      </>,
    );
    for (const name of ['ZEC price', 'ZEC/USDC', 'Volume', 'Pool share', 'Depth']) expect(screen.getByRole('img', { name })).toBeTruthy();
    expect(screen.getByText('60.0%')).toBeTruthy();
  });
  it('adapts price points and exposes the BondingCurveChart alias', () => {
    render(
      <>
        <PriceChart label="Probability" data={[{ t: '09:00', value: 0.42 }, { t: '10:00', value: 0.63 }]} priceFormat={(v) => `${v * 100}%`} />
        <BondingCurveChart label="Launch curve" price={(s) => 0.02 + s * 0.001} maxSupply={100} sold={40} points={3} />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Probability' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Launch curve' })).toBeTruthy();
    expect(screen.getByText('10:00')).toBeTruthy();
  });
  it('shows an empty state', () => {
    render(<LineChart label="x" series={[]} />);
    expect(screen.getByText('No data for this range')).toBeTruthy();
  });
  it('sparkline infers tone', () => {
    const { container } = render(<Sparkline data={[3, 2, 1]} />);
    expect(container.querySelector('path:last-child')!.getAttribute('stroke')).toBe('var(--nui-negative)');
  });
});

describe('trading', () => {
  it('OrderBook lists sides, spread and fills price on click', () => {
    const onSelect = vi.fn();
    render(<OrderBook bids={[[99.5, 1], [99, 2]]} asks={[[100.5, 1.5], [101, 1]]} last={100} onSelectPrice={onSelect} />);
    expect(screen.getByText(/Spread 1.00/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Asks 100.50/ }));
    expect(onSelect).toHaveBeenCalledWith(100.5);
  });
  it('LeverageSlider reports value and warns', () => {
    const onChange = vi.fn();
    const { container } = render(<LeverageSlider value={20} onChange={onChange} max={50} />);
    const s = screen.getByRole('slider', { name: 'Leverage' });
    expect(s.getAttribute('aria-valuetext')).toBe('20×');
    fireEvent.change(s, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(5);
    expect(container.querySelector('.nui-leverage__value')!.className).toContain('warning');
  });
  it('PnL signs and PositionTable closes', () => {
    const onClose = vi.fn();
    render(<PositionTable onClose={onClose} positions={[{ id: '1', market: 'ZEC-PERP', side: 'long', size: '2', entry: 900, mark: 950, liq: 700, leverage: 5, pnl: 100, pnlPercent: 5.5 }]} />);
    expect(screen.getByText('+$100.00')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
    cleanup();
    render(<PnL value={-12.5} />);
    expect(screen.getByText('−$12.50')).toBeTruthy();
  });
  it('Countdown, Meter, Uptime, Outcome', () => {
    const { container } = render(
      <>
        <Countdown to={Date.now() + 90_061_000} />
        <Meter label="Raised" value={62} max={100} marks={[{ value: 50, label: 'Soft cap' }]} />
        <UptimeBar label="RPC" days={[{ date: 'd1', status: 'operational' }, { date: 'd2', status: 'outage' }]} />
        <OutcomeButton label="Yes" probability={0.634} selected />
      </>,
    );
    expect(container.querySelector('time.nui-countdown')!.textContent).toMatch(/^1d01h01m$/);
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('62');
    expect(screen.getByRole('img', { name: 'RPC: 50.00%' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Yes/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('63.4¢')).toBeTruthy();
  });
});

describe('content', () => {
  it('CodeBlock switches snippets', () => {
    render(<CodeBlock snippets={[{ label: 'curl', code: 'curl x' }, { label: 'JS', code: 'fetch(x)' }]} />);
    fireEvent.click(screen.getByRole('tab', { name: 'JS' }));
    expect(screen.getByText('fetch(x)')).toBeTruthy();
  });
  it('SecretField masks until revealed', () => {
    render(<SecretField value="nui_live_abcdef123456" />);
    expect(screen.queryByText('nui_live_abcdef123456')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Reveal' }));
    expect(screen.getByText('nui_live_abcdef123456')).toBeTruthy();
  });
  it('pagination range and nav', () => {
    expect(paginationRange(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    const onChange = vi.fn();
    render(<Pagination page={1} pages={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
  it('Timeline, SubNav, Identicon', () => {
    render(
      <>
        <Timeline items={[{ title: 'Listed', time: '2h' }]} />
        <SubNav aria-label="DEX" items={[{ label: 'Swap', href: '#a', current: true }, { label: 'Pools', href: '#b' }]} />
        <Identicon value="zs1abc" label="avatar" />
      </>,
    );
    expect(screen.getByRole('link', { name: 'Swap' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('img', { name: 'avatar' })).toBeTruthy();
  });
  it('FileDrop rejects large files', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDrop onFiles={onFiles} maxSize={10} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'.repeat(20)], 'a.csv')] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toBe('File is too large');
  });
  it('Header renders dropdown groups and a mobile menu button', () => {
    render(<Header brand={<span>B</span>} nav={[{ label: 'Trade', href: '#', children: [{ label: 'Swap', href: '#/swap', current: true, description: 'Spot' }] }]} />);
    const trigger = screen.getByRole('button', { name: /Trade/ });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('link', { name: /Swap/ })[0]!.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Menu' })).toBeTruthy();
  });
});

describe('payments', () => {
  it('parses quoted CSV', () => {
    expect(parseCsv('a,"b,c","d ""q"""\n1,2,3')).toEqual([['a', 'b,c', 'd "q"'], ['1', '2', '3']]);
  });
  it('maps headers in any order, incl. Chinese', () => {
    const rows = parsePaymentCsv(`金额,地址,备注\n1.5,${ZS},Oct salary`);
    expect(rows).toEqual([{ name: undefined, address: ZS, amount: '1.5', memo: 'Oct salary' }]);
  });
  it('validates rows and totals only valid ones', () => {
    const r = validatePayments([
      { address: ZS, amount: '1.5', memo: 'ok' },
      { address: T1, amount: '0.5', memo: 'not allowed' },
      { address: 'bad', amount: '1' },
      { address: ZS, amount: '0' },
    ]);
    expect(r.rows.map((x) => x.issues)).toEqual([[], ['memoNotAllowed'], ['address'], ['amount', 'duplicate']]);
    expect(r.total).toBe(150000000n);
    expect(r.valid).toBe(1);
  });
  it('BatchPayments shows totals and issues', () => {
    render(<BatchPayments rows={[{ name: 'Ana', address: ZS, amount: '2' }, { address: 'bad', amount: '1' }]} />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Invalid address')).toBeTruthy();
    expect(screen.getByText(/rows need attention/)).toBeTruthy();
  });
  it('BatchPaymentTable imports pasted CSV and removes controlled rows', () => {
    const onChange = vi.fn();
    render(<BatchPaymentTable rows={[{ name: 'Old', address: ZS, amount: '1' }]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Paste CSV'), { target: { value: `name,address,amount,memo\nAna,${ZS},2,Salary` } });
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    expect(onChange).toHaveBeenCalledWith([{ name: 'Ana', address: ZS, amount: '2', memo: 'Salary' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Remove 1' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
  it('BatchPaymentTable can append and rejects empty CSV imports', () => {
    const onChange = vi.fn();
    render(<BatchPaymentTable rows={[{ address: ZS, amount: '1' }]} onChange={onChange} importMode="append" />);
    const input = screen.getByLabelText('Paste CSV');
    fireEvent.change(input, { target: { value: 'name,address,amount' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    expect(screen.getByRole('alert').textContent).toBe('No payment rows found');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: `${T1},0.5` } });
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));
    expect(onChange).toHaveBeenCalledWith([{ address: ZS, amount: '1' }, { name: undefined, address: T1, amount: '0.5', memo: undefined }]);
  });
});
