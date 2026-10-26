import type { TokenInfo } from '@nui3/react';

// Sample data only. Addresses have valid formats/checksums but are randomly generated.
export const ADDR = {
  unified: 'u1837xcp6kck48hmfev3tmpkzw3zt67a4un8x5eey6xqg0e3sz00heer0k66fw0xrzy29crs7hagd0eymzc50trrwefgaj3xnptd3yydytv8z44v2h55hnvjf4fdvyvqmgq9aa2hrugvhe6',
  sapling: 'zs1x5tes5a4cwhyf28xznre0wfgqn4g4txy0gksm8f4s3lwd2szuhv6d0fjj5w90qrqwvczqcqv5km',
  sapling2: 'zs1h9fhkrm879cse2gmnp2kxkrmj2e9ze3uvg2ndyn5p26m04hmvlcyp4fnrzp67x8lz52uwm53pwd',
  tex: 'tex172fud9m57gtrrjht4vjnjh4h7hxcrtc2uhg930',
  transparent: 't1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU',
};

export const TOKENS: TokenInfo[] = [
  { symbol: 'ZEC', name: 'Zcash', decimals: 8, balance: 1284500000n, chain: 'Zcash' },
  { symbol: 'nZEC', name: 'Noir ZEC', decimals: 8, balance: 420000000n, chain: 'Noir' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: 2500120000n, chain: 'Noir' },
  { symbol: 'NEAR', name: 'NEAR', decimals: 24, balance: 18200000000000000000000000n, chain: 'NEAR' },
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8, balance: 0n, chain: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ether', decimals: 18, balance: 310000000000000000n, chain: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana', decimals: 9, chain: 'Solana' },
];

export const PRICES: Record<string, number> = { ZEC: 951.63, nZEC: 951.63, USDC: 1, NEAR: 3.12, BTC: 112400, ETH: 4210, SOL: 182.4 };

export type ExplorerRow = {
  hash: string;
  kind: 'Bridge in' | 'Swap' | 'Lend' | 'Bridge out' | 'Deploy';
  privacy: 'shielded' | 'confidential' | 'public';
  amount: bigint;
  symbol: string;
  status: 'confirmed' | 'confirming' | 'pending' | 'failed' | 'refunded';
  height: number;
  age: string;
};

export const ACTIVITY: ExplorerRow[] = [
  { hash: '46e768905750424dadd650ca6163eadd8a018dd6f1b7f5e11c511b173d1bd5f2', kind: 'Bridge in', privacy: 'shielded', amount: 250000000n, symbol: 'ZEC', status: 'confirming', height: 3120448, age: '1 min' },
  { hash: 'fd9cef7d8927b18cb97aba9389e4714dcc9b60d4d0cba6afa2bec895afb8e32f', kind: 'Swap', privacy: 'confidential', amount: 1200000000n, symbol: 'USDC', status: 'confirmed', height: 3120441, age: '9 min' },
  { hash: '6c87167ee9fc14f4215a93a47d6657b5f3b119285b9df6144f10bdd89ba216a9', kind: 'Lend', privacy: 'confidential', amount: 500000000n, symbol: 'nZEC', status: 'confirmed', height: 3120430, age: '24 min' },
  { hash: '3bba07d162123f18758f16148dfd35e181285e431355a609cd148ae35b8c9af9', kind: 'Bridge out', privacy: 'public', amount: 310000000000000000n, symbol: 'ETH', status: 'refunded', height: 3120402, age: '1 h' },
  { hash: '6160e71016eae51babedc6d2ea91d7af4ceb5274199b915c14781c9625ca8c27', kind: 'Deploy', privacy: 'public', amount: 1000000000000000n, symbol: 'TKN', status: 'failed', height: 3120377, age: '2 h' },
];

export const MARKETS = [
  { symbol: 'nZEC', supplyApy: 3.8, borrowApy: 6.2, supplied: 182_400, utilization: 61, ltv: 65 },
  { symbol: 'USDC', supplyApy: 5.1, borrowApy: 7.4, supplied: 12_850_000, utilization: 78, ltv: 80 },
  { symbol: 'NEAR', supplyApy: 2.4, borrowApy: 4.9, supplied: 3_120_000, utilization: 44, ltv: 60 },
  { symbol: 'ETH', supplyApy: 1.9, borrowApy: 3.6, supplied: 1_480, utilization: 38, ltv: 75 },
];

export const TRADES = [
  { id: 't1', side: 'buy' as const, price: 951.63, amount: 2.5, age: '12 s' },
  { id: 't2', side: 'sell' as const, price: 951.2, amount: 0.84, age: '41 s' },
  { id: 't3', side: 'buy' as const, price: 951.44, amount: 12.0, age: '1 min' },
  { id: 't4', side: 'buy' as const, price: 950.97, amount: 1.1, age: '2 min' },
  { id: 't5', side: 'sell' as const, price: 950.6, amount: 5.35, age: '4 min' },
];

export const BRIDGE_HISTORY = [
  { id: 'b1', route: 'Zcash → Noir', amount: 250000000n, symbol: 'ZEC', status: 'confirming' as const, age: '1 min' },
  { id: 'b2', route: 'Noir → Ethereum', amount: 310000000000000000n, symbol: 'ETH', status: 'refunded' as const, age: '1 h' },
  { id: 'b3', route: 'NEAR → Noir', amount: 1200000000n, symbol: 'USDC', status: 'confirmed' as const, age: '3 h' },
  { id: 'b4', route: 'Noir → Zcash', amount: 75000000n, symbol: 'ZEC', status: 'confirmed' as const, age: '1 d' },
];

/* ------------------------------------------------------------ shared helpers for every product */

export const CHAINS = [
  { name: 'Zcash', privacy: 'shielded' as const },
  { name: 'Noir', privacy: 'confidential' as const },
  { name: 'NEAR', privacy: 'public' as const },
  { name: 'Ethereum', privacy: 'public' as const },
  { name: 'Solana', privacy: 'public' as const },
  { name: 'Bitcoin', privacy: 'public' as const },
];

export const DECIMALS: Record<string, number> = { ...Object.fromEntries(TOKENS.map((t) => [t.symbol, t.decimals])), TKN: 6 };

/** Deterministic PRNG so mock data is stable across reloads. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Deterministic 64-char hex id. */
export function hexId(seed: number, len = 64) {
  const r = rng(seed * 7919 + 17);
  return Array.from({ length: len }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
}

/** Short day labels going back N days from 2026-10-26. */
export function dayLabels(n: number, end = Date.UTC(2026, 9, 26)) {
  return Array.from({ length: n }, (_, k) => {
    const d = new Date(end - (n - 1 - k) * 86400000);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  });
}

/** Random-walk series for charts. */
export function walk(seed: number, n: number, start: number, vol = 0.02, drift = 0) {
  const r = rng(seed);
  const out = [start];
  for (let k = 1; k < n; k++) out.push(Math.max(out[k - 1]! * (1 + drift + (r() - 0.5) * 2 * vol), start * 0.05));
  return out;
}
