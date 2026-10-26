import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../utils/cx.js';
import { CloseIcon } from './icons.js';
import { IconButton } from './actions.js';
import { useNuiLocale } from './i18n.js';

/* ------------------------------------------------------------ Dialog
   Native <dialog>: focus trap, Escape and inert background come from the browser. */

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Max width in px. Default 480. */
  width?: number;
  /** Close when clicking the backdrop. Default true. Turn off for signing / confirmation steps. */
  dismissible?: boolean;
  className?: string;
}
export function Dialog({ open, onClose, title, children, footer, width, dismissible = true, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { m } = useNuiLocale();
  const titleId = `nui-dialog-${useId()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      if (typeof el.showModal === 'function') el.showModal();
      else el.setAttribute('open', '');
    } else if (!open && el.open) {
      if (typeof el.close === 'function') el.close();
      else el.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cx('nui-dialog', className)}
      style={width ? ({ '--nui-dialog-w': `${width}px` } as CSSProperties) : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <>
          <header className="nui-dialog__head">
            <h2 id={titleId} className="nui-dialog__title">{title}</h2>
            <IconButton label={m.close} onClick={onClose}><CloseIcon /></IconButton>
          </header>
          <div className="nui-dialog__body">{children}</div>
          {footer && <footer className="nui-dialog__foot">{footer}</footer>}
        </>
      )}
    </dialog>
  );
}

/* ------------------------------------------------------------ Toast */

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: 'neutral' | 'positive' | 'negative';
  /** ms. 0 = sticky. Default 5000 (negative: sticky). */
  duration?: number;
  action?: ReactNode;
}
interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<{ toast: (t: ToastOptions) => number; dismiss: (id: number) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { m } = useNuiLocale();
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (t: ToastOptions) => {
      const id = ++seq.current;
      setItems((list) => [...list.slice(-4), { ...t, id }]);
      const duration = t.duration ?? (t.tone === 'negative' ? 0 : 5000);
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="nui-toaster" role="region" aria-label={m.notifications} aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx('nui-toast', t.tone && t.tone !== 'neutral' && `nui-toast--${t.tone}`)} role={t.tone === 'negative' ? 'alert' : 'status'}>
            <div className="nui-toast__body">
              <div className="nui-toast__title">{t.title}</div>
              {t.description && <div className="nui-toast__desc">{t.description}</div>}
              {t.action}
            </div>
            <IconButton label={m.dismiss} size="sm" onClick={() => dismiss(t.id)}><CloseIcon size={12} /></IconButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
