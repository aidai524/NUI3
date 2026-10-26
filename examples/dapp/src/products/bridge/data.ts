import { rng } from '../../data';

export interface Route {
  from: string;
  to: string;
  fee: number;
  eta: string;
  dailyLimit: number;
  used: number;
  uptime: number;
}

export const ROUTES: Route[] = [
  { from: 'Zcash', to: 'Noir', fee: 0.1, eta: '~12 min', dailyLimit: 500, used: 182, uptime: 99.99 },
  { from: 'Noir', to: 'Zcash', fee: 0.1, eta: '~15 min', dailyLimit: 500, used: 96, uptime: 99.98 },
  { from: 'NEAR', to: 'Noir', fee: 0.05, eta: '~2 min', dailyLimit: 2_000_000, used: 640_000, uptime: 99.95 },
  { from: 'Noir', to: 'Ethereum', fee: 0.2, eta: '~20 min', dailyLimit: 1_000_000, used: 880_000, uptime: 99.72 },
  { from: 'Noir', to: 'Solana', fee: 0.15, eta: '~8 min', dailyLimit: 500_000, used: 120_000, uptime: 99.9 },
  { from: 'Bitcoin', to: 'Noir', fee: 0.25, eta: '~40 min', dailyLimit: 50, used: 12, uptime: 99.6 },
];

export interface Transfer {
  id: string;
  route: string;
  symbol: string;
  amount: string;
  usd: number;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed' | 'refunded';
  age: string;
  confirmations: number;
  required: number;
}

export const TRANSFERS: Transfer[] = [
  { id: 'br-1042', route: 'Zcash → Noir', symbol: 'ZEC', amount: '2.5', usd: 2379, status: 'confirming', age: '1 min', confirmations: 3, required: 10 },
  { id: 'br-1041', route: 'Noir → Zcash', symbol: 'ZEC', amount: '0.75', usd: 714, status: 'confirmed', age: '1 d', confirmations: 10, required: 10 },
  { id: 'br-1040', route: 'NEAR → Noir', symbol: 'USDC', amount: '1,200', usd: 1200, status: 'confirmed', age: '3 h', confirmations: 4, required: 4 },
  { id: 'br-1039', route: 'Noir → Ethereum', symbol: 'ETH', amount: '0.31', usd: 1305, status: 'refunded', age: '1 h', confirmations: 0, required: 12 },
  { id: 'br-1038', route: 'Noir → Solana', symbol: 'SOL', amount: '12', usd: 2189, status: 'failed', age: '2 d', confirmations: 0, required: 32 },
  { id: 'br-1037', route: 'Bitcoin → Noir', symbol: 'BTC', amount: '0.05', usd: 5620, status: 'confirmed', age: '3 d', confirmations: 6, required: 6 },
];

export const uptimeDays = (seed: number) => {
  const r = rng(seed);
  return Array.from({ length: 45 }, (_, k) => {
    const v = r();
    return { date: `2026-09-${String(12 + Math.floor(k / 2)).padStart(2, '0')}`, status: (v > 0.985 ? 'outage' : v > 0.94 ? 'degraded' : 'operational') as 'outage' | 'degraded' | 'operational' };
  });
};
