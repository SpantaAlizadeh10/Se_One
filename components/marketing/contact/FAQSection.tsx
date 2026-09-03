"use client";

import { GraduationCap, CreditCard, Calendar, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [GraduationCap, CreditCard, Calendar];

export default function FAQSection() {
  const { t } = useLanguage();
  const faq = t("contact.faq");
  const items: { q: string; a: string }[] = faq.items;

  return (
    <section id="faq" className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="text-center mb-9">
        <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold inline-block">{faq.heading}</h2>
        <div className="w-20 h-[3px] bg-gold rounded mx-auto mt-2.5" />
      </div>

      <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4.5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 thin-scroll" style={{ gap: 18 }}>
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div
              key={item.q}
              className="bg-white border border-line rounded-lg shadow-card p-5 flex gap-3.5 items-start shrink-0 w-[82%] sm:w-auto snap-start"
            >
              <div className="w-[38px] h-[38px] rounded-full bg-blue text-white flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-[14.5px] font-bold mb-1.5 leading-snug">{item.q}</h4>
                <p className="text-[12.5px] text-ink70 leading-relaxed">{item.a}</p>
              </div>
              <ChevronRight size={16} className="text-ink70 shrink-0 rtl:rotate-180" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
