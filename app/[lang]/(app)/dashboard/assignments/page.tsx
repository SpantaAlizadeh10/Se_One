"use client";

import AssignmentsCenter from "@/components/assignments/AssignmentsCenter";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AssignmentsPage() {
  const { lang } = useLanguage();
  const { isChildMode } = useStudentExperience();
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">
        {isChildMode
          ? lang === "fa"
            ? "کارهایت را ببین، جواب بده و اگر لازم شد از معلمت کمک بگیر."
            : "See your tasks, share your work, and ask your teacher if you need help."
          : "Track deadlines, save your work, attach files, and review teacher feedback."}
      </p>
      <AssignmentsCenter />
    </div>
  );
}
