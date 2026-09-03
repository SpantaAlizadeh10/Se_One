"use client";

import Link from "next/link";
import { ArrowRight, Play, Check, GraduationCap, Users, Smile, Sparkle, BookOpen, TrendingUp, Award, Target } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Hero() {
  const { t, href } = useLanguage();
  const checklist: string[] = t("home.hero.checklist");
  const levels: string[] = t("home.levels");
  const levelDescriptions: string[] = t("home.levelDescriptions");

  const levelIcons = [BookOpen, TrendingUp, Award, Target];
  const levelColors = ["bg-green-100 text-green-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700"];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[48px] leading-[1.15] font-semibold mb-5">
            {t("home.hero.title1")}
            <br />
            {t("home.hero.title2").split(" ").map((word: string, i: number, arr: string[]) =>
              i === arr.length - 1 ? (
                <span key={i} className="text-blue">
                  {word}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[440px] mb-7">
            {t("home.hero.lead")}
          </p>

          <div className="flex flex-wrap gap-3 mb-7">
            <Link
              href={href("/signup")}
              className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
            >
              {t("common.startLearning")} <ArrowRight size={15} className="rtl:rotate-180" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 bg-white border border-line text-ink px-6 py-3.5 rounded-full text-[14px] font-semibold hover:border-ink transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-white">
                <Play size={11} fill="currentColor" />
              </span>
              {t("common.exploreCourses")}
            </a>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-2 text-[13.5px] font-medium text-ink70">
                <span className="w-5 h-5 rounded-full bg-blue text-white flex items-center justify-center shrink-0">
                  <Check size={12} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[320px] sm:h-[380px] flex items-center justify-center">
          <div className="absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full bg-gradient-to-br from-goldSoft to-peach" />
          <div className="relative w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-full bg-white shadow-card flex items-center justify-center">
            <GraduationCap size={64} className="text-blue" strokeWidth={1.4} />
          </div>
          <img
            src="/images/Hero.png"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          <div className="absolute top-2 sm:top-4 left-0 sm:left-2 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Users size={16} className="text-blue" />
            <div>
              <div className="text-[13px] font-bold leading-none">36k+</div>
              <div className="text-[10px] text-muted mt-1">{t("home.hero.stats.students")}</div>
            </div>
          </div>

          <div className="absolute top-16 sm:top-20 right-0 sm:right-2 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Sparkle size={16} className="text-gold" />
            <div>
              <div className="text-[13px] font-bold leading-none">100%</div>
              <div className="text-[10px] text-muted mt-1">{t("home.hero.stats.ages")}</div>
            </div>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Smile size={16} className="text-sageDeep" />
            <div>
              <div className="text-[13px] font-bold leading-none">89%</div>
              <div className="text-[10px] text-muted mt-1">{t("home.hero.stats.satisfied")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <h3 className="text-center font-serif text-[18px] sm:text-[20px] font-semibold mb-4 text-ink">
          {t("home.levelsTitle")}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {levels.map((level, i) => {
            const Icon = levelIcons[i];
            return (
              <div
                key={level}
                className="group bg-white border border-line rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-blue/20 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${levelColors[i]} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-serif text-[14px] sm:text-[15px] font-semibold text-ink mb-1.5">{level}</h4>
                <p className="text-[11px] sm:text-[12px] text-ink70 leading-relaxed">
                  {levelDescriptions[i]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}