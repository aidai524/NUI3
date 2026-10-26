import { walk } from '../../data';

export interface PerpMarket {
  id: string;
  symbol: 'ZEC' | 'BTC' | 'ETH' | 'NEAR' | 'SOL';
  maxLeverage: number;
  funding: number;
  openInterest: number;
  volume24h: number;
  seed: number;
}

export const PERP_MARKETS: PerpMarket[] = [
  { id: 'zec-perp', symbol: 'ZEC', maxLeverage: 20, funding: 0.012, openInterest: 8_400_000, volume24h: 12_600_000, seed: 3 },
  { id: 'btc-perp', symbol: 'BTC', maxLeverage: 50, funding: 0.004, openInterest: 42_000_000, volume24h: 96_000_000, seed: 9 },
  { id: 'eth-perp', symbol: 'ETH', maxLeverage: 50, funding: -0.002, openInterest: 31_000_000, volume24h: 64_000_000, seed: 17 },
  { id: 'near-perp', symbol: 'NEAR', maxLeverage: 20, funding: 0.021, openInterest: 2_100_000, volume24h: 4_800_000, seed: 27 },
  { id: 'sol-perp', symbol: 'SOL', maxLeverage: 20, funding: 0.008, openInterest: 6_800_000, volume24h: 18_000_000, seed: 39 },
];

export const fundingHistory = (seed: number) => walk(seed, 48, 0.01, 0.6).map((v) => Number((v - 0.01).toFixed(4)));
export const pnlHistory = (seed: number) => walk(seed, 30, 4200, 0.08, 0.004);
