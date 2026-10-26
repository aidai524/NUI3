import { useEffect, useId, useRef, useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from './actions.js';
import { Drawer } from './content.js';
import { ChevronIcon, MenuIcon } from './icons.js';
import { cx } from '../utils/cx.js';
import { useNuiLocale } from './i18n.js';

/* ------------------------------------------------------------ Zcash mark
   Official media-kit geometry. Rules: do not recolor, outline, stretch or rotate;
   when used as a link it points to https://z.cash/; your product name must be more prominent. */

export interface ZcashMarkProps extends Omit<HTMLAttributes<SVGSVGElement>, 'children'> {
  size?: number;
  /** "color" = gold disc + white Z. "mono" = Z only in currentColor (for dark backgrounds). */
  variant?: 'color' | 'mono';
  title?: string;
}
export function ZcashMark({ size = 40, variant = 'color', title, className, ...rest }: ZcashMarkProps) {
  const z = 'M8.591,0V5.146H0v6.2H13.33L0,28.974v4.667H8.591v5.113H13.87V33.641H22.46v-6.2H9.131L22.46,9.813V5.146H13.87V0Z';
  return (
    <svg viewBox="0 0 65 65" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...rest}>
      {title && <title>{title}</title>}
      <g transform="translate(-138 -41)">
        {variant === 'color' && <circle cx="32.5" cy="32.5" r="32.5" transform="translate(138 41)" fill="#f3b724" />}
        <path d={z} transform="translate(159 54)" fill={variant === 'color' ? '#fff' : 'currentColor'} />
      </g>
    </svg>
  );
}

export interface BrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Your product name. Must not contain "Zcash" (trademark policy). */
  name: ReactNode;
  /** Product logo. Falls back to the Zcash mark ("works with Zcash"). */
  logo?: ReactNode;
  /** Secondary label, e.g. "Bridge" or "Explorer". */
  sub?: ReactNode;
}
export function Brand({ name, logo, sub, href = '/', className, ...rest }: BrandProps) {
  return (
    <a href={href} className={cx('nui-brand', className)} {...rest}>
      <span className="nui-brand__mark">{logo ?? <ZcashMark size={40} />}</span>
      <span className="nui-brand__name">{name}</span>
      {sub && <span className="nui-brand__sub">{sub}</span>}
    </a>
  );
}

/* ------------------------------------------------------------ Header */

export interface NavItem {
  label: ReactNode;
  href: string;
  current?: boolean;
  /** One-line description, shown in dropdowns and the mobile drawer. */
  description?: ReactNode;
  /** Children turn the item into a dropdown group (full-width panel). */
  children?: NavItem[];
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  brand: ReactNode;
  nav?: NavItem[];
  /** Right side: wallet button, network switch, theme toggle. */
  actions?: ReactNode;
  sticky?: boolean;
  bordered?: boolean;
  /** Render nav links with your router, e.g. Next.js <Link>. */
  renderLink?: (item: NavItem, props: { className: string; 'aria-current'?: 'page'; onClick?: () => void }) => ReactNode;
  /** Extra controls shown at the bottom of the mobile drawer (theme, language). */
  mobileActions?: ReactNode;
  /** Title of the mobile drawer. */
  menuLabel?: string;
}

const isCurrent = (item: NavItem): boolean => Boolean(item.current || item.children?.some(isCurrent));

function NavGroup({ item, renderLink }: { item: NavItem; renderLink?: HeaderProps['renderLink'] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="nui-nav__group" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="nui-nav__link nui-nav__trigger" aria-expanded={open} aria-controls={id} data-current={isCurrent(item) || undefined} onClick={() => setOpen((o) => !o)} onMouseEnter={() => setOpen(true)}>
        {item.label}
        <ChevronIcon />
      </button>
      <div id={id} className="nui-nav__panel" hidden={!open}>
        {item.children!.map((child, k) => {
          const props = { className: 'nui-nav__item', 'aria-current': child.current ? ('page' as const) : undefined, onClick: () => setOpen(false) };
          const body = (
            <>
              <span className="nui-nav__item-label">{child.label}</span>
              {child.description && <span className="nui-nav__item-desc">{child.description}</span>}
            </>
          );
          return renderLink ? <span key={k}>{renderLink({ ...child, label: body }, props)}</span> : <a key={k} href={child.href} {...props}>{body}</a>;
        })}
      </div>
    </div>
  );
}

