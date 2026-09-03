"use client";

import Link from "next/link";
import { ArrowRight, Users, Globe2, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TeachersHero() {
  const { t, href } = useLanguage();
  const h = t("teachersPage.hero");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[34px] sm:text-[46px] leading-[1.15] font-semibold mb-5">
            {h.title1} <span className="text-blue">{h.title2}</span> {h.title3}
          </h1>
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-7">{h.lead}</p>
          <Link
            href={href("/signup")}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {h.cta} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="relative h-[260px] sm:h-[300px] flex items-center justify-center">
          <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full bg-gradient-to-br from-[#E4ECFF] to-goldSoft" />
          <div className="relative w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] rounded-full bg-white shadow-card flex items-center justify-center overflow-hidden">
            <img
              src="/images/Student6.jpeg"
              alt="Teacher"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
        <div className="bg-white border border-line rounded-lg shadow-card p-4 sm:p-5 text-center">
          <Users size={20} className="text-blue mx-auto mb-2" />
          <div className="font-serif text-[19px] sm:text-[22px] font-semibold">1.2k+</div>
          <div className="text-[11px] sm:text-[12px] text-muted mt-0.5">{h.stats.teachers}</div>
        </div>
        <div className="bg-white border border-line rounded-lg shadow-card p-4 sm:p-5 text-center">
          <Globe2 size={20} className="text-sageDeep mx-auto mb-2" />
          <div className="font-serif text-[19px] sm:text-[22px] font-semibold">40+</div>
          <div className="text-[11px] sm:text-[12px] text-muted mt-0.5">{h.stats.countries}</div>
        </div>
        <div className="bg-white border border-line rounded-lg shadow-card p-4 sm:p-5 text-center">
          <Star size={20} className="text-gold mx-auto mb-2" />
          <div className="font-serif text-[19px] sm:text-[22px] font-semibold">4.9</div>
          <div className="text-[11px] sm:text-[12px] text-muted mt-0.5">{h.stats.rating}</div>
        </div>
      </div>
    </section>
  );
}
