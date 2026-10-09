"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getCalendarEvents,
  getUpcomingClasses,
  type CalendarEvent,
} from "@/lib/api/student-dashboard";
import {
  getTeacherSchedule,
  type TeacherClass,
} from "@/lib/api/teacher-dashboard";
import { isApiConfigured } from "@/lib/is-api-configured";

type CalendarAudience = "student" | "teacher";
type LiveEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  type: "class" | "assignment_due" | "exam" | "practice" | "other";
  courseTitle?: string;
  meetingUrl?: string;
};

function calendarParts(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).formatToParts(date);
  return {
    year: parts.find((part) => part.type === "year")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
  };
}

function monthRange(anchor: Date, locale: string) {
  const first = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate(),
    12,
  );
  const last = new Date(first);
  const anchorParts = calendarParts(anchor, locale);
  for (let i = 0; i < 31; i += 1) {
    const previous = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate() - 1,
      12,
    );
    if (
      JSON.stringify(calendarParts(previous, locale)) !==
      JSON.stringify(anchorParts)
    )
      break;
    first.setTime(previous.getTime());
  }
  for (let i = 0; i < 31; i += 1) {
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
      12,
    );
    if (
      JSON.stringify(calendarParts(next, locale)) !==
      JSON.stringify(anchorParts)
    )
      break;
    last.setTime(next.getTime());
  }
  return { first, last };
}

function localDateKey(value: string) {
  if (!value) return "";
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
        12,
      )
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function teacherClassToEvent(item: TeacherClass): LiveEvent {
  const date = item.scheduledDate?.split("T")[0] ?? "";
  const startTime = item.startTime || "00:00";
  const endTime = item.endTime || "";
  return {
    id: item.id,
    title: item.courseTitle || item.subject || "Class",
    description: [item.subject, item.studentName].filter(Boolean).join(" · "),
    start: `${date}T${startTime}:00`,
    end: endTime ? `${date}T${endTime}:00` : undefined,
    type: "class",
    courseTitle: item.courseTitle,
    meetingUrl: item.meetingUrl,
  };
}

function studentCalendarEventToEvent(event: CalendarEvent): LiveEvent {
  return { ...event, type: event.type };
}

