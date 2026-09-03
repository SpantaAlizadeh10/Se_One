"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CalendarDays, Clock, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getName } from "@/lib/auth-client";
import { teacherClasses } from "@/lib/teacher-data";

export default function TeacherOverviewPage() {
  const { t, href } = useLanguage();
  const d = t("teacherDashboard");
  const [name, setName] = useState("Teacher");

  useEffect(() => {
    const n = getName();
    if (n) setName(n);
  }, []);

  const stats = [
    { label: d.stats.students, value: "63", icon: Users, bg: "bg-[#E4ECFF]", text: "text-blue" },
    { label: d.stats.classesToday, value: "3", icon: CalendarDays, bg: "bg-sage", text: "text-sageDeep" },
    { label: d.stats.hoursWeek, value: "12", icon: Clock, bg: "bg-goldSoft", text: "text-goldDeep" },
    { label: d.stats.rating, value: "4.9", icon: Star, bg: "bg-peach", text: "text-peachDeep" }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold mb-1">
          {d.welcome}, {name} 👋
        </h2>
        <p className="text-muted text-[14px] m-0">{d.sub}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
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

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold m-0">{d.todayClasses}</h3>
        <Link href={href("/teacher/schedule")} className="text-[13px] font-semibold text-blue flex items-center gap-1">
          {d.seeSchedule} <ArrowRight size={13} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card divide-y divide-line">
        {teacherClasses.slice(0, 3).map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 text-white`}>
              <CalendarDays size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{c.title}</div>
              <div className="text-[12px] text-muted">{c.level} · {c.students} {t("common.students")}</div>
            </div>
            <div className="text-end shrink-0">
              <div className="text-[13px] font-bold">{c.time}</div>
              <div className="text-[11px] text-muted">{c.day}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
