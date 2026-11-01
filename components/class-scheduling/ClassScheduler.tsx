"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Users, Plus, CheckCircle2 } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAdminClassSlot,
  listAdminClassSlots,
  reviewAdminTeacherClassAssignment,
  type AdminClassSlot,
  type CreateClassSlotInput,
  type TeacherClassAssignment,
} from "@/lib/api/class-scheduling";
import {
  getDemoAdminClassSlots,
  onDemoClassSchedulingChange,
  reviewDemoTeacherClass,
} from "@/lib/demo-class-scheduling";

const defaultSlot = {
  title: "",
  description: "",
  classType: "public" as "public" | "private",
  capacity: 10,
  teacherRole: "all",
  startsAt: "",
  endsAt: "",
};

type DisplayClassSlot = AdminClassSlot & {
  courseTitle?: string;
  isDemo?: boolean;
  teacherAssignments?: (TeacherClassAssignment & { isDemo?: boolean })[];
};

function localDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateDate(current: string, selectedDate: Date | null) {
  if (!selectedDate) return "";
  const time = current.split("T")[1]?.slice(0, 5) || "09:00";
  return localDateTime(selectedDate, time);
}

function updateTime(current: string, time: string) {
  const date = current ? new Date(current) : new Date();
  return localDateTime(date, time);
}

