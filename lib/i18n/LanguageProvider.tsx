"use client";

import { createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { dictionary } from "./dictionary";
import type { Locale } from "./locales";
import { stripLocale, withLocale } from "./paths";

type Ctx = {
  lang: Locale;
  dir: "rtl" | "ltr";
  setLang: (l: Locale) => void;
  toggleLang: () => void;
  /** Prefix a locale-agnostic path (e.g. "/dashboard") with the current locale. */
  href: (path: string) => string;
  t: (path: string) => any;
};

const LanguageContext = createContext<Ctx | null>(null);

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

const LOCALE_COOKIE = "se-one-lang";

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = initialLang;

  const setLang = useCallback(
    (l: Locale) => {
      if (typeof document !== "undefined") {
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000`;
      }
      const agnosticPath = stripLocale(pathname || "/");
      router.push(withLocale(l, agnosticPath));
    },
    [pathname, router]
  );

  const toggleLang = useCallback(() => {
    setLang(lang === "fa" ? "en" : "fa");
  }, [lang, setLang]);

  const href = useCallback((path: string) => withLocale(lang, path), [lang]);

  const t = useCallback(
    (path: string) => {
      const value = getByPath(dictionary[lang], path);
      return value !== undefined ? value : path;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === "fa" ? "rtl" : "ltr", setLang, toggleLang, href, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
