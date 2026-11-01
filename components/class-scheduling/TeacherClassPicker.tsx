"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  requestTeacherClassSlot,
  listTeacherClassSlots,
  overlaps,
  type TeacherClassSlot,
} from "@/lib/api/class-scheduling";
import {
  getCurrentDemoTeacherIdentity,
  getDemoTeacherClassSlots,
  onDemoClassSchedulingChange,
  requestDemoTeacherClass,
} from "@/lib/demo-class-scheduling";

type DisplayTeacherClassSlot = TeacherClassSlot & {
  courseTitle?: string;
  isDemo?: boolean;
};

function demoTeacherSlots(): DisplayTeacherClassSlot[] {
  const identity = getCurrentDemoTeacherIdentity();
  return getDemoTeacherClassSlots(identity.teacherId).map((slot) => ({
    ...slot,
    courseTitle: slot.courseId?.replace("mock-course-", "") ?? "",
    isDemo: true,
  }));
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
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";
  const [slots, setSlots] = useState<DisplayTeacherClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    const remoteSlots = isApiConfigured() ? await listTeacherClassSlots() : [];
    setSlots([...remoteSlots, ...demoTeacherSlots()]);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const remoteSlots = isApiConfigured()
          ? await listTeacherClassSlots()
          : [];
        if (active) setSlots([...remoteSlots, ...demoTeacherSlots()]);
      } catch (reason) {
        if (active) {
          setSlots(demoTeacherSlots());
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load classes.",
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

  const acceptedSlots = useMemo(
    () => slots.filter((item) => item.assignmentStatus === "confirmed"),
    [slots],
  );
  const pendingSlots = useMemo(
    () => slots.filter((item) => item.assignmentStatus === "pending"),
    [slots],
  );

  const conflictsWithSchedule = (candidate: TeacherClassSlot) =>
    acceptedSlots.some(
      (accepted) =>
        accepted.id !== candidate.id &&
        overlaps(
          candidate.startsAt,
          candidate.endsAt,
          accepted.startsAt,
          accepted.endsAt,
        ),
    );

  const requestClass = async (item: DisplayTeacherClassSlot) => {
    if (item.assignmentStatus !== "available" || conflictsWithSchedule(item))
      return;
    setSavingId(item.id);
    setError("");
    setNotice("");
    try {
      if (item.isDemo) {
        const identity = getCurrentDemoTeacherIdentity();
        requestDemoTeacherClass(
          item.id,
          identity.teacherId,
          identity.teacherName,
        );
        setSlots((current) =>
          current.map((slot) =>
            slot.id === item.id
              ? { ...slot, assignmentStatus: "pending" }
              : slot,
          ),
        );
        setNotice(
          fa
            ? "درخواست کلاس نمونه برای تأیید ادمین ارسال شد."
            : "Demo class request sent for admin approval.",
        );
        return;
      }
      await requestTeacherClassSlot(item.id);
      await refresh();
      setNotice(
        fa
          ? "درخواست تدریس ارسال شد و پس از تأیید ادمین در فهرست دانش‌آموزان قرار می‌گیرد."
          : "Teaching request sent. The class becomes bookable after admin approval.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "درخواست کلاس انجام نشد؛ برنامه زمانی را بررسی کنید."
            : "Could not request this class. Check your schedule.",
      );
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-serif text-[23px] font-semibold">
          {fa ? "انتخاب کلاس برای تدریس" : "Choose classes to teach"}
        </h2>
        <p className="m-0 text-[13px] text-muted">
          {fa
            ? "فقط کلاس‌های بدون تداخل با برنامه فعلی‌تان را می‌توانید بپذیرید. بررسی نهایی تداخل در سرور انجام می‌شود."
            : "Accept classes that fit your schedule. The server also enforces overlap checks."}
        </p>
      </div>

      <div className="rounded-xl border border-blue/20 bg-blue/5 px-3 py-2 text-[12px] text-blue">
        {fa
          ? "کلاس‌های نمونه فقط برای پیش‌نمایش هستند. کلاس‌های واقعی با انتخاب، در برنامه معلم ذخیره می‌شوند."
          : "Demo classes are for preview only. Accepting a real class saves it to your teaching schedule."}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-danger/10 p-3 text-[13px] text-danger"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-sage/40 p-3 text-[13px] text-sageDeep"
        >
          {notice}
        </p>
      )}

      {pendingSlots.length > 0 && (
        <section className="rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">
            {fa ? "در انتظار تأیید ادمین" : "Pending admin approval"}
          </h3>
          <div className="space-y-2">
            {pendingSlots.map((item) => (
              <div
                key={item.assignmentId ?? item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[12px]"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="text-muted">
                  {dateLabel(item.startsAt, locale)} ·{" "}
                  {timeLabel(item.startsAt, locale)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {acceptedSlots.length > 0 && (
        <section className="rounded-2xl border border-sage/60 bg-sage/20 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">
            {fa ? "برنامه تدریس پذیرفته‌شده" : "Your accepted schedule"}
          </h3>
          <div className="space-y-2">
            {acceptedSlots.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[12px]"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="text-muted">
                  {dateLabel(item.startsAt, locale)} ·{" "}
                  {timeLabel(item.startsAt, locale)}–
                  {timeLabel(item.endsAt, locale)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-[13px] text-muted">
          {fa ? "در حال بارگذاری…" : "Loading classes…"}
        </p>
      ) : slots.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-[13px] text-muted">
          {fa
            ? "کلاس فعالی برای انتخاب وجود ندارد."
            : "No active classes are available to accept."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {slots.map((item) => {
            const accepted = item.assignmentStatus === "confirmed";
            const pending = item.assignmentStatus === "pending";
            const rejected = item.assignmentStatus === "cancelled";
            const conflict =
              item.assignmentStatus === "available" &&
              conflictsWithSchedule(item);
            const canRequest =
              item.assignmentStatus === "available" && !conflict;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">
                      <Sparkles size={12} /> {item.teacherRole}
                    </div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    {item.courseTitle && (
                      <p className="mt-1 text-[11px] font-medium text-blue">
                        {fa ? "دوره:" : "Course:"} {item.courseTitle}
                      </p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-blue/5 px-2 py-0.5 text-[10px] font-semibold text-blue">
                      {item.classType === "private"
                        ? fa
                          ? `خصوصی · ظرفیت ${item.capacity}`
                          : `Private · ${item.capacity} seat${item.capacity === 1 ? "" : "s"}`
                        : fa
                          ? "عمومی · ظرفیت ۱۰ نفر"
                          : "Public · 10 seats"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {item.isDemo && (
                      <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue">
                        {fa ? "نمونه" : "Demo"}
                      </span>
                    )}
                    <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[11px] font-medium text-blue">
                      {fa
                        ? `${item.remainingSeats} صندلی خالی`
                        : `${item.remainingSeats} seats left`}
                    </span>
                  </div>
                </div>
                <p className="mb-3 text-[12.5px] text-muted">
                  {item.description}
                </p>
                <div className="grid gap-2 text-[12.5px] text-muted sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {dateLabel(item.startsAt, locale)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    {timeLabel(item.startsAt, locale)} –{" "}
                    {timeLabel(item.endsAt, locale)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    {fa
                      ? `ظرفیت ${item.capacity} نفر`
                      : `${item.capacity} student capacity`}
                  </div>
                </div>
                {conflict && (
                  <p className="mb-0 mt-3 text-[12px] text-danger">
                    {fa
                      ? "با کلاس پذیرفته‌شده دیگری تداخل زمانی دارد."
                      : "Overlaps with another class in your schedule."}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!canRequest || savingId === item.id}
                  onClick={() => void requestClass(item)}
                  className="mt-4 w-full rounded-xl bg-blue px-4 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingId === item.id
                    ? fa
                      ? "در حال ثبت…"
                      : "Saving…"
                    : accepted
                      ? fa
                        ? "تأیید و قابل رزرو"
                        : "Approved · Bookable"
                      : pending
                        ? fa
                          ? "در انتظار تأیید ادمین"
                          : "Waiting for admin approval"
                        : rejected
                          ? fa
                            ? "تأیید نشد"
                            : "Not approved"
                          : conflict
                            ? fa
                              ? "تداخل زمانی"
                              : "Schedule conflict"
                            : item.assignmentStatus !== "available"
                              ? fa
                                ? "در دسترس نیست"
                                : "Unavailable"
                              : fa
                                ? "درخواست برگزاری این کلاس"
                                : "Request to teach this class"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
