"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Check,
  GraduationCap,
  Users,
  Smile,
  Sparkle,
  Award,
  MessageCircle,
  Search,
  Monitor,
  MapPin,
  WifiOff,
  UserRound,
  Baby,
  Target,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Hero() {
  const { t, href } = useLanguage();
  const router = useRouter();
  const [classQuery, setClassQuery] = useState("");
  const checklist: string[] = t("home.hero.checklist");
  const classFinder = t("home.classFinder");
  const levelTest = t("home.levelTest");
  const classTypes: { label: string; query: string; contact?: boolean }[] =
    classFinder.categories;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[48px] leading-[1.15] font-semibold mb-5">
            {t("home.hero.title1")}
            <br />
            {t("home.hero.title2")
              .split(" ")
              .map((word: string, i: number, arr: string[]) =>
                i === arr.length - 1 ? (
                  <span key={i} className="text-blue">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                ),
              )}{" "}
            <span className="text-ink">/</span>{" "}
            <span className="text-gold">{t("home.hero.german")}</span>
          </h1>
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[440px] mb-7">
            {t("home.hero.lead")}
          </p>

          <div className="flex flex-wrap gap-3 mb-7">
            <Link
              href={href("/signup")}
              className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
            >
              {t("common.startLearning")}{" "}
              <ArrowRight size={15} className="rtl:rotate-180" />
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
              <div
                key={item}
                className="flex items-center gap-2 text-[13.5px] font-medium text-ink70"
              >
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
              <div className="text-[10px] text-muted mt-1">
                {t("home.hero.stats.students")}
              </div>
            </div>
          </div>

          <div className="absolute top-16 sm:top-20 right-0 sm:right-2 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Sparkle size={16} className="text-gold" />
            <div>
              <div className="text-[13px] font-bold leading-none">100%</div>
              <div className="text-[10px] text-muted mt-1">
                {t("home.hero.stats.ages")}
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Smile size={16} className="text-sageDeep" />
            <div>
              <div className="text-[13px] font-bold leading-none">89%</div>
              <div className="text-[10px] text-muted mt-1">
                {t("home.hero.stats.satisfied")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 rounded-2xl border border-line bg-white p-5 sm:p-8 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-serif text-[20px] sm:text-[24px] font-semibold text-ink">
            {classFinder.title}
          </h3>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const query = classQuery.trim();
              if (query) {
                router.push(
                  href(`/courses?search=${encodeURIComponent(query)}`),
                );
              }
            }}
            className="flex w-full gap-2 sm:max-w-[500px]"
          >
            <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-[#FAFAF8] px-4 py-3">
              <Search size={17} className="shrink-0 text-blue" />
              <input
                type="search"
                value={classQuery}
                onChange={(event) => setClassQuery(event.target.value)}
                placeholder={classFinder.placeholder}
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
              />
            </label>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-blue px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-blueDeep"
            >
              {classFinder.search}
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-xl bg-[#F3F6FF] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue shadow-sm">
              <Target size={22} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-ink">
                {levelTest.title}
              </h4>
              <p className="mt-1 text-[12px] leading-relaxed text-ink70">
                {levelTest.description}
              </p>
            </div>
          </div>
          <Link
            href={href("/contact")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-semibold text-blue shadow-sm transition-colors hover:bg-blue hover:text-white"
          >
            {levelTest.cta}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {classTypes.map((category, index) => {
            const Icon = [
              Monitor,
              MapPin,
              WifiOff,
              Award,
              UserRound,
              Baby,
              MessageCircle,
            ][index];
            const destination = category.contact
              ? href("/contact")
              : href(`/courses?search=${encodeURIComponent(category.query)}`);

            return (
              <Link
                key={category.label}
                href={destination}
                className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-[#FAFAF8] px-3 py-4 text-center transition-all hover:border-blue/30 hover:bg-blue/5 hover:shadow-sm"
              >
                <Icon
                  size={21}
                  className="text-blue transition-transform group-hover:-translate-y-0.5"
                />
                <span className="text-[12px] font-semibold text-ink">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
