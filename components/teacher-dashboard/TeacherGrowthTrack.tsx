"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Check,
  Crown,
  LockKeyhole,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getTeacherProgression,
  type TeacherAnalytics,
  type TeacherProgression,
  type TeacherTier,
} from "@/lib/api/teacher-dashboard";

const PREVIEW_TIERS: TeacherTier[] = [
  {
    level: 1,
    name: "Starter",
    minCompletedClasses: 0,
    minAverageRating: 0,
    minClassCompletionRate: 0,
    teacherSharePercent: null,
    benefits: [],
  },
  {
    level: 2,
    name: "Growing",
    minCompletedClasses: 25,
    minAverageRating: 4.6,
    minClassCompletionRate: 90,
    teacherSharePercent: null,
    benefits: [],
  },
  {
    level: 3,
    name: "Expert",
    minCompletedClasses: 100,
    minAverageRating: 4.8,
    minClassCompletionRate: 95,
    teacherSharePercent: null,
    benefits: [],
  },
];

const icons = [Sparkles, TrendingUp, Crown];

export default function TeacherGrowthTrack({
  analytics,
}: {
  analytics: TeacherAnalytics | null;
}) {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [serverProgress, setServerProgress] =
    useState<TeacherProgression | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getTeacherProgression(lang)
      .then((progress) => {
        if (active) setServerProgress(progress);
      })
      .catch(() => {
        if (active) setServerProgress(null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [lang]);

  const completedClasses =
    serverProgress?.completedClasses ?? analytics?.completedClasses ?? 0;
  const averageRating =
    serverProgress?.averageRating ?? analytics?.averageRating ?? 0;
  const classCompletionRate =
    serverProgress?.classCompletionRate ?? analytics?.classCompletionRate ?? 0;
  const tiers = serverProgress?.tiers.length
    ? serverProgress.tiers
    : PREVIEW_TIERS;
  const computedLevel = tiers.reduce<number>((level, tier) => {
    const qualifies =
      completedClasses >= tier.minCompletedClasses &&
      averageRating >= tier.minAverageRating &&
      classCompletionRate >= tier.minClassCompletionRate;
    return qualifies ? Math.max(level, tier.level) : level;
  }, 1) as 1 | 2 | 3;
  const currentLevel = serverProgress?.currentLevel ?? computedLevel;
  const currentTier =
    tiers.find((tier) => tier.level === currentLevel) ?? tiers[0];
  const nextTier = tiers.find((tier) => tier.level === currentLevel + 1);
  const classProgress = nextTier
    ? Math.min(
        100,
        (completedClasses / Math.max(1, nextTier.minCompletedClasses)) * 100,
      )
    : 100;
  const ratingProgress =
    nextTier && nextTier.minAverageRating > 0
      ? Math.min(100, (averageRating / nextTier.minAverageRating) * 100)
      : 100;
  const completionProgress =
    nextTier && nextTier.minClassCompletionRate > 0
      ? Math.min(
          100,
          (classCompletionRate / nextTier.minClassCompletionRate) * 100,
        )
      : 100;
  const progress = nextTier
    ? Math.min(classProgress, ratingProgress, completionProgress)
    : 100;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(fa ? "fa-IR" : "en-US", {
      maximumFractionDigits: 1,
    }).format(value);
  const titles = fa
    ? ["شروع", "رشد", "استاد"]
    : ["Starter", "Rising", "Expert"];
  const benefitSuggestions = fa
    ? [
        "ابزارهای پایه‌ی مدیریت کلاس و دانش‌آموز",
        "سهم بیشتر از کلاس‌ها و دیده‌شدن بهتر",
        "دسترسی زودتر به ابزارها و پشتیبانی اولویت‌دار",
      ]
    : [
        "Core class and student management tools",
        "Higher class share and more student visibility",
        "Early access to tools and priority support",
      ];

  const copyForTier = (tier: TeacherTier) => {
    const requirement = [
      tier.minCompletedClasses > 0 &&
        `${formatNumber(tier.minCompletedClasses)} ${fa ? "کلاس تکمیل‌شده" : "completed classes"}`,
      tier.minAverageRating > 0 &&
        `${formatNumber(tier.minAverageRating)} ${fa ? "امتیاز" : "rating"}`,
      tier.minClassCompletionRate > 0 &&
        `${formatNumber(tier.minClassCompletionRate)}% ${fa ? "تکمیل کلاس‌ها" : "class completion"}`,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      requirement ||
      (fa
        ? "پروفایل تأییدشده و شروع تدریس"
        : "Approved profile and first teaching steps")
    );
  };

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-[#DCE4FA] bg-gradient-to-br from-white via-[#F7F8FF] to-[#F2F9F6] shadow-card">
      <div className="flex flex-col gap-4 border-b border-blue/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9EDFF] text-blue">
            <Award size={23} />
          </div>
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.14em] text-blue">
              {fa ? "مسیر پیشرفت مدرس" : "TEACHER GROWTH PATH"}
            </p>
            <h2 className="mb-1 mt-1 text-[17px] font-semibold">
              {fa
                ? `سطح ${currentLevel}: ${titles[currentLevel - 1]}`
                : `Level ${currentLevel}: ${titles[currentLevel - 1]}`}
            </h2>
            <p className="m-0 text-[11px] text-muted">
              {fa
                ? "با کیفیت ثابت و کلاس‌های موفق، مرحله به مرحله جلو برو."
                : "Build consistency and successful classes to move up, one step at a time."}
            </p>
          </div>
        </div>
        {currentTier?.teacherSharePercent != null ? (
          <div className="rounded-xl border border-sage/60 bg-white px-4 py-3 sm:min-w-48">
            <div className="text-[10px] font-semibold text-muted">
              {fa ? "سهم فعلی شما از هر کلاس" : "YOUR CURRENT CLASS SHARE"}
            </div>
            <div className="mt-1 text-[24px] font-bold text-sageDeep">
              {formatNumber(currentTier.teacherSharePercent)}%
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gold/30 bg-white px-4 py-3 text-[10px] leading-5 text-ink70 sm:max-w-56">
            {fa
              ? "درصد سهم هر سطح پس از تنظیم سیاست پرداخت در سرور نمایش داده می‌شود؛ عددی حدس زده نشده است."
              : "Each level’s revenue share will appear when payout rules are configured on the server. No rate is guessed here."}
          </div>
        )}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {tiers.map((tier, index) => {
          const Icon = icons[index] ?? LockKeyhole;
          const isActive = tier.level === currentLevel;
          const isUnlocked = tier.level < currentLevel;
          const benefits = tier.benefits;
          return (
            <article
              key={tier.level}
              className={`relative rounded-xl border p-4 transition-colors ${isActive ? "border-blue/40 bg-white shadow-[0_6px_20px_rgba(50,76,160,0.08)]" : isUnlocked ? "border-sage/70 bg-sage/20" : "border-line bg-white/70"}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? "bg-blue/10 text-blue" : isUnlocked ? "bg-sage text-sageDeep" : "bg-cream text-muted"}`}
                >
                  <Icon size={17} />
                </span>
                {isActive ? (
                  <span className="rounded-full bg-blue/10 px-2 py-1 text-[9px] font-bold text-blue">
                    {fa ? "سطح فعلی" : "CURRENT"}
                  </span>
                ) : isUnlocked ? (
                  <Check size={16} className="text-sageDeep" />
                ) : (
                  <LockKeyhole size={14} className="text-muted" />
                )}
              </div>
              <h3 className="mb-1 mt-0 text-[14px] font-semibold">
                {titles[tier.level - 1] || tier.name}
              </h3>
              <p className="mb-3 mt-0 min-h-8 text-[10px] leading-4 text-muted">
                {copyForTier(tier)}
              </p>
              {tier.teacherSharePercent != null && (
                <p className="mb-2 mt-0 text-[11px] font-bold text-sageDeep">
                  {formatNumber(tier.teacherSharePercent)}%{" "}
                  {fa ? "سهم مدرس" : "teacher share"}
                </p>
              )}
              {benefits.length > 0 ? (
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {benefits.map((benefit, benefitIndex) => (
                    <li
                      key={`${benefit}-${benefitIndex}`}
                      className="flex items-start gap-1.5 text-[10px] leading-4 text-ink70"
                    >
                      <Check
                        size={12}
                        className="mt-0.5 shrink-0 text-sageDeep"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-[10px] leading-4 text-muted">
                  {benefitSuggestions[tier.level - 1]}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-white/80 p-4 sm:mx-5 sm:mb-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold">
            {nextTier
              ? fa
                ? `قدم بعدی: ${titles[nextTier.level - 1]}`
                : `Next: ${titles[nextTier.level - 1]}`
              : fa
                ? "به بالاترین سطح رسیده‌ای!"
                : "You reached the top level!"}
          </span>
          <span className="text-muted">
            {nextTier
              ? `${formatNumber(completedClasses)} / ${formatNumber(nextTier.minCompletedClasses)} ${fa ? "کلاس" : "classes"}`
              : `${formatNumber(completedClasses)} ${fa ? "کلاس تکمیل‌شده" : "classes completed"}`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue to-[#6A82D6] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextTier && (
          <p className="mb-0 mt-2 text-[10px] text-muted">
            {fa
              ? `میانگین امتیاز: ${formatNumber(averageRating)} / ${formatNumber(nextTier.minAverageRating)} · تکمیل کلاس: ${formatNumber(classCompletionRate)}% / ${formatNumber(nextTier.minClassCompletionRate)}%`
              : `Rating: ${formatNumber(averageRating)} / ${formatNumber(nextTier.minAverageRating)} · Class completion: ${formatNumber(classCompletionRate)}% / ${formatNumber(nextTier.minClassCompletionRate)}%`}
          </p>
        )}
        {loaded && !serverProgress && (
          <p className="mb-0 mt-2 text-[9.5px] leading-4 text-goldDeep">
            {fa
              ? "این معیارها پیش‌نمایش هستند؛ سطح نهایی و سهم پرداخت باید توسط API سرور محاسبه شود."
              : "These are preview criteria. The server must calculate the official level and payout share."}
          </p>
        )}
      </div>
    </section>
  );
}
