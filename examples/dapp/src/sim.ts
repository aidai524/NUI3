// Simulated live data. Everything is deterministic at load, then drifts in real time.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BookLevel, Candle } from '@nui3/react';
import { rng } from './data';

export type MarketId = 'ZEC' | 'BTC' | 'ETH' | 'NEAR' | 'SOL';
export const MARKET_START: Record<MarketId, number> = { ZEC: 951.63, BTC: 112400, ETH: 4210, NEAR: 3.12, SOL: 182.4 };
const VOL: Record<MarketId, number> = { ZEC: 0.0018, BTC: 0.0009, ETH: 0.0012, NEAR: 0.0025, SOL: 0.002 };

type Listener = () => void;
const state = { prices: { ...MARKET_START }, open: { ...MARKET_START }, history: Object.fromEntries(Object.keys(MARKET_START).map((k) => [k, [] as number[]])) as Record<MarketId, number[]> };
const listeners = new Set<Listener>();
let timer: ReturnType<typeof setInterval> | undefined;
const live = rng(Date.now() % 100000);

function tick() {
  for (const id of Object.keys(state.prices) as MarketId[]) {
    const p = state.prices[id] * (1 + (live() - 0.5) * 2 * VOL[id]);
    state.prices[id] = Number(p.toFixed(id === 'NEAR' ? 4 : 2));
    const h = state.history[id];
    h.push(state.prices[id]);
    if (h.length > 120) h.shift();
  }
  state.prices = { ...state.prices };
  listeners.forEach((l) => l());
}

/** Live prices for all markets, updated every 2s while any component listens. */
export function usePrices(): Record<MarketId, number> {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    if (!timer) timer = setInterval(tick, 2000);
    return () => {
      listeners.delete(l);
      if (!listeners.size && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  }, []);
  return state.prices;
}

/** Live price and 24h change % for one market. */
export function usePrice(id: MarketId) {
  const prices = usePrices();
  const price = prices[id];
  return { price, change: ((price - state.open[id]) / state.open[id]) * 100 + 2.41 * (id === 'ZEC' ? 1 : 0.4) };
}

/** Deterministic 24h history (for sparklines) ending at the live price. */
export function useHistory(id: MarketId, points = 48) {
  const { price } = usePrice(id);
  const base = useMemo(() => {
    const r = rng(id.charCodeAt(0) * 97 + points);
    const out: number[] = [];
    let p = MARKET_START[id] * 0.975;
    for (let k = 0; k < points - 1; k++) {
      p *= 1 + (r() - 0.47) * VOL[id] * 6;
      out.push(p);
    }
    return out;
  }, [id, points]);
  return [...base, price];
}

/** Order book around the live price; reshuffles every tick. */
export function useOrderBook(id: MarketId, levels = 14) {
  const { price } = usePrice(id);
  return useMemo(() => {
    const r = rng(Math.round(price * 100));
    const tickSize = price > 1000 ? 0.5 : price > 10 ? 0.05 : 0.0005;
    const half = tickSize * (1 + Math.floor(r() * 2));
    const bids: BookLevel[] = [];
    const asks: BookLevel[] = [];
    for (let k = 0; k < levels; k++) {
      const size = (0.2 + r() * (k + 1) * 0.9) * (price > 1000 ? 1 : price > 10 ? 8 : 400);
      bids.push([Number((price - half - k * tickSize).toFixed(4)), Number(size.toFixed(3))]);
      asks.push([Number((price + half + k * tickSize).toFixed(4)), Number((size * (0.7 + r() * 0.6)).toFixed(3))]);
    }
    return { bids, asks };
  }, [price, levels]);
}

export interface SimTrade {
  id: number;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  time: string;
}
/** Rolling trade tape for a market. */
export function useTrades(id: MarketId, max = 14): SimTrade[] {
  const { price } = usePrice(id);
  const seq = useRef(0);
  const [trades, setTrades] = useState<SimTrade[]>(() => {
    const r = rng(id.charCodeAt(0));
    return Array.from({ length: max }, (_, k) => ({ id: -k - 1, side: r() > 0.5 ? 'buy' : 'sell', price: MARKET_START[id] * (1 + (r() - 0.5) * 0.002), size: Number((r() * 4).toFixed(3)), time: `${12 + Math.floor(k / 6)}:${String(59 - k * 3).padStart(2, '0')}` }));
  });
  useEffect(() => {
    const r = rng(Math.round(price * 1000));
    const n = 1 + Math.floor(r() * 2);
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setTrades((list) => [
      ...Array.from({ length: n }, () => ({ id: ++seq.current, side: (r() > 0.5 ? 'buy' : 'sell') as 'buy' | 'sell', price: price * (1 + (r() - 0.5) * 0.0006), size: Number((r() * 3).toFixed(3)), time })),
      ...list,
    ].slice(0, max));
  }, [price, max]);
  return trades;
}

/** OHLCV candles: deterministic history + a live last candle. */
export function useCandles(id: MarketId, count = 72, intervalLabel: (k: number) => string = (k) => `${k % 24}:00`): Candle[] {
  const { price } = usePrice(id);
  const history = useMemo(() => {
    const r = rng(id.charCodeAt(0) * 31 + count);
    const out: Candle[] = [];
    let c = MARKET_START[id] * 0.94;
    for (let k = 0; k < count - 1; k++) {
      const o = c;
      c = o * (1 + (r() - 0.48) * VOL[id] * 9);
      const h = Math.max(o, c) * (1 + r() * VOL[id] * 3);
      const l = Math.min(o, c) * (1 - r() * VOL[id] * 3);
      out.push({ t: intervalLabel(k), o, h, l, c, v: Math.round(200 + r() * 1800) });
    }
    return out;
  }, [id, count, intervalLabel]);
  const prev = history[history.length - 1]!;
  const last: Candle = { t: intervalLabel(count - 1), o: prev.c, h: Math.max(prev.c, price), l: Math.min(prev.c, price), c: price, v: 640 };
  return [...history, last];
}

/** Walk a transaction through pending → confirming (n/required) → confirmed. */
export function useTxProgress(required = 10, stepMs = 2500, start = 0) {
  const [confirmations, setConfirmations] = useState(start);
  useEffect(() => {
    if (confirmations >= required) return;
    const t = setTimeout(() => setConfirmations((c) => c + 1), stepMs);
    return () => clearTimeout(t);
  }, [confirmations, required, stepMs]);
  const status = confirmations === 0 ? 'pending' : confirmations < required ? 'confirming' : 'confirmed';
  return { confirmations, required, status: status as 'pending' | 'confirming' | 'confirmed', restart: () => setConfirmations(0) };
}

/** Block height that advances every ~75s (scaled to 8s for the demo). */
export function useBlockHeight(start = 3120448) {
  const [h, setH] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setH((x) => x + 1), 8000);
    return () => clearInterval(id);
  }, []);
  return h;
}
