"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function EnglishLevel() {
  const { t, href } = useLanguage();
  const lv = t("coursesPage.level");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold mb-2">{lv.heading}</h2>
      <div className="w-16 h-[3px] bg-gold rounded mb-7" />

      <div className="bg-white rounded-lg shadow-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 items-center">
        <div>
          <span className="block text-blue font-bold text-[12px] uppercase tracking-wide mb-2.5">{lv.eyebrow}</span>
          <h3 className="text-[22px] font-semibold mb-3.5">{lv.title}</h3>
          <p className="text-ink70 text-[13.5px] leading-relaxed max-w-[340px] mb-5">{lv.lead}</p>
          <Link
            href={href("/contact")}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {lv.cta} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl p-5 sm:p-4 text-center bg-[#EDEAE0]">
            <h4 className="text-[16px] sm:text-[13px] font-bold mb-1 sm:mb-0.5">{lv.beginner}</h4>
            <div className="text-[13px] sm:text-[11px] text-ink70 mb-4 sm:mb-3.5">A1 - A2</div>
            <div className="flex items-end justify-center gap-1.5 sm:gap-1 h-8 sm:h-6">
              <span className="w-2 sm:w-1.5 rounded h-[10px] sm:h-2 bg-[#8D8567]" />
              <span className="w-2 sm:w-1.5 rounded h-[18px] sm:h-3.5 bg-[#8D8567]" />
              <span className="w-2 sm:w-1.5 rounded h-3 sm:h-2.5 bg-[#8D8567]" />
            </div>
          </div>
          <div className="rounded-2xl p-5 sm:p-4 text-center bg-[#F3E0DE]">
            <h4 className="text-[16px] sm:text-[13px] font-bold mb-1 sm:mb-0.5">{lv.intermediate}</h4>
            <div className="text-[13px] sm:text-[11px] text-ink70 mb-4 sm:mb-3.5">B1 - B2</div>
            <div className="flex items-end justify-center gap-1.5 sm:gap-1 h-8 sm:h-6">
              <span className="w-2 sm:w-1.5 rounded h-3 sm:h-2.5 bg-[#A85C50]" />
              <span className="w-2 sm:w-1.5 rounded h-6 sm:h-[18px] bg-[#A85C50]" />
              <span className="w-2 sm:w-1.5 rounded h-[18px] sm:h-3.5 bg-[#A85C50]" />
            </div>
          </div>
          <div className="rounded-2xl p-5 sm:p-4 text-center bg-[#E2E6EF]">
            <h4 className="text-[16px] sm:text-[13px] font-bold mb-1 sm:mb-0.5">{lv.advanced}</h4>
            <div className="text-[13px] sm:text-[11px] text-ink70 mb-4 sm:mb-3.5">C1 - C2</div>
            <div className="flex items-end justify-center gap-1.5 sm:gap-1 h-8 sm:h-6">
              <span className="w-2 sm:w-1.5 rounded h-4 sm:h-3 bg-ink70" />
              <span className="w-2 sm:w-1.5 rounded h-7 sm:h-[22px] bg-ink70" />
              <span className="w-2 sm:w-1.5 rounded h-[22px] sm:h-[17px] bg-ink70" />
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-line flex items-center justify-center py-6 sm:py-0">
            <Target size={40} className="text-blue" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </section>
  );
}
