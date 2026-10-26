import { ACTIVITY, hexId, rng, walk } from '../../data';

export const BLOCKS = Array.from({ length: 24 }, (_, k) => ({
  height: 3120448 - k,
  hash: hexId(k + 3),
  txs: 2 + Math.floor(rng(k + 9)() * 40),
  size: Math.round(12 + rng(k + 2)() * 380),
  age: `${k * 2 + 1} min`,
  shieldedPct: Math.round(20 + rng(k + 5)() * 60),
}));

export const EXPLORER_TOKENS = [
  { symbol: 'ZEC', name: 'Zcash', supply: 16_200_000, holders: 1_240_000, shielded: 31.2, verified: true },
  { symbol: 'nZEC', name: 'Noir ZEC', supply: 4_870_000, holders: 82_400, shielded: 100, verified: true },
  { symbol: 'USDC', name: 'USD Coin', supply: 52_000_000, holders: 310_000, shielded: 0, verified: true },
  { symbol: 'BEAN', name: 'Shielded Coffee', supply: 1_000_000, holders: 1_240, shielded: 0, verified: false },
  { symbol: 'NOIR', name: 'Noir Points', supply: 100_000_000, holders: 24_800, shielded: 0, verified: false },
];

export const ANCHORS = Array.from({ length: 8 }, (_, k) => ({
  epoch: 1042 - k,
  root: hexId(k + 40),
  zcashTx: ACTIVITY[k % ACTIVITY.length]!.hash,
  height: 3120448 - k * 12,
  verified: k !== 2,
  time: `${k * 15 + 4} min ago`,
}));

export const txSeries = walk(7, 30, 4200, 0.2).map((v) => Math.round(v));
export const supplySeries = walk(3, 30, 4_200_000, 0.005, 0.001);
