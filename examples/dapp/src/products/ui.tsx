import type { ReactNode } from 'react';
import { Cluster, Eyebrow } from '@nui3/react';

/** Shared small helpers for product pages (layout + formatting). */
export const usd = (v: number, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const compactUsd = (v: number) => `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v)}`;
export const num = (v: number, d = 2) => v.toLocaleString('en-US', { maximumFractionDigits: d });

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <Cluster justify="space-between" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--nui-border)' }}>
      <Eyebrow as="h2">{children}</Eyebrow>
      {aside}
    </Cluster>
  );
}

/** Responsive main/side layout without media queries: columns wrap when narrow. */
export function Split({ children, gap = 20 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'start' }}>{children}</div>;
}
export function Main({ children }: { children: ReactNode }) {
  return <div style={{ flex: '2 1 460px', minWidth: 0, display: 'grid', gap: 20 }}>{children}</div>;
}
export function Side({ children }: { children: ReactNode }) {
  return <div style={{ flex: '1 1 300px', minWidth: 0, display: 'grid', gap: 20 }}>{children}</div>;
}
