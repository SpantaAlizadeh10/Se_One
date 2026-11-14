"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Check,
  GraduationCap,
  Languages,
  CalendarDays,
  Award,
  BookOpenCheck,
  MessageCircle,
  Search,
  UserRound,
  Baby,
  Target,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Hero() {
  const { t, href } = useLanguage();
  const router = useRouter();
  const [classQuery, setClassQuery] = useState("");
  const [classQueryMissing, setClassQueryMissing] = useState(false);
  const classQueryInput = useRef<HTMLInputElement>(null);
  const checklist: string[] = t("home.hero.checklist");
  const classFinder = t("home.classFinder");
  const levelTest = t("home.levelTest");
  const classTypes: { label: string; query: string; contact?: boolean }[] =
    classFinder.categories;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-12 items-center">
        <div className="text-center sm:text-start">
          <h1 className="mb-6 font-serif text-[36px] font-semibold leading-[1.28] sm:text-[48px]">
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
            <span className="text-goldDeep">{t("home.hero.german")}</span>
          </h1>
          <p className="mx-auto mb-7 max-w-[320px] whitespace-pre-line text-[15px] leading-[1.85] text-ink70 sm:mx-0 sm:max-w-[430px] sm:text-[16px]">
            {t("home.hero.lead")}
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-3 sm:justify-start">
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
              <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-ink">
                <Play size={11} fill="currentColor" />
              </span>
              {t("common.exploreCourses")}
            </a>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-x-7 gap-y-3 sm:mt-16 sm:justify-start">
            {checklist.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[13.5px] font-medium text-ink70"
              >
                <span className="w-5 h-5 rounded-full bg-gold text-white flex items-center justify-center shrink-0">
                  <Check size={12} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[320px] sm:h-[380px] flex items-center justify-center">
          <div className="absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full bg-gradient-to-br from-goldSoft to-peach" />
          <div className="relative w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-full bg-white shadow-card" />
          <Image
            src="/images/Hero.png"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="pointer-events-none object-contain"
          />

          <div className="absolute top-2 sm:top-4 left-0 sm:left-2 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Languages
              size={16}
              className="shrink-0 text-blue"
              aria-hidden="true"
            />
            <span className="max-w-[100px] text-[10px] font-semibold leading-snug text-ink">
              {t("home.hero.highlights.languages")}
            </span>
          </div>

          <div className="absolute top-16 sm:top-20 right-0 sm:right-2 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <CalendarDays
              size={16}
              className="shrink-0 text-goldDeep"
              aria-hidden="true"
            />
            <span className="max-w-[100px] text-[10px] font-semibold leading-snug text-ink">
              {t("home.hero.highlights.schedule")}
            </span>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 bg-white shadow-card rounded-2xl px-4 py-3 flex items-center gap-2.5">
            <Target
              size={16}
              className="shrink-0 text-sageDeep"
              aria-hidden="true"
            />
            <span className="max-w-[100px] text-[10px] font-semibold leading-snug text-ink">
              {t("home.hero.highlights.learning")}
            </span>
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
              if (!query) {
                setClassQueryMissing(true);
                classQueryInput.current?.focus();
                return;
              }

              router.push(href(`/courses?search=${encodeURIComponent(query)}`));
            }}
            className="flex w-full gap-2 sm:max-w-[500px]"
          >
            <label
              className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-full border bg-[#FAFAF8] px-4 py-3 transition-colors ${
                classQueryMissing
                  ? "border-amber-600 ring-2 ring-amber-500/20"
                  : "border-line"
              }`}
            >
              <Search size={17} className="shrink-0 text-blue" />
              <input
                ref={classQueryInput}
                type="search"
                value={classQuery}
                onChange={(event) => {
                  setClassQuery(event.target.value);
                  if (event.target.value.trim()) setClassQueryMissing(false);
                }}
                aria-invalid={classQueryMissing}
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
              Award,
              BookOpenCheck,
              UserRound,
              Baby,
              MessageCircle,
              GraduationCap,
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
