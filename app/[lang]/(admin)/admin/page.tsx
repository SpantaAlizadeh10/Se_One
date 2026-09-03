"use client";

import { Users, GraduationCap, BookOpen, Tag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { adminStudents } from "@/lib/admin-data";
import { teacherDirectory } from "@/lib/teachers-directory";
import { useCoursesPricing } from "@/lib/use-courses-pricing";

export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const d = t("adminDashboard");
  const [pricing] = useCoursesPricing();

  const activeDiscounts = pricing.filter((p) => p.discountPercent > 0).length;

  const stats = [
    { label: d.stats.students, value: String(adminStudents.length), icon: Users, bg: "bg-[#E4ECFF]", text: "text-blue" },
    { label: d.stats.teachers, value: String(teacherDirectory.length), icon: GraduationCap, bg: "bg-sage", text: "text-sageDeep" },
    { label: d.stats.courses, value: String(pricing.length), icon: BookOpen, bg: "bg-goldSoft", text: "text-goldDeep" },
    { label: d.stats.discounts, value: String(activeDiscounts), icon: Tag, bg: "bg-danger/10", text: "text-danger" }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold mb-1">{d.welcome} 👋</h2>
        <p className="text-muted text-[14px] m-0">{d.sub}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded-md p-4 shadow-card flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-[11px] flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}>
              <s.icon size={19} />
            </div>
            <div>
              <div className="font-serif text-[22px] font-semibold leading-none">{s.value}</div>
              <div className="text-[11.5px] text-muted mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
