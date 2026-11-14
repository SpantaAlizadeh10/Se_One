"use client";

import { useState } from "react";
import StreakBanner from "@/components/practice/StreakBanner";
import SkillGrid from "@/components/practice/SkillGrid";
import PracticeList from "@/components/practice/PracticeList";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";
import type { PracticeSkill } from "@/components/practice/SkillGrid";

export const dynamic = "force-dynamic";

const skillLabels: Record<PracticeSkill, { fa: string; en: string }> = {
  all: { fa: "همه مهارت‌ها", en: "all skills" },
  speaking: { fa: "مکالمه", en: "speaking" },
  listening: { fa: "شنیداری", en: "listening" },
  reading: { fa: "خواندن", en: "reading" },
  writing: { fa: "نوشتن", en: "writing" },
  grammar: { fa: "گرامر", en: "grammar" },
  vocabulary: { fa: "واژگان", en: "vocabulary" },
};

export default function PracticePage() {
  const { lang } = useLanguage();
  const { isChildMode } = useStudentExperience();
  const [activeSkill, setActiveSkill] = useState<PracticeSkill>("all");
  const selectSkill = (skill: PracticeSkill) => {
    setActiveSkill(skill);
    requestAnimationFrame(() => {
      document
        .getElementById("practice-exercises")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  return (
    <div>
      <header className="mb-6 rounded-2xl bg-gradient-to-br from-[#182163] via-[#273A8A] to-[#3865B5] p-5 text-white shadow-card sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <span className="text-2xl" aria-hidden="true">✦</span>
          </span>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              SE ONE AI
            </p>
            <h1 className="mb-1 text-xl font-bold sm:text-2xl">
              {lang === "fa" ? "تمرین هوشمند زبان" : "AI Language Practice"}
            </h1>
            <p className="m-0 max-w-2xl text-[12px] leading-6 text-white">
              {lang === "fa"
                ? "مهارت دلخواهت را انتخاب کن؛ همه بخش‌ها باز هستند و می‌توانی تمرین‌های موجود را شروع کنی."
                : "Choose any skill. Every area is open, and you can start any available exercise."}
            </p>
          </div>
        </div>
      </header>

      <p className="text-muted text-[14px] -mt-2 mb-6">
        {lang === "fa"
          ? isChildMode
            ? "تمرین‌های کوتاه و سرگرم‌کننده برای قوی‌تر شدن در زبان!"
            : "تمرین‌های کوتاه روزانه برای تقویت هر مهارت."
          : isChildMode
            ? "Fun little activities to help your language skills grow!"
            : "Short daily drills to keep every skill sharp."}
      </p>

      <StreakBanner />

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
          {lang === "fa" ? "مهارت‌های یادگیری" : "Learning skills"}
        </h2>
      </div>
      <SkillGrid
        lang={lang}
        activeSkill={activeSkill}
        onSelect={selectSkill}
      />

      <section id="practice-exercises" className="scroll-mt-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
            {lang === "fa"
              ? `تمرین‌های ${skillLabels[activeSkill].fa}`
              : `${skillLabels[activeSkill].en} exercises`}
          </h2>
        </div>
        <PracticeList skill={activeSkill} />
      </section>
    </div>
  );
}
