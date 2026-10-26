import { describe, expect, it } from 'vitest';
import {
  formatUnits, parseUnits, tryParseUnits, formatAmount, sanitizeAmountInput, zatoshiToZec, zecToZatoshi,
  parseAddress, isValidAddress, isShieldedAddress, truncateMiddle, verifyBech32,
  memoByteLength, truncateMemo, encodeMemoBase64Url, buildPaymentUri,
} from '../src/utils/index.js';
import { encode } from './bech32.js';

const UA = encode('u', 135, 'bech32m');
const ZS = encode('zs', 75 - 6, 'bech32');
const TEX = encode('tex', 38 - 6, 'bech32m');
const T1 = 't1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU';

describe('units', () => {
  it('formats and parses exactly', () => {
    expect(formatUnits(123450000n, 8)).toBe('1.2345');
    expect(formatUnits(-1n, 8)).toBe('-0.00000001');
    expect(formatUnits('2100000000000000', 8)).toBe('21000000');
    expect(parseUnits('1.2345', 8)).toBe(123450000n);
    expect(parseUnits('.5', 8)).toBe(50000000n);
    expect(parseUnits('1,000.1', 8)).toBe(100010000000n);
    expect(zecToZatoshi('0.00000001')).toBe(1n);
    expect(zatoshiToZec(100000000n)).toBe('1');
  });
  it('rejects bad input', () => {
    expect(() => parseUnits('1.123456789', 8)).toThrow(/decimals/);
    expect(() => parseUnits('abc', 8)).toThrow();
    expect(() => formatUnits(0.5, 8)).toThrow();
    expect(tryParseUnits('', 8)).toBeNull();
  });
  it('never shows dust as zero', () => {
    expect(formatAmount(1n)).toBe('<0.0001');
    expect(formatAmount(0n)).toBe('0');
    expect(formatAmount(123456789012n)).toBe('1,234.5678');
    expect(formatAmount(123456789012n, { exact: true })).toBe('1,234.56789012');
    expect(formatAmount(150000000n, { minFractionDigits: 2 })).toBe('1.50');
  });
  it('sanitizes typed amounts', () => {
    expect(sanitizeAmountInput('1,5', 8)).toBe('1.5');
    expect(sanitizeAmountInput('00012.3.4', 8)).toBe('12.34');
    expect(sanitizeAmountInput('0.123456789', 8)).toBe('0.12345678');
    expect(sanitizeAmountInput('abc', 8)).toBe('');
  });
});

describe('address', () => {
  it('detects kinds and verifies checksums', () => {
    expect(parseAddress(UA)).toEqual({ kind: 'unified', network: 'mainnet', shielded: true, checksum: true });
    expect(parseAddress(ZS)).toMatchObject({ kind: 'sapling', shielded: true, checksum: true });
    expect(parseAddress(TEX)).toMatchObject({ kind: 'tex', shielded: false, checksum: true });
    expect(parseAddress(T1)).toMatchObject({ kind: 'transparent', network: 'mainnet', checksum: null });
    expect(parseAddress('0xabc')).toBeNull();
  });
  it('rejects corrupted checksums and mixed case', () => {
    const bad = ZS.slice(0, -1) + (ZS.endsWith('q') ? 'p' : 'q');
    expect(isValidAddress(bad)).toBe(false);
    expect(verifyBech32(UA, 'bech32')).toBe(false);
    expect(parseAddress(ZS.slice(0, 10).toUpperCase() + ZS.slice(10))).toBeNull();
  });
  it('helpers', () => {
    expect(isShieldedAddress(UA)).toBe(true);
    expect(isShieldedAddress(T1)).toBe(false);
    expect(isValidAddress(UA, 'testnet')).toBe(false);
    expect(truncateMiddle('u1abcdefghijklmnopqrstuvwxyz', 6, 4)).toBe('u1abcd…wxyz');
    expect(truncateMiddle('short')).toBe('short');
  });
});

describe('memo', () => {
  it('counts UTF-8 bytes and truncates safely', () => {
    expect(memoByteLength('ZEC')).toBe(3);
    expect(memoByteLength('隐私')).toBe(6);
    expect(memoByteLength(truncateMemo('😀'.repeat(200)))).toBeLessThanOrEqual(512);
    expect(truncateMemo('😀😀', 5)).toBe('😀');
    expect(encodeMemoBase64Url('Thanks!')).toBe('VGhhbmtzIQ');
  });
});

describe('zip321', () => {
  it('builds single and multi payment URIs', () => {
    expect(buildPaymentUri({ address: ZS, amount: '1.5', memo: 'Thanks!', message: 'Order #1' })).toBe(`zcash:${ZS}?amount=1.5&memo=VGhhbmtzIQ&message=Order%20%231`);
    expect(buildPaymentUri({ address: T1 })).toBe(`zcash:${T1}`);
    expect(buildPaymentUri([{ address: ZS, amount: '1' }, { address: T1, amount: '0.5' }])).toBe(`zcash:?address=${ZS}&amount=1&address.1=${T1}&amount.1=0.5`);
  });
  it('enforces protocol rules', () => {
    expect(() => buildPaymentUri({ address: T1, memo: 'hi' })).toThrow(/shielded/);
    expect(() => buildPaymentUri({ address: ZS, amount: '1.123456789' })).toThrow(/amount/);
    expect(() => buildPaymentUri({ address: 'nope' })).toThrow();
  });
});