export function Header({ brand, nav = [], actions, sticky, bordered, renderLink, mobileActions, menuLabel, className, ...rest }: HeaderProps) {
  const { m } = useNuiLocale();
  const [drawer, setDrawer] = useState(false);
  const link = (item: NavItem, className: string, onClick?: () => void, key?: number) => {
    const props = { className, 'aria-current': item.current ? ('page' as const) : undefined, onClick };
    return renderLink ? <span key={key}>{renderLink(item, props)}</span> : <a key={key} href={item.href} {...props}>{item.label}</a>;
  };
  return (
    <header className={cx('nui-header', sticky && 'nui-header--sticky', bordered && 'nui-header--bordered', className)} {...rest}>
      <div className="nui-shell nui-header__inner">
        {brand}
        {nav.length > 0 && (
          <nav className="nui-nav" aria-label={m.primaryNav}>
            {nav.map((item, i) => (item.children?.length ? <NavGroup key={i} item={item} renderLink={renderLink} /> : link(item, 'nui-nav__link', undefined, i)))}
          </nav>
        )}
        {actions && <div className="nui-header__actions">{actions}</div>}
        {nav.length > 0 && (
          <IconButton className="nui-header__menu" label={m.menu} aria-expanded={drawer} onClick={() => setDrawer(true)}><MenuIcon /></IconButton>
        )}
      </div>
      {nav.length > 0 && (
        <Drawer open={drawer} onClose={() => setDrawer(false)} title={menuLabel ?? m.menu} footer={mobileActions}>
          <nav className="nui-mobile-nav" aria-label={m.primaryNav}>
            {nav.map((item, i) =>
              item.children?.length ? (
                <div key={i} className="nui-mobile-nav__group">
                  <div className="nui-mobile-nav__title">{item.label}</div>
                  {item.children.map((c, k) => link(c, 'nui-mobile-nav__link', () => setDrawer(false), k))}
                </div>
              ) : (
                link(item, 'nui-mobile-nav__link', () => setDrawer(false), i)
              ),
            )}
          </nav>
        </Drawer>
      )}
    </header>
  );
}

/* ------------------------------------------------------------ Breadcrumb */

export function Breadcrumb({ items, className }: { items: Array<{ label: ReactNode; href?: string }>; className?: string }) {
  const { m } = useNuiLocale();
  return (
    <nav aria-label={m.breadcrumb}>
      <ol className={cx('nui-breadcrumb', className)}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return <li key={i}>{last || !item.href ? <span aria-current={last ? 'page' : undefined}>{item.label}</span> : <a href={item.href}>{item.label}</a>}</li>;
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------ Footer */

export const DEFAULT_DISCLAIMER = 'Not affiliated with the Zcash Foundation or Electric Coin Company.';

export interface FooterColumn {
  title: ReactNode;
  links: Array<{ label: ReactNode; href: string }>;
}
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode;
  tagline?: ReactNode;
  columns?: FooterColumn[];
  /** Left side of the legal row, e.g. "© 2026 Noir · Terms · Privacy". */
  legal?: ReactNode;
  /**
   * Trademark disclaimer. Always rendered — you may reword it, not remove it.
   * Defaults to the Zcash trademark-policy wording.
   */
  disclaimer?: ReactNode;
}
export function Footer({ brand, tagline, columns = [], legal, disclaimer, className, style, ...rest }: FooterProps) {
  const { m } = useNuiLocale();
  return (
    <footer className={cx('nui-footer', className)} style={{ '--nui-footer-cols': Math.max(columns.length, 1), ...style } as React.CSSProperties} {...rest}>
      <div className="nui-shell">
        <div className="nui-footer__grid">
          <div>
            {brand ?? <a href="https://z.cash/" aria-label="Zcash"><ZcashMark size={40} /></a>}
            {tagline && <p className="nui-footer__tagline">{tagline}</p>}
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h3 className="nui-footer__title">{col.title}</h3>
              <ul className="nui-footer__links">
                {col.links.map((l, j) => <li key={j}><a href={l.href}>{l.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="nui-footer__legal">
          <span>{legal}</span>
          <span>{disclaimer || m.disclaimer || DEFAULT_DISCLAIMER}</span>
        </div>
      </div>
    </footer>
  );
}