export default function LiveDashboardCalendar({
  audience,
}: {
  audience: CalendarAudience;
}) {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR-u-ca-persian" : "en-US-u-ca-gregory";
  const [today, setToday] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentDate(now);
    setSelectedDay(toDateParam(now));
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const range = useMemo(
    () => (currentDate ? monthRange(currentDate, locale) : null),
    [currentDate, locale],
  );
  const firstDay = range ? toDateParam(range.first) : "";
  const lastDay = range ? toDateParam(range.last) : "";

  const loadEvents = useCallback(async () => {
    if (!firstDay || !lastDay) return;
    if (!isApiConfigured()) {
      setEvents([]);
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      let loaded: LiveEvent[] = [];
      if (audience === "teacher") {
        const classes = await getTeacherSchedule(firstDay, lastDay);
        loaded = classes
          .filter(
            (item) =>
              item.status !== "cancelled" && item.status !== "completed",
          )
          .map(teacherClassToEvent);
      } else {
        const results = await Promise.allSettled([
          getCalendarEvents({ startDate: firstDay, endDate: lastDay }),
          getUpcomingClasses(),
        ]);
        const apiEvents =
          results[0].status === "fulfilled"
            ? results[0].value.map(studentCalendarEventToEvent)
            : [];
        const classEvents =
          results[1].status === "fulfilled"
            ? results[1].value
                .filter(
                  (item) =>
                    item.status !== "cancelled" && item.status !== "completed",
                )
                .map((item) => ({
                  id: item.id,
                  title:
                    item.subject || item.courseTitle || (fa ? "کلاس" : "Class"),
                  description: [item.courseTitle, item.teacherName]
                    .filter(Boolean)
                    .join(" · "),
                  start:
                    item.startTime && !item.scheduledDate.includes("T")
                      ? `${item.scheduledDate}T${item.startTime}:00`
                      : item.scheduledDate,
                  end:
                    item.endTime && !item.scheduledDate.includes("T")
                      ? `${item.scheduledDate}T${item.endTime}:00`
                      : undefined,
                  type: "class" as const,
                  courseTitle: item.courseTitle,
                  meetingUrl: item.meetingUrl,
                }))
            : [];
        const merged = new Map(apiEvents.map((item) => [item.id, item]));
        for (const event of classEvents) {
          const existing = merged.get(event.id);
          merged.set(
            event.id,
            existing
              ? {
                  ...existing,
                  ...event,
                  description: existing.description || event.description,
                }
              : event,
          );
        }
        loaded = [...merged.values()];
        if (results.every((result) => result.status === "rejected"))
          setError(true);
      }
      const visible = loaded.filter((event) => {
        const key = localDateKey(event.start);
        return key >= firstDay && key <= lastDay;
      });
      setEvents(
        visible.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        ),
      );
    } catch {
      setEvents([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [audience, fa, firstDay, lastDay]);

  useEffect(() => {
    void loadEvents();
    const interval = window.setInterval(() => void loadEvents(), 60_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void loadEvents();
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadEvents]);

  useEffect(() => {
    if (!today || !range) return;
    const currentKey = localDateKey(selectedDay);
    if (!currentKey || currentKey < firstDay || currentKey > lastDay) {
      const todayKey = toDateParam(today);
      setSelectedDay(
        todayKey >= firstDay && todayKey <= lastDay ? todayKey : firstDay,
      );
    }
  }, [firstDay, lastDay, range, selectedDay, today]);

  if (!today || !currentDate || !range) {
    return (
      <div
        className="min-h-[300px] rounded-lg bg-sage/40 animate-pulse"
        aria-hidden="true"
      />
    );
  }

  const { first, last } = range;
  const daysInMonth =
    Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1;
  const startsOnSaturday = fa;
  const leadingBlanks = startsOnSaturday
    ? (first.getDay() + 1) % 7
    : (first.getDay() + 6) % 7;
  const weekStart = startsOnSaturday
    ? new Date(Date.UTC(2026, 0, 3, 12))
    : new Date(Date.UTC(2026, 0, 5, 12));
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const headerFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const selectedEvents = events.filter(
    (event) => localDateKey(event.start) === selectedDay,
  );
  const eventCountForDay = (date: Date) =>
    events.filter((event) => localDateKey(event.start) === toDateParam(date))
      .length;
  const changeMonth = (offset: number) => {
    const next =
      offset < 0
        ? new Date(
            first.getFullYear(),
            first.getMonth(),
            first.getDate() - 1,
            12,
          )
        : new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1, 12);
    setCurrentDate(next);
  };
  const goToToday = () => {
    const now = new Date();
    setToday(now);
    setCurrentDate(now);
    setSelectedDay(toDateParam(now));
  };
  const formatEventTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || !value.includes("T")) return "";
    return date.toLocaleTimeString(fa ? "fa-IR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const eventColor = (type: LiveEvent["type"]) =>
    type === "class"
      ? "bg-blue"
      : type === "assignment_due"
        ? "bg-goldDeep"
        : type === "exam"
          ? "bg-danger"
          : type === "practice"
            ? "bg-sageDeep"
            : "bg-muted";
  const selectedDate = new Date(`${selectedDay}T12:00:00`);
  const selectedDateLabel = selectedDay
    ? selectedDate.toLocaleDateString(fa ? "fa-IR" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="bg-gradient-to-br from-sage to-[#F1F7EE] p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-sageDeep" />
            <h3 className="m-0 text-[17px] font-semibold">
              {headerFormatter.format(currentDate)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void loadEvents()}
              aria-label={fa ? "به‌روزرسانی برنامه" : "Refresh calendar"}
              title={fa ? "به‌روزرسانی" : "Refresh"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-sageDeep/25 bg-white text-sageDeep hover:bg-sage/20"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label={fa ? "ماه قبل" : "Previous month"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-sageDeep/25 bg-white text-sageDeep hover:bg-sage/20"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="h-7 rounded-full border border-sageDeep/25 bg-white px-2 text-[10px] font-bold text-sageDeep hover:bg-sage/20"
            >
              {fa ? "امروز" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label={fa ? "ماه بعد" : "Next month"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-sageDeep/25 bg-white text-sageDeep hover:bg-sage/20"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={`weekday-${index}`}
              className="pb-1.5 text-[10px] font-bold text-sageDeep/75"
            >
              {weekdayFormatter.format(
                new Date(weekStart.getTime() + index * 86_400_000),
              )}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const date = new Date(
              first.getFullYear(),
              first.getMonth(),
              first.getDate() + index,
              12,
            );
            const key = toDateParam(date);
            const isToday = key === toDateParam(today);
            const isSelected = key === selectedDay;
            const eventCount = eventCountForDay(date);
            return (
              <button
                key={key}
                type="button"
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                onClick={() => setSelectedDay(key)}
                className={`relative flex min-h-9 flex-col items-center justify-center rounded-[9px] py-1 text-[12px] font-medium transition-colors ${isSelected ? "bg-ink text-white" : isToday ? "bg-white font-bold text-ink ring-1 ring-ink/20" : "text-ink70 hover:bg-white/70"}`}
              >
                <span>{dayFormatter.format(date)}</span>
                {eventCount > 0 && (
                  <span className="mt-0.5 flex gap-0.5">
                    {Array.from(
                      { length: Math.min(eventCount, 3) },
                      (_, dot) => (
                        <i
                          key={dot}
                          className={`h-1 w-1 rounded-full ${isSelected ? "bg-gold" : "bg-blue"}`}
                        />
                      ),
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-[9px] text-sageDeep/80">
          <span className="flex items-center gap-1.5">
            <i className="h-1.5 w-1.5 rounded-full bg-blue" />
            {fa ? "برنامه ثبت‌شده" : "Scheduled event"}
          </span>
          <span>
            {loading ? (
              <span className="inline-flex items-center gap-1">
                <LoaderCircle size={11} className="animate-spin" />
                {fa ? "در حال همگام‌سازی" : "Syncing"}
              </span>
            ) : error ? (
              fa ? (
                "اتصال تقویم برقرار نشد"
              ) : (
                "Calendar sync unavailable"
              )
            ) : fa ? (
              "همگام‌سازی خودکار"
            ) : (
              "Auto-synced"
            )}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="m-0 text-[12px] font-semibold">{selectedDateLabel}</h4>
          <span className="text-[10px] text-muted">
            {selectedEvents.length
              ? `${selectedEvents.length} ${fa ? "رویداد" : "events"}`
              : ""}
          </span>
        </div>
        {selectedEvents.length ? (
          <div className="space-y-2">
            {selectedEvents.map((event) => {
              const time = formatEventTime(event.start);
              const scheduleHref =
                audience === "teacher"
                  ? href("/teacher/schedule")
                  : href(
                      event.type === "assignment_due"
                        ? "/dashboard/assignments"
                        : "/dashboard/classes",
                    );
              return (
                <article
                  key={event.id}
                  className="flex items-start gap-2.5 rounded-xl border border-line bg-cream/50 p-2.5"
                >
                  <i
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${eventColor(event.type)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="m-0 truncate text-[11px] font-semibold">
                      {event.title}
                    </h5>
                    <p className="mb-0 mt-0.5 truncate text-[10px] text-muted">
                      {event.description ||
                        event.courseTitle ||
                        (time ? "" : fa ? "رویداد" : "Event")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {time && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-ink70">
                        <Clock3 size={10} />
                        {time}
                      </span>
                    )}
                    {event.meetingUrl &&
                    /^https:\/\//i.test(event.meetingUrl) ? (
                      <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-blue"
                      >
                        {fa ? "ورود" : "Join"}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link
                        href={scheduleHref}
                        className="text-[9px] font-bold text-blue"
                      >
                        {fa ? "جزئیات" : "Details"}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}{" "}
            {!loading && (
              <Link
                href={href(
                  audience === "teacher"
                    ? "/teacher/schedule"
                    : "/dashboard/classes",
                )}
                className="block pt-1 text-center text-[10px] font-semibold text-blue"
              >
                {fa ? "مشاهده همه برنامه‌ها" : "View full schedule"}
              </Link>
            )}
          </div>
        ) : (
          <p className="m-0 rounded-xl bg-cream/50 px-3 py-4 text-center text-[10px] leading-5 text-muted">
            {loading
              ? fa
                ? "در حال دریافت برنامه‌ی این روز…"
                : "Loading this day’s schedule…"
              : fa
                ? "برای این روز برنامه‌ای ثبت نشده."
                : "Nothing scheduled for this day."}
          </p>
        )}
      </div>
    </section>
  );
}
