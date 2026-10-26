import type { ReactNode } from 'react';
import { Breadcrumb, Display, Eyebrow, Lead, Shell, SubNav } from '@nui3/react';
import { useSettings, useT } from '../settings';
import { GROUPS, link, productById, type ProductId } from './meta';

export interface ProductShellProps {
  product: ProductId;
  /** Current sub-page id ('' = index). Detail pages pass the parent list id to highlight it. */
  page: string;
  /** Headline. Defaults to the product name. */
  title?: ReactNode;
  lead?: ReactNode;
  /** Right side of the headline row: stats, buttons, badges. */
  aside?: ReactNode;
  /** Breadcrumb tail for detail pages, e.g. [{ label: 'ZEC/USDC' }]. */
  crumbs?: Array<{ label: ReactNode; href?: string }>;
  /** Small title row for dense app screens (trading terminals). */
  compact?: boolean;
  children: ReactNode;
}

/** Common product frame: breadcrumb, headline, sub-navigation. Every product page renders inside it. */
export function ProductShell({ product, page, title, lead, aside, crumbs, compact, children }: ProductShellProps) {
  const { lang } = useSettings();
  const t = useT();
  const meta = productById(product)!;
  const L = (b: { en: string; zh: string }) => b[lang];
  return (
    <Shell style={{ paddingBottom: 96 }}>
      <div style={{ paddingTop: compact ? 20 : 32 }}>
        <Breadcrumb
          items={[
            { label: t('Home', '首页'), href: link() },
            { label: L(GROUPS[meta.group]) },
            { label: L(meta.name), href: crumbs?.length ? link(product) : undefined },
            ...(crumbs ?? []),
          ]}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'end', padding: compact ? '14px 0 18px' : '28px 0 28px' }}>
        <div style={{ minWidth: 0 }}>
          {!compact && <Eyebrow>{L(meta.name)} · Phase {meta.phase}</Eyebrow>}
          <Display size="s" style={{ marginTop: compact ? 0 : 12, fontSize: compact ? 30 : undefined }}>{title ?? L(meta.name)}</Display>
          {lead && !compact && <Lead style={{ marginTop: 12 }}>{lead}</Lead>}
        </div>
        {aside}
      </div>
      <SubNav
        aria-label={L(meta.name)}
        items={meta.pages.filter((s) => !s.hidden).map((s) => ({ label: L(s.label), href: link(product, s.id), current: s.id === page }))}
      />
      <div style={{ paddingTop: 28 }}>{children}</div>
    </Shell>
  );
}

/** Placeholder until a product module is implemented. */
export function ComingSoon({ product, path }: { product: ProductId; path: string[] }) {
  const t = useT();
  return (
    <ProductShell product={product} page={path[0] ?? ''}>
      <p className="nui-text-muted">{t('This product is being built.', '该产品正在开发中。')}</p>
    </ProductShell>
  );
}
