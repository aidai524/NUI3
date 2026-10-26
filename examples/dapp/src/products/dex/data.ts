import { rng, walk } from '../../data';

export interface Pool {
  id: string;
  base: string;
  quote: string;
  tvl: number;
  volume24h: number;
  fee: number;
  apr: number;
  seed: number;
}

export const POOLS: Pool[] = [
  { id: 'zec-usdc', base: 'ZEC', quote: 'USDC', tvl: 18_900_000, volume24h: 3_420_000, fee: 0.3, apr: 14.2, seed: 11 },
  { id: 'zec-near', base: 'ZEC', quote: 'NEAR', tvl: 4_120_000, volume24h: 680_000, fee: 0.3, apr: 21.8, seed: 22 },
  { id: 'usdc-usdt', base: 'USDC', quote: 'USDT', tvl: 9_600_000, volume24h: 2_150_000, fee: 0.05, apr: 6.4, seed: 33 },
  { id: 'eth-usdc', base: 'ETH', quote: 'USDC', tvl: 6_300_000, volume24h: 1_240_000, fee: 0.3, apr: 11.5, seed: 44 },
  { id: 'bean-usdc', base: 'BEAN', quote: 'USDC', tvl: 320_000, volume24h: 96_000, fee: 1, apr: 62.3, seed: 55 },
];

export const apyHistory = (seed: number) => walk(seed, 30, 12, 0.12, 0.004).map((v) => Math.max(0.5, v));
export const volumeHistory = (seed: number) => walk(seed + 3, 30, 900_000, 0.25).map((v) => Math.round(v));
export const tvlHistory = (seed: number) => walk(seed + 7, 30, 12_000_000, 0.03, 0.002);

export interface DexToken {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  liquidity: number;
  seed: number;
  verified: boolean;
}

export const DEX_TOKENS: DexToken[] = [
  { symbol: 'ZEC', name: 'Zcash', price: 951.63, change: 2.41, volume: 3_420_000, liquidity: 18_900_000, seed: 5, verified: true },
  { symbol: 'USDC', name: 'USD Coin', price: 1, change: 0.01, volume: 2_150_000, liquidity: 9_600_000, seed: 8, verified: true },
  { symbol: 'NEAR', name: 'NEAR', price: 3.12, change: 1.08, volume: 680_000, liquidity: 4_120_000, seed: 13, verified: true },
  { symbol: 'ETH', name: 'Ether', price: 4210, change: 0.86, volume: 1_240_000, liquidity: 6_300_000, seed: 21, verified: true },
  { symbol: 'BEAN', name: 'Shielded Coffee', price: 0.42, change: 18.4, volume: 96_000, liquidity: 320_000, seed: 34, verified: false },
  { symbol: 'NOIR', name: 'Noir Points', price: 2.18, change: -3.2, volume: 210_000, liquidity: 1_100_000, seed: 55, verified: false },
];

export const poolPriceSeries = (seed: number) => walk(seed, 60, 1, 0.02, 0.001);
