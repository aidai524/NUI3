import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../utils/cx.js';

/* ------------------------------------------------------------ Field
   Wires label / hint / error to the control via context: ids, aria-describedby
   and aria-invalid are set automatically on Input, Textarea, Select, TokenAmountInput, MemoInput. */

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);
export const useField = () => useContext(FieldContext);

export interface FieldProps {
  label: ReactNode;
  /** Right side of the label row, e.g. balance or "Max". */
  labelAside?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
  /** Hide the label visually (keeps it for screen readers). Never omit the label entirely. */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}
export function Field({ label, labelAside, hint, error, id, hideLabel, className, children }: FieldProps) {
  const auto = useId();
  const controlId = id ?? `nui-field-${auto}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{ id: controlId, describedBy, invalid: Boolean(error) }}>
      <div className={cx('nui-field', className)}>
        <div className={cx('nui-field__row', hideLabel && 'nui-sr-only')}>
          <label className="nui-field__label" htmlFor={controlId}>{label}</label>
          {labelAside}
        </div>
        {children}
        {error && <p id={errorId} className="nui-field__error" role="alert">{error}</p>}
        {hint && <p id={hintId} className="nui-field__hint">{hint}</p>}
      </div>
    </FieldContext.Provider>
  );
}

/** Merge Field context into control props. */
export function useFieldProps<P extends { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: unknown }>(props: P): P {
  const field = useField();
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    'aria-describedby': [props['aria-describedby'], field.describedBy].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
  };
}

/* ------------------------------------------------------------ controls */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Monospace, for addresses, hashes, keys. */
  mono?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ mono, className, ...rest }, ref) {
  const props = useFieldProps(rest);
  return <input ref={ref} className={cx('nui-input', mono && 'nui-input--mono', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  const props = useFieldProps(rest);
  return <textarea ref={ref} className={cx('nui-textarea', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  const props = useFieldProps(rest);
  return <select ref={ref} className={cx('nui-select', className)} {...props} />;
});

export interface InputGroupProps extends InputProps {
  start?: ReactNode;
  end?: ReactNode;
}
/** Input with leading/trailing addons, e.g. unit suffix "%" or "ZEC". */
export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(function InputGroup({ start, end, className, ...rest }, ref) {
  return (
    <div className={cx('nui-input-group', className)}>
      {start && <span className="nui-input-group__addon">{start}</span>}
      <Input ref={ref} {...rest} />
      {end && <span className="nui-input-group__addon">{end}</span>}
    </div>
  );
});

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Accessible label (rendered visually hidden). */
  label: string;
  /** Focus on "/" and clear on Escape. Default true. */
  shortcut?: boolean;
  onClear?: () => void;
}
/** Underline search used in filter bars. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ label, shortcut = true, onClear, className, onKeyDown, ...rest }, ref) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const id = useId();
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inner.current?.focus();
        inner.current?.select();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);
  return (
    <div className={cx('nui-search', className)}>
      <label className="nui-sr-only" htmlFor={id}>{label}</label>
      <input
        ref={inner}
        id={id}
        type="search"
        autoComplete="off"
        spellCheck={false}
        className="nui-search__input"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClear?.();
            inner.current?.blur();
          }
          onKeyDown?.(e);
        }}
        {...rest}
      />
      {shortcut && <kbd className="nui-search__hint" aria-hidden="true">/</kbd>}
    </div>
  );
});

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  className?: string;
}
export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  const id = useId();
  return (
    <span className={cx('nui-cluster', className)} style={{ gap: 12 }}>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} className="nui-switch" onClick={() => onChange(!checked)} />
      <label htmlFor={id} className="nui-text-small">{label}</label>
    </span>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, ...rest }, ref) {
  return (
    <label className={cx('nui-check', className)}>
      <input ref={ref} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
});
