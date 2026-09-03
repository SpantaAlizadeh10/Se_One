"use client";

import { Users, Clock, Plus, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { teacherClasses } from "@/lib/teacher-data";

export default function TeacherClassesPage() {
  const { t } = useLanguage();
  const d = t("teacherDashboard");

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <p className="text-muted text-[14px] m-0">{d.myClasses}</p>
        <button className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-blueDeep transition-colors">
          <Plus size={15} /> {d.addClass}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {teacherClasses.map((c) => (
          <div key={c.id} className="bg-white border border-line rounded-lg overflow-hidden shadow-card hover:-translate-y-1 hover:shadow-cardHover transition-all">
            <div className={`h-[110px] bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
              <BookOpen size={40} className="text-white/90" strokeWidth={1.5} />
            </div>
            <div className="p-4">
              <h3 className="text-[15px] font-semibold mb-1">{c.title}</h3>
              <div className="text-[12px] text-muted mb-3">{c.level}</div>
              <div className="flex items-center gap-4 text-[12px] text-ink70">
                <span className="flex items-center gap-1.5">
                  <Users size={13} /> {c.students} {t("common.students")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> {c.time}
                </span>
              </div>
              <div className="text-[11.5px] text-muted mt-1.5">{c.day}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
