"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getClassroomSessions,
  isSafeClassroomUrl,
  type ClassroomSession,
} from "@/lib/api/classrooms";

function sessionDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function StudentClassResources() {
  const { lang, href } = useLanguage();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? "";
  const fa = lang === "fa";
  const [sessions, setSessions] = useState<ClassroomSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getClassroomSessions()
      .then((items) => {
        if (active) setSessions(items);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "منابع کلاس بارگذاری نشد."
                : "Could not load class resources.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fa]);

  const locale = fa ? "fa-IR" : "en-US";
  const visibleSessions = courseId
    ? sessions.filter((session) => session.courseId === courseId)
    : sessions;
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-serif text-[23px] font-semibold">
            {fa ? "منابع کلاس‌ها" : "Class Resources"}
          </h2>
          <p className="m-0 text-[13px] text-muted">
            {fa
              ? "ضبط جلسه‌های Adobe Connect، فایل‌ها و یادداشت‌های کلاس را اینجا پیدا کنید."
              : "Find Adobe Connect recordings, class files, and session notes here."}
          </p>
        </div>
        <Link
          href={href("/dashboard/classes")}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[12px] font-semibold text-blue"
        >
          {fa ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
          {fa ? "کلاس‌های من" : "My classes"}
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-[12px] text-danger">
          {error}
        </p>
      )}
      {loading ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-center text-[13px] text-muted">
          {fa ? "در حال بارگذاری منابع…" : "Loading resources…"}
        </p>
      ) : visibleSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-7 text-center">
          <BookOpen size={25} className="mx-auto mb-2 text-muted" />
          <p className="m-0 text-[13px] text-muted">
            {fa
              ? "هنوز منبع یا ضبطی برای کلاس‌های شما ثبت نشده است."
              : "No class resources or recordings are available yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleSessions.map((session) => {
            const materials = session.materials.filter(
              (material) =>
                material.downloadUrl && isSafeClassroomUrl(material.downloadUrl),
            );
            const hasRecording =
              session.recordingUrl && isSafeClassroomUrl(session.recordingUrl);
            return (
              <article
                key={session.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-blue">
                      {session.provider.replaceAll("_", " ")}
                    </p>
                    <h3 className="mb-1 mt-1 truncate text-[15px] font-semibold">
                      {session.courseTitle || (fa ? "جلسه کلاس" : "Class session")}
                    </h3>
                    <p className="m-0 text-[11px] text-muted">
                      {session.teacherName}
                      {session.scheduledAt
                        ? ` · ${sessionDate(session.scheduledAt, locale)}`
                        : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-sage/40 px-2.5 py-1 text-[10px] font-semibold text-sageDeep">
                    {fa
                      ? session.status === "completed"
                        ? "تمام‌شده"
                        : "جلسه"
                      : session.status === "completed"
                        ? "Completed"
                        : "Session"}
                  </span>
                </div>

                {session.notes && (
                  <p className="mb-0 mt-3 whitespace-pre-wrap rounded-xl bg-cream p-3 text-[12px] leading-5 text-ink70">
                    {session.notes}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {hasRecording && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue px-3.5 py-2.5 text-[12px] font-semibold text-white"
                    >
                      <ExternalLink size={14} />
                      {fa ? "مشاهده ضبط جلسه" : "Watch recording"}
                    </a>
                  )}
                  {materials.map((material) => (
                    <a
                      key={material.id}
                      href={material.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-[12px] font-semibold text-ink70"
                    >
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate">{material.name}</span>
                    </a>
                  ))}
                  {!hasRecording && materials.length === 0 && (
                    <p className="m-0 text-[11px] text-muted">
                      {fa
                        ? "هنوز ضبط یا فایلی اضافه نشده است."
                        : "No recording or files have been added yet."}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
