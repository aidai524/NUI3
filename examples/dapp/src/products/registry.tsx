import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ProductId } from './meta';

/** Each product module default-exports a component receiving the path after the product id. */
export interface ProductProps {
  /** e.g. ['pool', 'zec-usdc'] for #/dex/pool/zec-usdc; [] for the index. */
  path: string[];
}

export const REGISTRY: Record<ProductId, LazyExoticComponent<ComponentType<ProductProps>>> = {
  dex: lazy(() => import('./dex')),
  perps: lazy(() => import('./perps')),
  prediction: lazy(() => import('./prediction')),
  lending: lazy(() => import('./lending')),
  launchpad: lazy(() => import('./launchpad')),
  bridge: lazy(() => import('./bridge')),
  deploy: lazy(() => import('./deploy')),
  nft: lazy(() => import('./nft')),
  wallet: lazy(() => import('./wallet')),
  explorer: lazy(() => import('./explorer')),
  rpc: lazy(() => import('./rpc')),
  payroll: lazy(() => import('./payroll')),
};
