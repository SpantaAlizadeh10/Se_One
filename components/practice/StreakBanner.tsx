"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getStreakInfo, type StreakInfo } from "@/lib/api/practice";

export default function StreakBanner() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  useEffect(() => {
    let active = true;
    getStreakInfo()
      .then((info) => {
        if (active) setStreak(info);
      })
      .catch(() => {
        if (active)
          setStreak({
            currentStreak: 0,
            longestStreak: 0,
            lastPracticeDate: "",
            streakHistory: [],
          });
      });
    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6 + index,
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const practiced =
      streak?.streakHistory.some(
        (entry) =>
          entry.date.slice(0, 10) === key && entry.practicesCompleted > 0,
      ) ?? false;
    return {
      date,
      label: new Intl.DateTimeFormat(fa ? "fa-IR" : "en-US", {
        weekday: "narrow",
      }).format(date),
      practiced,
      today: index === 6,
    };
  });

  return (
    <div
      className="bg-gradient-to-r from-ink to-[#2A3F63] rounded-lg px-7.5 py-6.5 text-white flex items-center justify-between gap-6 mb-7 flex-wrap"
      style={{ padding: "26px 30px" }}
    >
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
          <Flame size={24} />
        </div>
        <div>
          <h3 className="text-[19px] font-semibold mb-1">
            {fa
              ? `${streak?.currentStreak ?? "—"} روز پیوسته`
              : `${streak?.currentStreak ?? "—"}-day streak`}
          </h3>
          <p className="text-[13px] text-[#C7CEDD] m-0">
            {fa
              ? `بهترین رکورد: ${streak?.longestStreak ?? "—"} روز. یک تمرین کوتاه امروز پیوستگی‌ات را حفظ می‌کند.`
              : `Best streak: ${streak?.longestStreak ?? "—"} days. A short practice today keeps your momentum.`}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {days.map((day) => {
          return (
            <div
              key={day.date.toISOString()}
              title={day.date.toLocaleDateString(fa ? "fa-IR" : "en-US")}
              className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[11.5px] font-bold ${
                day.practiced
                  ? "bg-gold text-ink"
                  : day.today
                    ? "bg-white/10 text-white ring-2 ring-gold ring-offset-2 ring-offset-ink"
                    : "bg-white/10 text-[#9AA5BE]"
              }`}
            >
              {day.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
