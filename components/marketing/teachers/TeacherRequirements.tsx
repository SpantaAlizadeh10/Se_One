"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TeacherRequirements() {
  const { t } = useLanguage();
  const r = t("teachersPage.requirements");
  const items: string[] = r.items;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="bg-white border border-line rounded-lg shadow-card p-6 sm:p-9 max-w-[720px] mx-auto">
        <h2 className="font-serif text-[22px] sm:text-[24px] font-semibold mb-6 text-center">{r.heading}</h2>
        <ul className="flex flex-col gap-3.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 size={19} className="text-sageDeep shrink-0 mt-0.5" />
              <span className="text-[13.5px] text-ink70 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
