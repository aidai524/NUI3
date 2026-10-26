// Zcash address detection. Format + checksum checks only; this never replaces
// validation by the wallet SDK / node before funds are sent.

export type ZcashNetwork = 'mainnet' | 'testnet' | 'regtest';
export type ZcashAddressKind = 'unified' | 'sapling' | 'transparent' | 'tex' | 'sprout';

export interface AddressInfo {
  kind: ZcashAddressKind;
  network: ZcashNetwork;
  /** true = address can receive into a shielded pool */
  shielded: boolean;
  /** Bech32/Bech32m checksum result. `null` = not checked (base58 transparent). */
  checksum: boolean | null;
}

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_CONST = 1;
const BECH32M_CONST = 0x2bc830a3;

function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= GEN[i]!;
  }
  return chk >>> 0;
}

/** Verify a bech32 / bech32m string. Unified addresses exceed BIP-173's 90-char limit, so no length cap here. */
export function verifyBech32(addr: string, variant: 'bech32' | 'bech32m'): boolean {
  if (addr !== addr.toLowerCase() && addr !== addr.toUpperCase()) return false;
  const s = addr.toLowerCase();
  const pos = s.lastIndexOf('1');
  if (pos < 1 || pos + 7 > s.length) return false;
  const hrp = s.slice(0, pos);
  const data: number[] = [];
  for (const c of s.slice(pos + 1)) {
    const d = CHARSET.indexOf(c);
    if (d === -1) return false;
    data.push(d);
  }
  const expanded = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
  return polymod([...expanded, ...data]) === (variant === 'bech32' ? BECH32_CONST : BECH32M_CONST);
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

const RULES: Array<{ test: (s: string) => boolean; kind: ZcashAddressKind; network: ZcashNetwork; variant?: 'bech32' | 'bech32m' }> = [
  { test: (s) => /^u1[02-9ac-hj-np-z]{100,}$/.test(s), kind: 'unified', network: 'mainnet', variant: 'bech32m' },
  { test: (s) => /^utest1[02-9ac-hj-np-z]{100,}$/.test(s), kind: 'unified', network: 'testnet', variant: 'bech32m' },
  { test: (s) => /^uregtest1[02-9ac-hj-np-z]{100,}$/.test(s), kind: 'unified', network: 'regtest', variant: 'bech32m' },
  { test: (s) => /^zs1[02-9ac-hj-np-z]{75}$/.test(s), kind: 'sapling', network: 'mainnet', variant: 'bech32' },
  { test: (s) => /^ztestsapling1[02-9ac-hj-np-z]{75}$/.test(s), kind: 'sapling', network: 'testnet', variant: 'bech32' },
  { test: (s) => /^zregtestsapling1[02-9ac-hj-np-z]{75}$/.test(s), kind: 'sapling', network: 'regtest', variant: 'bech32' },
  { test: (s) => /^tex1[02-9ac-hj-np-z]{38}$/.test(s), kind: 'tex', network: 'mainnet', variant: 'bech32m' },
  { test: (s) => /^textest1[02-9ac-hj-np-z]{38}$/.test(s), kind: 'tex', network: 'testnet', variant: 'bech32m' },
  { test: (s) => /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/.test(s), kind: 'transparent', network: 'mainnet' },
  { test: (s) => /^t[m2][1-9A-HJ-NP-Za-km-z]{33}$/.test(s), kind: 'transparent', network: 'testnet' },
  { test: (s) => /^zc[1-9A-HJ-NP-Za-km-z]{93}$/.test(s) && BASE58.test(s), kind: 'sprout', network: 'mainnet' },
];

/** Detect address kind and network. Returns null for anything that is not a Zcash address. */
export function parseAddress(input: string): AddressInfo | null {
  const s = input.trim();
  const lower = s.toLowerCase();
  for (const r of RULES) {
    const candidate = r.variant ? lower : s;
    if (!r.test(candidate)) continue;
    if (r.variant && s !== lower && s !== s.toUpperCase()) return null; // mixed case is invalid bech32
    return {
      kind: r.kind,
      network: r.network,
      shielded: r.kind === 'unified' || r.kind === 'sapling' || r.kind === 'sprout',
      checksum: r.variant ? verifyBech32(lower, r.variant) : null,
    };
  }
  return null;
}

export const addressKind = (addr: string) => parseAddress(addr)?.kind ?? null;
export const isShieldedAddress = (addr: string) => parseAddress(addr)?.shielded ?? false;

/** Valid format, valid checksum (when checkable), optional network match. Sprout is rejected (deprecated). */
export function isValidAddress(addr: string, network?: ZcashNetwork): boolean {
  const info = parseAddress(addr);
  if (!info || info.kind === 'sprout' || info.checksum === false) return false;
  return !network || info.network === network;
}

export const ADDRESS_KIND_LABEL: Record<ZcashAddressKind, string> = {
  unified: 'Unified',
  sapling: 'Sapling',
  transparent: 'Transparent',
  tex: 'TEX',
  sprout: 'Sprout',
};

/** "u1abcd…wxyz". Keeps the prefix readable for unified/sapling addresses. */
export function truncateMiddle(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
