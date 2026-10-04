"use client";

import { useEffect, useState } from "react";
import { Quote, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const proverbs = [
  {
    en: "A journey of a thousand miles begins with a single step.",
    fa: "سفر هزار مایلی با یک قدم آغاز می‌شود.",
  },
  { en: "Actions speak louder than words.", fa: "کردار از گفتار رساتر است." },
  { en: "Practice makes perfect.", fa: "کار نیکو کردن از پر کردن است." },
  { en: "Where there’s a will, there’s a way.", fa: "خواستن توانستن است." },
  {
    en: "Slow and steady wins the race.",
    fa: "رهرو آن نیست که گهی تند و گهی خسته رود؛ رهرو آن است که آهسته و پیوسته رود.",
  },
  { en: "Better late than never.", fa: "دیر رسیدن بهتر از هرگز نرسیدن است." },
  { en: "Every cloud has a silver lining.", fa: "پایان شب سیه سپید است." },
  { en: "Two heads are better than one.", fa: "یک دست صدا ندارد." },
  { en: "The early bird catches the worm.", fa: "سحرخیز باش تا کامروا شوی." },
  {
    en: "Rome wasn’t built in a day.",
    fa: "رهرو آهسته و پیوسته به مقصد می‌رسد.",
  },
  { en: "Look before you leap.", fa: "اول اندیشه، وانگهی گفتار." },
  { en: "Many hands make light work.", fa: "یک دست صدا ندارد." },
  { en: "You reap what you sow.", fa: "هر چه بکاری همان را درو می‌کنی." },
  { en: "All that glitters is not gold.", fa: "هر گردی گردو نیست." },
  {
    en: "A stitch in time saves nine.",
    fa: "جلوی ضرر را از هر جا بگیری منفعت است.",
  },
  { en: "Fortune favors the bold.", fa: "با توکل زانوی اشتر ببند." },
  { en: "Haste makes waste.", fa: "عجله کار شیطان است." },
  {
    en: "When in Rome, do as the Romans do.",
    fa: "خواهی نشوی رسوا، همرنگ جماعت شو.",
  },
  {
    en: "Necessity is the mother of invention.",
    fa: "احتیاج مادر اختراع است.",
  },
  { en: "No pain, no gain.", fa: "نابرده رنج، گنج میسر نمی‌شود." },
  {
    en: "A picture is worth a thousand words.",
    fa: "شنیدن کی بود مانند دیدن.",
  },
  {
    en: "Don't put all your eggs in one basket.",
    fa: "همه تخم‌مرغ‌هایت را در یک سبد نگذار.",
  },
  {
    en: "Don't count your chickens before they hatch.",
    fa: "جوجه را آخر پاییز می‌شمارند.",
  },
  { en: "Out of sight, out of mind.", fa: "از دل برود هر آنکه از دیده برفت." },
  {
    en: "The pen is mightier than the sword.",
    fa: "زبان از شمشیر برنده‌تر است.",
  },
  { en: "There's no place like home.", fa: "هیچ‌جا خانه خود آدم نمی‌شود." },
  {
    en: "An apple a day keeps the doctor away.",
    fa: "پیشگیری بهتر از درمان است.",
  },
  {
    en: "Don't bite the hand that feeds you.",
    fa: "نمک خوردن و نمکدان شکستن روا نیست.",
  },
  {
    en: "You can't have your cake and eat it too.",
    fa: "هم خدا را می‌خواهد هم خرما را.",
  },
  {
    en: "A friend in need is a friend indeed.",
    fa: "دوست آن باشد که گیرد دست دوست، در پریشان‌حالی و درماندگی.",
  },
  { en: "Knowledge is power.", fa: "توانا بود هر که دانا بود." },
  {
    en: "Learning is a treasure that will follow its owner everywhere.",
    fa: "دانش گنجی است که همه‌جا همراه صاحبش می‌ماند.",
  },
];

function getTodayIndex(date: Date): number {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return ((dayNumber % proverbs.length) + proverbs.length) % proverbs.length;
}

export default function DailyProverb() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout>;

    const updateAndSchedule = () => {
      clearTimeout(midnightTimer);
      const now = new Date();
      setIndex(getTodayIndex(now));
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      midnightTimer = setTimeout(
        updateAndSchedule,
        Math.max(1000, nextMidnight.getTime() - now.getTime()),
      );
    };

    updateAndSchedule();
    window.addEventListener("focus", updateAndSchedule);
    return () => {
      clearTimeout(midnightTimer);
      window.removeEventListener("focus", updateAndSchedule);
    };
  }, []);

  const proverb = proverbs[index];

  return (
    <aside
      className="mt-8 overflow-hidden rounded-2xl border border-[#E9DDBF] bg-gradient-to-br from-[#FFFDF7] via-white to-[#F5F8FF] shadow-card"
      aria-label={t("dailyProverb.label")}
    >
      <div className="flex items-start gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-goldSoft text-goldDeep sm:flex">
          <Quote size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-goldDeep">
            <Sparkles size={14} />
            {t("dailyProverb.label")}
          </div>
          <blockquote
            className="m-0 font-serif text-[17px] font-semibold leading-relaxed text-ink sm:text-[19px]"
            lang="en"
            dir="ltr"
          >
            “{proverb.en}”
          </blockquote>
          <p
            className="mb-0 mt-1.5 text-[12.5px] leading-relaxed text-muted"
            lang="fa"
            dir="rtl"
          >
            <span className="font-semibold">
              {t("dailyProverb.translationLabel")}:{" "}
            </span>
            {proverb.fa}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-line bg-white/80 px-3 py-1.5 text-[10.5px] text-muted md:inline-flex md:items-center">
          {t("dailyProverb.dailyHint")}
        </span>
      </div>
    </aside>
  );
}
