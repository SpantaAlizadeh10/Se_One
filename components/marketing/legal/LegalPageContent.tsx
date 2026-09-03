"use client";

import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LegalPageContent({ pageKey }: { pageKey: "privacy" | "terms" }) {
  const { t } = useLanguage();
  const page = t(`legal.${pageKey}`);
  const disclaimer = t("legal.disclaimer");
  const sections: { heading: string; body: string }[] = page.sections;

  return (
    <main className="max-w-[760px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="font-serif text-[30px] sm:text-[36px] font-semibold mb-2">{page.title}</h1>
      <p className="text-[12.5px] text-muted mb-6">{page.lastUpdated}</p>

      <div className="flex items-start gap-2.5 bg-goldSoft/60 border border-gold/30 rounded-xl px-4 py-3 mb-8">
        <AlertTriangle size={16} className="text-goldDeep shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-ink70 leading-relaxed m-0">{disclaimer}</p>
      </div>

      <div className="flex flex-col gap-7">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="text-[17px] font-semibold mb-2">{s.heading}</h2>
            <p className="text-[13.5px] text-ink70 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