export default function ClassScheduler() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [slot, setSlot] = useState(defaultSlot);
  const [saving, setSaving] = useState(false);
  const [reviewingAssignmentId, setReviewingAssignmentId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<DisplayClassSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const loadedSlots = isApiConfigured() ? await listAdminClassSlots() : [];
    const demoSlots = getDemoAdminClassSlots().map((slot) => ({
      ...slot,
      isDemo: true as const,
      teacherAssignments: slot.teacherAssignments.map((assignment) => ({
        ...assignment,
        isDemo: true,
      })),
    }));
    setSlots([...loadedSlots, ...demoSlots]);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (reason) {
        if (active) {
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

  const reviewTeacherRequest = async (
    slotItem: DisplayClassSlot,
    assignment: TeacherClassAssignment & { isDemo?: boolean },
    status: "confirmed" | "cancelled",
  ) => {
    setReviewingAssignmentId(assignment.id);
    setError("");
    setMessage("");
    try {
      if (assignment.isDemo || slotItem.isDemo) {
        reviewDemoTeacherClass(assignment.id, status);
      } else {
        await reviewAdminTeacherClassAssignment(assignment.id, status);
      }
      await refresh();
      setMessage(
        fa
          ? status === "confirmed"
            ? "درخواست معلم تأیید شد؛ کلاس برای رزرو دانش‌آموزان فعال است."
            : "درخواست معلم رد شد."
          : status === "confirmed"
            ? "Teacher request approved. The class is now available to students."
            : "Teacher request rejected.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "بررسی درخواست انجام نشد."
            : "Could not review the teacher request.",
      );
    } finally {
      setReviewingAssignmentId("");
    }
  };

  const handleChange = (
    field: keyof typeof defaultSlot,
    value: string | number,
  ) => {
    setSlot((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!slot.title || !slot.startsAt || !slot.endsAt) {
        throw new Error("Title, start time, and end time are required.");
      }
      if (new Date(slot.startsAt).getTime() <= Date.now()) {
        throw new Error(
          fa
            ? "زمان شروع باید در آینده باشد."
            : "Start time must be in the future.",
        );
      }
      if (
        new Date(slot.endsAt).getTime() <= new Date(slot.startsAt).getTime()
      ) {
        throw new Error(
          fa
            ? "زمان پایان باید بعد از زمان شروع باشد."
            : "End time must be after start time.",
        );
      }

      const input: CreateClassSlotInput = {
        ...slot,
        startsAt: new Date(slot.startsAt).toISOString(),
        endsAt: new Date(slot.endsAt).toISOString(),
      };
      const created = await createAdminClassSlot(input);
      await refresh();
      setSlots((current) =>
        current.some((item) => item.id === created.id)
          ? current
          : [created, ...current],
      );
      setSlot(defaultSlot);
      setMessage(
        fa
          ? `کلاس ${slot.classType === "private" ? "خصوصی" : "عمومی"} با ظرفیت ${input.capacity} نفر ساخته شد.`
          : `${slot.classType === "private" ? "Private" : "Public"} class created with ${input.capacity} seat${input.capacity === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not create class slot.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-blue/10 p-2 text-blue">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2 className="font-serif text-[22px] font-semibold">
              Create public class slot
            </h2>
            <p className="text-[13px] text-muted">
              {fa
                ? "کلاس عمومی با ظرفیت ۱۰ نفر یا خصوصی با ظرفیت ۱ تا ۲ نفر بسازید؛ معلم‌ها برای تدریس انتخابش می‌کنند."
                : "Create a public class for 10 students or a private class for 1–2. Teachers can accept it for teaching."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-[13px] text-muted">
            <span>Title</span>
            <input
              value={slot.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
              placeholder="Conversation Club"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>{fa ? "نوع کلاس" : "Class type"}</span>
            <select
              value={slot.classType}
              onChange={(e) => {
                const classType = e.target.value as "public" | "private";
                setSlot((current) => ({
                  ...current,
                  classType,
                  capacity: classType === "private" ? 1 : 10,
                }));
              }}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            >
              <option value="public">
                {fa ? "عمومی (۱۰ نفر)" : "Public (10 students)"}
              </option>
              <option value="private">
                {fa ? "خصوصی (۱ تا ۲ نفر)" : "Private (1–2 students)"}
              </option>
            </select>
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>Teacher role</span>
            <select
              value={slot.teacherRole}
              onChange={(e) => handleChange("teacherRole", e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            >
              <option value="all">{fa ? "همه معلم‌ها" : "All teachers"}</option>
              <option value="english">{fa ? "انگلیسی" : "English"}</option>
              <option value="math">{fa ? "ریاضی" : "Math"}</option>
            </select>
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>{fa ? "تاریخ و ساعت شروع" : "Start date & time"}</span>
            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
              <DatePicker
                key={fa ? "persian-start" : "gregorian-start"}
                value={slot.startsAt ? new Date(slot.startsAt) : ""}
                calendar={fa ? persian : undefined}
                locale={fa ? persian_fa : undefined}
                placeholder={fa ? "تاریخ شمسی را انتخاب کنید" : "Select a date"}
                format={fa ? "YYYY/MM/DD" : "MMM DD, YYYY"}
                calendarPosition={fa ? "bottom-right" : "bottom-left"}
                inputClass="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
                onChange={(value) =>
                  handleChange(
                    "startsAt",
                    updateDate(
                      slot.startsAt,
                      value && !Array.isArray(value) ? value.toDate() : null,
                    ),
                  )
                }
              />
              <input
                type="time"
                lang={fa ? "fa-IR" : "en-US"}
                aria-label={fa ? "ساعت شروع" : "Start time"}
                value={slot.startsAt.split("T")[1]?.slice(0, 5) ?? ""}
                onChange={(event) =>
                  handleChange(
                    "startsAt",
                    updateTime(slot.startsAt, event.target.value),
                  )
                }
                className="w-full rounded-xl border border-line bg-cream px-2 py-3 outline-none focus:border-blue"
              />
            </div>
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>{fa ? "تاریخ و ساعت پایان" : "End date & time"}</span>
            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
              <DatePicker
                key={fa ? "persian-end" : "gregorian-end"}
                value={slot.endsAt ? new Date(slot.endsAt) : ""}
                calendar={fa ? persian : undefined}
                locale={fa ? persian_fa : undefined}
                placeholder={fa ? "تاریخ شمسی را انتخاب کنید" : "Select a date"}
                format={fa ? "YYYY/MM/DD" : "MMM DD, YYYY"}
                calendarPosition={fa ? "bottom-right" : "bottom-left"}
                inputClass="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
                onChange={(value) =>
                  handleChange(
                    "endsAt",
                    updateDate(
                      slot.endsAt,
                      value && !Array.isArray(value) ? value.toDate() : null,
                    ),
                  )
                }
              />
              <input
                type="time"
                lang={fa ? "fa-IR" : "en-US"}
                aria-label={fa ? "ساعت پایان" : "End time"}
                value={slot.endsAt.split("T")[1]?.slice(0, 5) ?? ""}
                onChange={(event) =>
                  handleChange(
                    "endsAt",
                    updateTime(slot.endsAt, event.target.value),
                  )
                }
                className="w-full rounded-xl border border-line bg-cream px-2 py-3 outline-none focus:border-blue"
              />
            </div>
          </label>

          <label className="space-y-2 text-[13px] text-muted md:col-span-2">
            <span>{fa ? "توضیحات" : "Description"}</span>
            <textarea
              value={slot.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
              placeholder="Class description"
            />
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>{fa ? "ظرفیت" : "Capacity"}</span>
            {slot.classType === "private" ? (
              <select
                value={slot.capacity}
                onChange={(e) =>
                  handleChange("capacity", Number(e.target.value))
                }
                className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
              >
                <option value={1}>{fa ? "۱ دانش‌آموز" : "1 student"}</option>
                <option value={2}>{fa ? "۲ دانش‌آموز" : "2 students"}</option>
              </select>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-3">
                <Users size={16} />
                <strong className="text-ink">
                  10 {fa ? "نفر" : "students"}
                </strong>
              </div>
            )}
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-70"
          >
            <Plus size={16} />
            {saving
              ? fa
                ? "در حال ذخیره…"
                : "Saving…"
              : fa
                ? "ساخت کلاس"
                : "Create class"}
          </button>
        </div>

        {(message || error) && (
          <div
            role={error ? "alert" : "status"}
            className={`mt-4 rounded-xl border px-3 py-2 text-[12px] ${error ? "border-danger/25 bg-danger/10 text-danger" : "border-success/25 bg-success/10 text-success"}`}
          >
            {error || message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-sage/20 p-2 text-sageDeep">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-semibold">
              {fa ? "کلاس‌های تعریف‌شده" : "Scheduled classes"}
            </h3>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <p className="text-[13px] text-muted">
              {fa ? "در حال بارگذاری…" : "Loading…"}
            </p>
          ) : slots.length === 0 ? (
            <p className="text-[13px] text-muted">
              {fa ? "هنوز کلاسی تعریف نشده است." : "No classes scheduled yet."}
            </p>
          ) : (
            slots.map((slotItem) => (
              <div
                key={slotItem.id}
                className="rounded-2xl border border-line bg-cream p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-ink">{slotItem.title}</h4>
                    {slotItem.courseTitle && (
                      <p className="mt-1 text-[11px] font-medium text-blue">
                        {fa ? "دوره:" : "Course:"} {slotItem.courseTitle}
                      </p>
                    )}
                    <p className="text-[12px] text-muted">
                      {fa
                        ? `${slotItem.classType === "private" ? "خصوصی" : "عمومی"} · ظرفیت ${slotItem.capacity} نفر`
                        : `${slotItem.classType === "private" ? "Private" : "Public"} · Capacity ${slotItem.capacity}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {slotItem.isDemo && (
                      <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue">
                        {fa ? "نمونه" : "Demo"}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-medium text-success">
                      <CheckCircle2 size={12} />
                      {slotItem.remainingSeats > 0
                        ? fa
                          ? "ظرفیت دارد"
                          : "Open"
                        : fa
                          ? "تکمیل"
                          : "Full"}
                    </span>
                  </div>
                </div>

                <p className="mb-3 text-[12.5px] text-muted">
                  {slotItem.description}
                </p>

                <div className="mb-3 space-y-2">
                  {(slotItem.teacherAssignments ?? []).length === 0 ? (
                    <p className="text-[11px] text-muted">
                      {fa
                        ? "هنوز معلمی برای برگزاری این کلاس درخواست نداده است."
                        : "No teacher has requested this class yet."}
                    </p>
                  ) : (
                    slotItem.teacherAssignments?.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2"
                      >
                        <div className="text-[12px]">
                          <span className="font-semibold">
                            {assignment.teacherName || assignment.teacherId}
                          </span>
                          <span
                            className={`ms-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              assignment.status === "confirmed"
                                ? "bg-success/10 text-success"
                                : assignment.status === "pending"
                                  ? "bg-gold/15 text-goldDeep"
                                  : "bg-danger/10 text-danger"
                            }`}
                          >
                            {fa
                              ? assignment.status === "confirmed"
                                ? "تأییدشده"
                                : assignment.status === "pending"
                                  ? "در انتظار تأیید"
                                  : "ردشده"
                              : assignment.status === "confirmed"
                                ? "Approved"
                                : assignment.status === "pending"
                                  ? "Pending"
                                  : "Rejected"}
                          </span>
                        </div>
                        {assignment.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={reviewingAssignmentId === assignment.id}
                              onClick={() =>
                                void reviewTeacherRequest(
                                  slotItem,
                                  assignment,
                                  "confirmed",
                                )
                              }
                              className="rounded-full bg-success px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
                            >
                              {fa ? "تأیید" : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={reviewingAssignmentId === assignment.id}
                              onClick={() =>
                                void reviewTeacherRequest(
                                  slotItem,
                                  assignment,
                                  "cancelled",
                                )
                              }
                              className="rounded-full bg-danger/10 px-3 py-1.5 text-[11px] font-semibold text-danger disabled:opacity-60"
                            >
                              {fa ? "رد درخواست" : "Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 text-[12.5px] text-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    <span>
                      {new Intl.DateTimeFormat(
                        fa ? "fa-IR-u-ca-persian" : "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      ).format(new Date(slotItem.startsAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    <span>
                      {new Intl.DateTimeFormat(
                        fa ? "fa-IR-u-ca-persian" : "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      ).format(new Date(slotItem.endsAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>
                      {fa
                        ? `${slotItem.remainingSeats} صندلی خالی از ${slotItem.capacity}`
                        : `${slotItem.remainingSeats} of ${slotItem.capacity} seats available`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
