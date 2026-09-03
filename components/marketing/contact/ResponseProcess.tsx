"use client";

import { Send, Search, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Send, Search, MessageSquare];

export default function ResponseProcess() {
  const { t } = useLanguage();
  const proc = t("contact.process");
  const items: { title: string; desc: string }[] = proc.items;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="text-center mb-9">
        <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold inline-block">{proc.heading}</h2>
        <div className="w-20 h-[3px] bg-gold rounded mx-auto mt-2.5" />
      </div>

      <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4.5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 thin-scroll" style={{ gap: 18 }}>
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div key={item.title} className="bg-white border border-line rounded-lg shadow-card p-5 shrink-0 w-[82%] sm:w-auto snap-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-[38px] h-[38px] rounded-full bg-blue text-white flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </div>
                <h4 className="text-[14.5px] font-bold">{item.title}</h4>
              </div>
              <p className="text-[12.5px] text-ink70 leading-relaxed ps-[50px]">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
