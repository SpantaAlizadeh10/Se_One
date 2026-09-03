"use client";

import { Lightbulb, Calendar, Grid2x2, User, MessageCircle, Target, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Lightbulb, Calendar, Grid2x2, User, MessageCircle, Target];

export default function TeachingPhilosophy() {
  const { t } = useLanguage();
  const items: { title: string; desc: string }[] = t("home.philosophy.items");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-8">{t("home.philosophy.heading")}</h2>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div key={item.title} className="bg-white border border-line rounded-lg p-6 shadow-card">
              <div className="w-11 h-11 rounded-xl bg-[#E4ECFF] text-blue flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="text-[16px] font-semibold mb-2">{item.title}</h3>
              <p className="text-[13px] text-ink70 leading-relaxed mb-5">{item.desc}</p>
              <button className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink70 hover:bg-cream transition-colors">
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
