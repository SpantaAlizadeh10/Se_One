"use client";

import Link from "next/link";
import { ArrowRight, Play, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AboutHero() {
  const { t, href } = useLanguage();
  const levels: string[] = t("home.levels");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[48px] leading-[1.15] font-semibold mb-1">
            {t("about.hero.title1")} <span className="text-blue">{t("about.hero.title2")}</span>
          </h1>
          <div className="w-[74px] h-[3px] bg-gold rounded my-5" />
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-7">{t("about.hero.lead")}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={href("/signup")}
              className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
            >
              {t("common.startLearning")} <ArrowRight size={15} className="rtl:rotate-180" />
            </Link>
            <Link
              href={href("/courses")}
              className="inline-flex items-center gap-2 bg-white border border-line text-ink px-6 py-3.5 rounded-full text-[14px] font-semibold hover:border-ink transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-white">
                <Play size={11} fill="currentColor" />
              </span>
              {t("common.exploreCourses")}
            </Link>
          </div>
        </div>

        <div className="relative h-[280px] sm:h-[320px] flex items-center justify-center">
          <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full bg-gradient-to-br from-goldSoft to-peach" />
          <div className="relative w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] rounded-full bg-white shadow-card flex items-center justify-center overflow-hidden">
            <img src="/images/About.jpeg" alt="About" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white border border-line rounded-full shadow-card flex flex-wrap justify-center sm:justify-between px-3 py-2 gap-1">
        {levels.map((level) => (
          <div key={level} className="px-5 sm:px-7 py-2.5 text-[13.5px] font-semibold rounded-full text-center flex-1 text-ink70">
            {level}
          </div>
        ))}
      </div>
    </section>
  );
}
