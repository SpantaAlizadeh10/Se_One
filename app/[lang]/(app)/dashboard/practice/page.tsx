"use client";

import StreakBanner from "@/components/practice/StreakBanner";
import SkillGrid from "@/components/practice/SkillGrid";
import PracticeList from "@/components/practice/PracticeList";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const { lang } = useLanguage();
  const { isChildMode } = useStudentExperience();
  return (
    <div>
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
          {lang === "fa" ? "مهارت‌ها" : "Skill Areas"}
        </h2>
      </div>
      <SkillGrid />

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
          {lang === "fa" ? "پیشنهادهای تمرین" : "Recommended for you"}
        </h2>
      </div>
      <PracticeList />
    </div>
  );
}
