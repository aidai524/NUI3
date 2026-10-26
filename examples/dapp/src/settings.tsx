import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LocaleProvider } from '@nui3/react';

export type Lang = 'en' | 'zh';
export type ThemeChoice = 'paper' | 'night' | 'jade';

interface Settings {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  /** Wallet privacy mode: mask balances everywhere. */
  hideBalances: boolean;
  setHideBalances: (v: boolean) => void;
}

const Ctx = createContext<Settings | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(`nui3-example:${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, v: unknown) => {
  try {
    localStorage.setItem(`nui3-example:${key}`, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const params = new URLSearchParams(location.search);
  const [lang, setLang] = useState<Lang>(() => (params.get('lang') as Lang) || read('lang', 'en'));
  const [theme, setTheme] = useState<ThemeChoice>(() => (params.get('theme') as ThemeChoice) || read('theme', 'paper'));
  const [hideBalances, setHideBalances] = useState(() => read('hide', false));

  useEffect(() => { write('lang', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; }, [lang]);
  useEffect(() => { write('theme', theme); document.documentElement.dataset.nuiTheme = theme; }, [theme]);
  useEffect(() => write('hide', hideBalances), [hideBalances]);

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, hideBalances, setHideBalances }), [lang, theme, hideBalances]);
  return (
    <Ctx.Provider value={value}>
      <LocaleProvider locale={lang}>{children}</LocaleProvider>
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings outside SettingsProvider');
  return ctx;
}

/** Inline bilingual copy: const t = useT(); t('Swap', '兑换'). */
export function useT() {
  const { lang } = useSettings();
  return (en: string, zh: string) => (lang === 'zh' ? zh : en);
}
