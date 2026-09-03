"use client";

import { FileText, ShieldCheck, CalendarDays, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [FileText, ShieldCheck, CalendarDays, Video];

export default function TeacherSteps() {
  const { t } = useLanguage();
  const s = t("teachersPage.steps");
  const items: { title: string; desc: string }[] = s.items;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <h2 className="font-serif text-[26px] sm:text-[30px] font-semibold mb-8">{s.heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div key={item.title} className="relative bg-white border border-line rounded-lg shadow-card p-5">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center shrink-0 text-[13px] font-bold">
                  {i + 1}
                </div>
                <Icon size={18} className="text-blue" />
              </div>
              <h3 className="text-[14.5px] font-semibold mb-1.5">{item.title}</h3>
              <p className="text-[12.5px] text-ink70 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
