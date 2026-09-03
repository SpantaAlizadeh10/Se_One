"use client";

import { Lightbulb, Search, ClipboardCheck, Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Lightbulb, Search, ClipboardCheck, Leaf];

export default function FeatureCards() {
  const { t } = useLanguage();
  const features: { title: string; desc: string }[] = t("home.features");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 thin-scroll">
        {features.map((card, i) => {
          const Icon = icons[i];
          return (
            <div
              key={card.title}
              className="bg-[#EDEAE0] rounded-lg p-6 text-center shrink-0 w-[78%] sm:w-auto snap-start"
            >
              <div className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center mx-auto mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-serif text-[16.5px] font-semibold mb-2">{card.title}</h3>
              <p className="text-[13px] text-ink70 leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
