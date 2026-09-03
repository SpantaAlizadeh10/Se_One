"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white text-ink70 font-semibold hover:border-ink transition-colors ${
        compact ? "w-9 h-9 justify-center text-[11px]" : "px-3.5 py-2 text-[12.5px]"
      }`}
      aria-label="Toggle language"
    >
      <Languages size={14} />
      {!compact && (lang === "fa" ? "EN" : "فا")}
    </button>
  );
}
