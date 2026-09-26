"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getTeacherStudents, type TeacherStudent } from "@/lib/api/teacher-dashboard";

export default function TeacherStudentsPage() {
  const { t } = useLanguage();
  const d = t("teacherDashboard");
  const [query, setQuery] = useState("");
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([]);

  useEffect(() => {
    let active = true;
    getTeacherStudents().then((items) => { if (active) setTeacherStudents(items); }).catch(() => { if (active) setTeacherStudents([]); });
    return () => { active = false; };
  }, []);

  const filtered = teacherStudents.filter((s) => s.studentName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-2.5 bg-white border border-line rounded-full px-4 py-2.5 shadow-card max-w-[320px] mb-6">
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.searchStudents}
          className="flex-1 min-w-0 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
        />
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card divide-y divide-line">
        {filtered.map((s) => (
          <div key={`${s.studentId}-${s.courseId}`} className="flex items-center gap-4 p-4">
            {s.studentAvatar ? <Image src={s.studentAvatar} alt={s.studentName} width={44} height={44} className="rounded-full object-cover shrink-0" /> : <div className="w-11 h-11 rounded-full bg-cream shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{s.studentName}</div>
              <div className="text-[12px] text-muted">{s.courseTitle}</div>
            </div>
            <div className="w-[110px] shrink-0 hidden sm:block">
              <div className="h-[7px] bg-line rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue to-blueDeep rounded-full" style={{ width: `${s.progress}%` }} />
              </div>
            </div>
            <div className="text-[13px] font-bold w-10 text-end shrink-0">{s.progress}%</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[13.5px] text-muted">—</div>
        )}
      </div>
    </div>
  );
}
