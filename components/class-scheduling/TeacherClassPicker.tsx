"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  MessageCircle,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  listTeacherClassSlots,
  type TeacherClassSlot,
} from "@/lib/api/class-scheduling";
import {
  getCurrentDemoTeacherIdentity,
  getDemoTeacherClassSlots,
  onDemoClassSchedulingChange,
} from "@/lib/demo-class-scheduling";

type DisplayTeacherClassSlot = TeacherClassSlot & { isDemo?: boolean };

function demoTeacherSlots(): DisplayTeacherClassSlot[] {
  const identity = getCurrentDemoTeacherIdentity();
  return getDemoTeacherClassSlots(identity.teacherId)
    .filter((slot) => slot.assignmentStatus === "confirmed")
    .map((slot) => ({ ...slot, isDemo: true }));
}

function dateLabel(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function timeLabel(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export default function TeacherClassPicker() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";
  const [slots, setSlots] = useState<DisplayTeacherClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const remoteSlots = isApiConfigured()
          ? await listTeacherClassSlots()
          : [];
        if (active) {
          setSlots([
            ...remoteSlots.filter(
              (slot) => slot.assignmentStatus === "confirmed",
            ),
            ...demoTeacherSlots(),
          ]);
          setError("");
        }
      } catch (reason) {
        if (active) {
          setSlots(demoTeacherSlots());
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "کلاس‌های تخصیص‌یافته بارگذاری نشدند."
                : "Could not load assigned classes.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const unsubscribe = onDemoClassSchedulingChange(() => void load());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [fa]);

  const now = Date.now();
  const assignedSlots = slots.filter(
    (slot) =>
      slot.assignmentStatus === "confirmed" &&
      slot.status !== "cancelled" &&
      slot.status !== "draft",
  );
  const upcomingSlots = assignedSlots
    .filter((slot) => !slot.endsAt || new Date(slot.endsAt).getTime() >= now)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
  const completedSlots = assignedSlots
    .filter((slot) => Boolean(slot.endsAt) && new Date(slot.endsAt).getTime() < now)
    .sort(
      (left, right) =>
        new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime(),
    );

  const renderClass = (item: DisplayTeacherClassSlot, completed = false) => (
    <article
      key={`${item.id}-${item.assignmentId ?? "assigned"}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8EEFF] text-blue">
        <BookOpen size={21} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="m-0 truncate text-[14px] font-semibold">{item.title}</h3>
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
                ? "تخصیص‌یافته"
                : "Assigned"}
          </span>
          {item.isDemo && (
            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-muted">
              {fa ? "نمونه" : "Demo"}
            </span>
          )}
        </div>
        <p className="mb-2 mt-1 text-[12px] text-muted">
          {item.courseTitle || item.description || item.teacherRole}
          {item.level ? ` · ${fa ? "سطح" : "Level"} ${item.level}` : ""}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {dateLabel(item.startsAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {timeLabel(item.startsAt, locale)}–{timeLabel(item.endsAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} />
            {fa
              ? `${item.enrolledCount} از ${item.capacity} دانش‌آموز`
              : `${item.enrolledCount} of ${item.capacity} students`}
          </span>
          <span>
            {fa
              ? `${item.remainingSeats} جای خالی`
              : `${item.remainingSeats} seats left`}
          </span>
        </div>
      </div>
      {item.classGroupId && (
        <Link
          href={href(
            `/teacher/classes/group/${encodeURIComponent(item.classGroupId)}`,
          )}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blueDeep"
        >
          <MessageCircle size={15} />
          {fa ? "گفت‌وگوی کلاس" : "Class chat"}
        </Link>
      )}
    </article>
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="mb-1 font-serif text-[23px] font-semibold">
          {fa ? "کلاس‌های من" : "My Classes"}
        </h2>
        <p className="m-0 text-[13px] text-muted">
          {fa
            ? "در این بخش فقط کلاس‌هایی نمایش داده می‌شوند که ادمین به شما تخصیص داده است."
            : "Only classes assigned to you by an admin appear here."}
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-center text-[13px] text-muted">
          {fa ? "در حال بارگذاری کلاس‌ها…" : "Loading your classes…"}
        </p>
      ) : assignedSlots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-7 text-center">
          <CalendarDays size={25} className="mx-auto mb-2 text-muted" />
          <p className="mb-2 mt-0 text-[14px] font-semibold">
            {fa ? "هنوز کلاسی به شما تخصیص داده نشده است." : "No classes assigned yet."}
          </p>
          <p className="mx-auto mb-4 mt-0 max-w-lg text-[12px] leading-6 text-muted">
            {fa
              ? "زمان‌های آزاد خود را ثبت کنید. ادمین پس از بررسی، کلاس مناسب را به شما تخصیص می‌دهد."
              : "Submit your available times. An admin will review them and assign a suitable class."}
          </p>
          <Link
            href={href("/teacher/availability")}
            className="inline-flex items-center justify-center rounded-full bg-blue px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blueDeep"
          >
            {fa ? "ثبت زمان‌های آزاد" : "Set available times"}
          </Link>
        </div>
      ) : (
        <div className="space-y-7">
          {upcomingSlots.length > 0 && (
            <section className="space-y-3">
              <h3 className="m-0 text-[14px] font-semibold">
                {fa ? "کلاس‌های پیش‌رو" : "Upcoming classes"}
              </h3>
              {upcomingSlots.map((item) => renderClass(item))}
            </section>
          )}
          {completedSlots.length > 0 && (
            <section className="space-y-3">
              <h3 className="m-0 text-[14px] font-semibold">
                {fa ? "کلاس‌های تکمیل‌شده" : "Completed classes"}
              </h3>
              {completedSlots.map((item) => renderClass(item, true))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
