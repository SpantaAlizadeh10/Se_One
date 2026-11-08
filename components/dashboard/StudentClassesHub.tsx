"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MessageCircle,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  listStudentClassSlots,
  type StudentAvailableClass,
} from "@/lib/api/class-scheduling";

function formatSchedule(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function StudentClassesHub() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const [classes, setClasses] = useState<StudentAvailableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!isApiConfigured()) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    listStudentClassSlots()
      .then((items) => {
        if (active) setClasses(items.filter((item) => item.enrolled));
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "کلاس‌های شما بارگذاری نشد."
                : "Could not load your classes.",
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

  const now = Date.now();
  const locale = fa ? "fa-IR" : "en-US";
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-serif text-[23px] font-semibold">
            {fa ? "کلاس‌های من" : "My Classes"}
          </h2>
          <p className="m-0 text-[13px] text-muted">
            {fa
              ? "گروه‌های هر کلاس، هم‌کلاسی‌ها و منابع جلسات را یک‌جا ببینید."
              : "Find your class groups, classmates, and lesson resources in one place."}
          </p>
        </div>
        <Link
          href={href("/dashboard/resources")}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[12px] font-semibold text-blue"
        >
          <BookOpen size={15} />
          {fa ? "منابع کلاس‌ها" : "Class resources"}
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue/15 bg-blue/5 px-4 py-3">
        <div className="flex items-center gap-2 text-[12px] text-ink70">
          <Users size={16} className="text-blue" />
          {fa
            ? "هر کلاس گروه گفت‌وگوی مخصوص خودش را دارد."
            : "Every class has its own shared group chat."}
        </div>
        <Link
          href={href("/dashboard/bookClass")}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue"
        >
          {fa ? "پیدا کردن کلاس" : "Find a class"}
          <ArrowRight size={13} className="rtl:rotate-180" />
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-[12px] text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-center text-[13px] text-muted">
          {fa ? "در حال بارگذاری کلاس‌ها…" : "Loading your classes…"}
        </p>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-7 text-center">
          <Users size={25} className="mx-auto mb-2 text-muted" />
          <p className="mb-3 mt-0 text-[13px] text-muted">
            {fa
              ? "هنوز در کلاسی ثبت‌نام نکرده‌اید."
              : "You have not enrolled in a class yet."}
          </p>
          <Link
            href={href("/dashboard/bookClass")}
            className="inline-flex rounded-full bg-blue px-4 py-2.5 text-[12px] font-semibold text-white"
          >
            {fa ? "مشاهده کلاس‌ها" : "Browse classes"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((classItem) => {
            const completed =
              Boolean(classItem.endsAt) &&
              new Date(classItem.endsAt).getTime() < now;
            return (
              <article
                key={classItem.assignmentId}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8EEFF] text-blue">
                  <Users size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 truncate text-[14px] font-semibold">
                      {classItem.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        completed
                          ? "bg-sage/50 text-sageDeep"
                          : "bg-blue/10 text-blue"
                      }`}
                    >
                      {completed
                        ? fa
                          ? "تکمیل‌شده"
                          : "Completed"
                        : fa
                          ? "فعال"
                          : "Active"}
                    </span>
                  </div>
                  <p className="mb-1 mt-1 text-[12px] text-muted">
                    {classItem.courseTitle || classItem.teacherRole}
                    {classItem.teacherName ? ` · ${classItem.teacherName}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} />
                      {formatSchedule(classItem.startsAt, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} />
                      {fa
                        ? `${classItem.enrolledCount} از ${classItem.capacity} عضو`
                        : `${classItem.enrolledCount} of ${classItem.capacity} members`}
                    </span>
                  </div>
                </div>
                {classItem.classGroupId ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={href(
                        `/dashboard/classes/group/${encodeURIComponent(classItem.classGroupId)}`,
                      )}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white"
                    >
                      <MessageCircle size={15} />
                      {fa ? "ورود به گروه" : "Open group"}
                    </Link>
                    {completed && (
                      <Link
                        href={href(
                          `/dashboard/resources?courseId=${encodeURIComponent(classItem.courseId ?? "")}`,
                        )}
                        className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-[11px] font-semibold text-ink70"
                      >
                        {fa ? "ضبط و منابع" : "Recordings"}
                      </Link>
                    )}
                  </div>
                ) : (
                  <span className="shrink-0 rounded-xl bg-cream px-3 py-2.5 text-[11px] text-muted">
                    {fa
                      ? "گروه پس از تأیید رزرو فعال می‌شود"
                      : "Group available after booking confirmation"}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
