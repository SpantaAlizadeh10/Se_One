"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  enrollStudentInClass,
  listStudentClassSlots,
  overlaps,
  type StudentAvailableClass,
} from "@/lib/api/class-scheduling";

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function formatTime(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export default function StudentClassBrowser() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";
  const [classes, setClasses] = useState<StudentAvailableClass[]>([]);
  const [teacherFilter, setTeacherFilter] = useState("");
  const [classTypeFilter, setClassTypeFilter] = useState<
    "all" | "public" | "private"
  >("all");
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => setClasses(await listStudentClassSlots());

  useEffect(() => {
    if (!isApiConfigured()) {
      setError(
        fa ? "آدرس API تنظیم نشده است." : "Backend API is not configured.",
      );
      setLoading(false);
      return;
    }
    listStudentClassSlots()
      .then(setClasses)
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Could not load classes.",
        ),
      )
      .finally(() => setLoading(false));
  }, [fa]);

  const teachers = useMemo(() => {
    const unique = new Map<string, string>();
    classes.forEach((item) => unique.set(item.teacherId, item.teacherName));
    return [...unique.entries()].map(([id, name]) => ({ id, name }));
  }, [classes]);

  const visibleClasses = useMemo(
    () =>
      classes.filter(
        (item) =>
          (!teacherFilter || item.teacherId === teacherFilter) &&
          (classTypeFilter === "all" || item.classType === classTypeFilter),
      ),
    [classes, teacherFilter, classTypeFilter],
  );
  const myClasses = classes.filter((item) => item.enrolled);

  const hasStudentTimeConflict = (candidate: StudentAvailableClass) =>
    myClasses.some(
      (enrolled) =>
        enrolled.assignmentId !== candidate.assignmentId &&
        overlaps(
          candidate.startsAt,
          candidate.endsAt,
          enrolled.startsAt,
          enrolled.endsAt,
        ),
    );

  const enroll = async (item: StudentAvailableClass) => {
    if (
      item.enrolled ||
      item.remainingSeats <= 0 ||
      hasStudentTimeConflict(item)
    )
      return;
    setEnrollingId(item.assignmentId);
    setError("");
    setNotice("");
    try {
      await enrollStudentInClass(item.assignmentId);
      await refresh();
      setNotice(
        fa
          ? "ثبت‌نام شما در کلاس انجام شد."
          : "You are enrolled in this class.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ثبت‌نام انجام نشد؛ ظرفیت و برنامه زمانی را بررسی کنید."
            : "Enrollment failed. Check seats and your schedule.",
      );
    } finally {
      setEnrollingId("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-serif text-[23px] font-semibold">
            {fa ? "انتخاب کلاس" : "Choose a class"}
          </h2>
          <p className="m-0 max-w-2xl text-[13px] text-muted">
            {fa
              ? "معلم را فیلتر کنید، تاریخ و ظرفیت باقی‌مانده را ببینید و در کلاس‌های دارای صندلی خالی ثبت‌نام کنید."
              : "Filter by teacher, check the dates and remaining seats, and enroll while seats are available."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="min-w-[180px] text-[12px] font-semibold text-muted">
            <span className="mb-1 block">
              {fa ? "فیلتر معلم" : "Filter by teacher"}
            </span>
            <select
              value={teacherFilter}
              onChange={(event) => setTeacherFilter(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه معلم‌ها" : "All teachers"}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[150px] text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "نوع کلاس" : "Class type"}</span>
            <select
              value={classTypeFilter}
              onChange={(event) =>
                setClassTypeFilter(
                  event.target.value as "all" | "public" | "private",
                )
              }
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
            >
              <option value="all">{fa ? "همه کلاس‌ها" : "All classes"}</option>
              <option value="public">
                {fa ? "عمومی · ۱۰ نفره" : "Public · 10 seats"}
              </option>
              <option value="private">
                {fa ? "خصوصی · ۱ تا ۲ نفره" : "Private · 1–2 seats"}
              </option>
            </select>
          </label>
        </div>
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

      {myClasses.length > 0 && (
        <section className="rounded-2xl border border-sage/60 bg-sage/20 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">
            {fa ? "کلاس‌های ثبت‌نام‌شده من" : "My enrolled classes"}
          </h3>
          <div className="space-y-2">
            {myClasses.map((item) => (
              <div
                key={item.assignmentId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[12px]"
              >
                <span className="font-semibold">
                  {item.title} · {item.teacherName}
                </span>
                <span className="text-muted">
                  {formatDate(item.startsAt, locale)} ·{" "}
                  {formatTime(item.startsAt, locale)}–
                  {formatTime(item.endsAt, locale)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-[13px] text-muted">
          {fa ? "در حال بارگذاری کلاس‌ها…" : "Loading classes…"}
        </p>
      ) : visibleClasses.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-[13px] text-muted">
          {fa
            ? "کلاسی با این فیلتر پیدا نشد."
            : "No classes found for this teacher filter."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleClasses.map((item) => {
            const full = item.remainingSeats <= 0;
            const conflict = !item.enrolled && hasStudentTimeConflict(item);
            const canEnroll = !item.enrolled && !full && !conflict;
            return (
              <article
                key={item.assignmentId}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                      {item.teacherName}
                    </div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
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
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${full ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}
                  >
                    {full
                      ? fa
                        ? "ظرفیت تکمیل"
                        : "Full"
                      : fa
                        ? `${item.remainingSeats} صندلی خالی`
                        : `${item.remainingSeats} seats left`}
                  </span>
                </div>
                <p className="mb-3 text-[12.5px] text-muted">
                  {item.description}
                </p>
                <div className="space-y-2 text-[12.5px] text-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(item.startsAt, locale)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    {formatTime(item.startsAt, locale)} –{" "}
                    {formatTime(item.endsAt, locale)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    {fa
                      ? `${item.remainingSeats} صندلی خالی از ${item.capacity}`
                      : `${item.remainingSeats} of ${item.capacity} seats available`}
                  </div>
                </div>
                {conflict && (
                  <p className="mb-0 mt-3 text-[12px] text-danger">
                    {fa
                      ? "با یکی از کلاس‌های ثبت‌نام‌شده شما تداخل دارد."
                      : "This class overlaps with one of your enrolled classes."}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!canEnroll || enrollingId === item.assignmentId}
                  onClick={() => void enroll(item)}
                  className="mt-4 w-full rounded-xl bg-blue px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enrollingId === item.assignmentId
                    ? fa
                      ? "در حال ثبت‌نام…"
                      : "Enrolling…"
                    : item.enrolled
                      ? fa
                        ? "ثبت‌نام‌شده"
                        : "Enrolled"
                      : full
                        ? fa
                          ? "ظرفیت تکمیل است"
                          : "No seats left"
                        : conflict
                          ? fa
                            ? "تداخل زمانی"
                            : "Schedule conflict"
                          : fa
                            ? "ثبت‌نام در کلاس"
                            : "Enroll in class"}
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-cream p-4">
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-sageDeep">
          <CheckCircle2 size={16} />
          <BookOpen size={15} />
          {fa
            ? "ظرفیت کلاس عمومی ۱۰ نفر و کلاس خصوصی ۱ یا ۲ نفر است؛ سرور ظرفیت را هنگام ثبت‌نام دوباره بررسی می‌کند."
            : "Public classes hold 10 students; private classes hold 1–2. The server rechecks capacity at enrollment."}
        </div>
      </div>
    </div>
  );
}
