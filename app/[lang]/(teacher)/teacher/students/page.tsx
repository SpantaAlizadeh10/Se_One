"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  getTeacherClasses,
  getTeacherStudents,
  type TeacherStudent,
} from "@/lib/api/teacher-dashboard";

export default function TeacherStudentsPage() {
  const { t, lang } = useLanguage();
  const d = t("teacherDashboard");
  const [query, setQuery] = useState("");
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isApiConfigured()) {
      setError("Backend API is not configured.");
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([getTeacherStudents(), getTeacherClasses()])
      .then(([students, classes]) => {
        if (!active) return;
        const linkedStudentIds = new Set(
          classes.map((classItem) => classItem.studentId).filter(Boolean),
        );
        // Fail closed: only render students linked to this teacher's own classes.
        setTeacherStudents(
          students.filter((student) => linkedStudentIds.has(student.studentId)),
        );
      })
      .catch((reason) => {
        if (active) {
          setTeacherStudents([]);
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load your students.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = teacherStudents.filter((s) =>
    s.studentName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger/10 p-3 text-[13px] text-danger"
        >
          {error}
        </p>
      )}
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
        {loading && (
          <div className="p-8 text-center text-[13.5px] text-muted">
            {lang === "fa"
              ? "در حال بارگذاری دانش‌آموزان…"
              : "Loading students…"}
          </div>
        )}
        {filtered.map((s) => (
          <div
            key={`${s.studentId}-${s.courseId}`}
            className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:p-4"
          >
            {s.studentAvatar ? (
              <Image
                src={s.studentAvatar}
                alt={s.studentName}
                width={44}
                height={44}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-cream shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">
                {s.studentName}
              </div>
              <div className="text-[12px] text-muted">{s.courseTitle}</div>
            </div>
            <div className="w-[110px] shrink-0 hidden sm:block">
              <div className="h-[7px] bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue to-blueDeep rounded-full"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>
            <div className="text-[13px] font-bold w-10 text-end shrink-0">
              {s.progress}%
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-[13.5px] text-muted">
            {error
              ? lang === "fa"
                ? "فهرست دانش‌آموزان بارگذاری نشد."
                : "Could not load your students."
              : lang === "fa"
                ? "هنوز دانش‌آموزی در کلاس‌های شما ثبت نشده است."
                : "No students are linked to your classes yet."}
          </div>
        )}
      </div>
    </div>
  );
}
