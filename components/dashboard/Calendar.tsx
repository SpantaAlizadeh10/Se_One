"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function getCalendarParts(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(date);
  return {
    year: parts.find((part) => part.type === "year")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
  };
}

function getMonthRange(anchor: Date, locale: string) {
  const first = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate(),
    12,
  );
  const last = new Date(first);
  const anchorParts = getCalendarParts(anchor, locale);

  for (let offset = 1; offset <= 31; offset += 1) {
    const previous = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate() - 1,
      12,
    );
    const parts = getCalendarParts(previous, locale);
    if (parts.year !== anchorParts.year || parts.month !== anchorParts.month)
      break;
    first.setTime(previous.getTime());
  }

  for (let offset = 1; offset <= 31; offset += 1) {
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
      12,
    );
    const parts = getCalendarParts(next, locale);
    if (parts.year !== anchorParts.year || parts.month !== anchorParts.month)
      break;
    last.setTime(next.getTime());
  }

  return { first, last };
}

export default function Calendar() {
  const { lang } = useLanguage();
  const locale = lang === "fa" ? "fa-IR-u-ca-persian" : "en-US-u-ca-gregory";
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [browsingOtherMonth, setBrowsingOtherMonth] = useState(false);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    if (!browsingOtherMonth) setCurrentDate(now);
    setMounted(true);

    const timer = window.setInterval(() => {
      const current = new Date();
      setToday(current);
      if (!browsingOtherMonth) setCurrentDate(current);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [browsingOtherMonth]);

  const monthRange = useMemo(
    () => (currentDate ? getMonthRange(currentDate, locale) : null),
    [currentDate, locale],
  );

  if (!mounted || !today || !currentDate || !monthRange) {
    return (
      <div
        className="min-h-[300px] rounded-lg bg-sage/40 animate-pulse"
        aria-hidden="true"
      />
    );
  }

  const { first, last } = monthRange;
  const daysInMonth =
    Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1;
  const startsOnSaturday = lang === "fa";
  const leadingBlanks = startsOnSaturday
    ? (first.getDay() + 1) % 7
    : (first.getDay() + 6) % 7;
  const weekStart = startsOnSaturday
    ? new Date(Date.UTC(2026, 0, 3, 12))
    : new Date(Date.UTC(2026, 0, 5, 12));
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  });
  const dayFormatter = new Intl.NumberFormat(
    lang === "fa" ? "fa-IR" : "en-US",
    { useGrouping: false },
  );
  const headerFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const goToPreviousMonth = () => {
    setBrowsingOtherMonth(true);
    setCurrentDate(
      new Date(first.getFullYear(), first.getMonth(), first.getDate() - 1, 12),
    );
  };
  const goToNextMonth = () => {
    setBrowsingOtherMonth(true);
    setCurrentDate(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1, 12),
    );
  };
  const goToToday = () => {
    const now = new Date();
    setToday(now);
    setCurrentDate(now);
    setBrowsingOtherMonth(false);
  };

  return (
    <div className="bg-gradient-to-br from-sage to-[#F1F7EE] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold m-0">
          {headerFormatter.format(currentDate)}
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label={lang === "fa" ? "ماه قبل" : "Previous month"}
            className="w-7 h-7 rounded-full border border-sageDeep/25 bg-white flex items-center justify-center text-sageDeep hover:bg-sage/20 transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="px-2 h-7 rounded-full border border-sageDeep/25 bg-white flex items-center justify-center text-sageDeep hover:bg-sage/20 transition-colors text-[11px] font-bold"
          >
            {lang === "fa" ? "امروز" : "Today"}
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label={lang === "fa" ? "ماه بعد" : "Next month"}
            className="w-7 h-7 rounded-full border border-sageDeep/25 bg-white flex items-center justify-center text-sageDeep hover:bg-sage/20 transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: 7 }, (_, index) => {
          const weekday = new Date(weekStart.getTime() + index * 86_400_000);
          return (
            <span
              key={index}
              className="text-[11px] font-bold text-sageDeep/75 pb-1.5"
            >
              {weekdayFormatter.format(weekday)}
            </span>
          );
        })}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(
            first.getFullYear(),
            first.getMonth(),
            first.getDate() + index,
            12,
          );
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
          return (
            <span
              key={date.toISOString()}
              aria-current={isToday ? "date" : undefined}
              className={`text-[13px] py-2 rounded-[9px] font-medium transition-colors ${isToday ? "bg-ink text-white font-bold" : "text-ink70"}`}
            >
              {dayFormatter.format(date.getDate())}
            </span>
          );
        })}
      </div>
    </div>
  );
}
