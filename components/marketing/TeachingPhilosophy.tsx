"use client";

import {
  Lightbulb,
  Calendar,
  Grid2x2,
  User,
  MessageCircle,
  Target,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Lightbulb, Calendar, Grid2x2, User, MessageCircle, Target];

export default function TeachingPhilosophy() {
  const { t } = useLanguage();
  const items: { title: string; desc: string }[] = t("home.philosophy.items");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold mb-5 sm:mb-6">
        {t("home.philosophy.heading")}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div
              key={item.title}
              className="h-full bg-white border border-line rounded-lg p-3.5 sm:p-5 shadow-card"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E4ECFF] text-blue flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <h3 className="text-[13px] sm:text-[15px] font-semibold mb-1.5">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-ink70 leading-relaxed line-clamp-3">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
