"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Testimonials() {
  const { t } = useLanguage();
  const items: { name: string; location: string; quote: string }[] = t("home.testimonials.items");
  const [start, setStart] = useState(0);
  const visible = 3;

  const prev = () => setStart((s) => (s - 1 + items.length) % items.length);
  const next = () => setStart((s) => (s + 1) % items.length);

  const shown = Array.from({ length: Math.min(visible, items.length) }, (_, i) => items[(start + i) % items.length]);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-2">{t("home.testimonials.heading")}</h2>
          <p className="text-ink70 text-[14px] max-w-[480px]">{t("home.testimonials.sub")}</p>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center text-ink70 hover:bg-cream"
          >
            <ChevronLeft size={16} className="rtl:rotate-180" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center hover:bg-blueDeep"
          >
            <ChevronRight size={16} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* mobile: horizontal snap-scroll through every testimonial */}
      <div className="flex sm:hidden gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 thin-scroll">
        {items.map((t2) => (
          <div key={t2.name} className="bg-white border border-line rounded-lg p-6 shadow-card relative shrink-0 w-[80%] snap-start">
            <Quote size={26} className="absolute top-5 end-5 text-gold/40" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-sage text-sageDeep flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="text-[14px] font-bold">{t2.name}</div>
                <div className="text-[12px] text-muted">{t2.location}</div>
              </div>
            </div>
            <p className="text-[13px] text-ink70 leading-relaxed">{t2.quote}</p>
          </div>
        ))}
      </div>

      {/* sm and up: paginated grid using the prev/next buttons above */}
      <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {shown.map((t2) => (
          <div key={t2.name} className="bg-white border border-line rounded-lg p-6 shadow-card relative">
            <Quote size={26} className="absolute top-5 end-5 text-gold/40" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-sage text-sageDeep flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="text-[14px] font-bold">{t2.name}</div>
                <div className="text-[12px] text-muted">{t2.location}</div>
              </div>
            </div>
            <p className="text-[13px] text-ink70 leading-relaxed">{t2.quote}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
