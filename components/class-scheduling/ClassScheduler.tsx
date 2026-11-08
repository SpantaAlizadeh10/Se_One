"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Save,
  Search,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import { listAdminStudents, type AdminStudent } from "@/lib/api/admin";
import {
  addAdminStudentToClass,
  createAdminClassSlot,
  assignTeacherToClassSlot,
  listAdminClassEnrollments,
  listAvailableTeachersForClass,
  listAdminClassSlots,
  moveAdminClassEnrollment,
  replaceAdminClassTeacher,
  reviewAdminTeacherClassAssignment,
  toDateTimeLocalValue,
  updateAdminClassSlot,
  type AdminClassSlot,
  type AdminClassEnrollment,
  type AdminAssignableTeacher,
  type CreateClassSlotInput,
  type ClassType,
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
  level: "",
  classType: "public" as ClassType,
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

type SlotEditDraft = {
  title: string;
  description: string;
  level: string;
  classType: ClassType;
  capacity: number;
  teacherRole: string;
  startsAt: string;
  endsAt: string;
  basePrice: number;
  currency: string;
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
  const [availableTeachers, setAvailableTeachers] = useState<
    Record<string, AdminAssignableTeacher[]>
  >({});
  const [selectedTeachers, setSelectedTeachers] = useState<
    Record<string, string>
  >({});
  const [loadingAvailabilityId, setLoadingAvailabilityId] = useState("");
  const [assigningSlotId, setAssigningSlotId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<DisplayClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlotId, setEditingSlotId] = useState("");
  const [editDraft, setEditDraft] = useState<SlotEditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedEditTeacher, setSelectedEditTeacher] = useState("");
  const [changingTeacher, setChangingTeacher] = useState(false);
  const [rosterSlotId, setRosterSlotId] = useState("");
  const [classRosters, setClassRosters] = useState<
    Record<string, AdminClassEnrollment[]>
  >({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentCandidates, setStudentCandidates] = useState<AdminStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentTargetByEnrollment, setStudentTargetByEnrollment] = useState<
    Record<string, string>
  >({});
  const [movingEnrollmentId, setMovingEnrollmentId] = useState("");

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

  const beginEdit = async (slotItem: DisplayClassSlot) => {
    setEditingSlotId(slotItem.id);
    setError("");
    setEditDraft({
      title: slotItem.title,
      description: slotItem.description,
      level: slotItem.level ?? "",
      classType: slotItem.classType,
      capacity: slotItem.capacity,
      teacherRole: slotItem.teacherRole,
      startsAt: toDateTimeLocalValue(slotItem.startsAt),
      endsAt: toDateTimeLocalValue(slotItem.endsAt),
      basePrice: slotItem.basePrice ?? 0,
      currency: slotItem.currency || "IRR",
    });
    const activeTeacher = slotItem.teacherAssignments?.find(
      (assignment) => assignment.status === "confirmed",
    );
    setSelectedEditTeacher(activeTeacher?.teacherId ?? "");
    try {
      const teachers = await listAvailableTeachersForClass(slotItem.id);
      setAvailableTeachers((current) => ({ ...current, [slotItem.id]: teachers }));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "فهرست مدرسان واجدشرایط دریافت نشد."
            : "Could not load eligible teachers.",
      );
    }
  };

  const saveClassEdit = async (slotItem: DisplayClassSlot) => {
    if (!editDraft) return;
    if (
      !editDraft.title.trim() ||
      !editDraft.level.trim() ||
      !editDraft.startsAt ||
      !editDraft.endsAt ||
      !Number.isInteger(editDraft.capacity) ||
      editDraft.capacity < 1 ||
      editDraft.basePrice < 0
    ) {
      setError(
        fa
          ? "اطلاعات کلاس، ظرفیت و قیمت را معتبر وارد کنید."
          : "Enter valid class details, capacity, and price.",
      );
      return;
    }
    if (
      editDraft.classType === "semi_private" &&
      slotItem.enrolledCount > 4
    ) {
      setError(
        fa
          ? "این کلاس بیش از ۴ دانش‌آموز فعال دارد و نمی‌تواند نیمه‌خصوصی شود."
          : "This class has more than 4 active students and cannot become semi-private.",
      );
      return;
    }
    if (new Date(editDraft.endsAt) <= new Date(editDraft.startsAt)) {
      setError(
        fa
          ? "زمان پایان باید بعد از زمان شروع باشد."
          : "End time must be after start time.",
      );
      return;
    }

    setSavingEdit(true);
    setError("");
    setMessage("");
    try {
      await updateAdminClassSlot(slotItem.id, {
        title: editDraft.title.trim(),
        description: editDraft.description.trim(),
        level: editDraft.level,
        classType: editDraft.classType,
        capacity: editDraft.capacity,
        teacherRole: editDraft.teacherRole,
        startsAt: new Date(editDraft.startsAt).toISOString(),
        endsAt: new Date(editDraft.endsAt).toISOString(),
        basePrice: editDraft.basePrice,
        currency: editDraft.currency,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      await refresh();
      setEditingSlotId("");
      setEditDraft(null);
      setMessage(
        fa ? "اطلاعات کلاس ذخیره شد." : "Class details were saved.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ویرایش کلاس انجام نشد."
            : "Could not update the class.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const saveClassTeacher = async (slotItem: DisplayClassSlot) => {
    setChangingTeacher(true);
    setError("");
    try {
      await replaceAdminClassTeacher(
        slotItem.id,
        selectedEditTeacher || null,
      );
      await refresh();
      setMessage(
        fa ? "مدرس کلاس به‌روزرسانی شد." : "Class teacher was updated.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "تغییر مدرس انجام نشد."
            : "Could not change the class teacher.",
      );
    } finally {
      setChangingTeacher(false);
    }
  };

  const openRoster = async (slotItem: DisplayClassSlot) => {
    setRosterSlotId(slotItem.id);
    setLoadingRoster(true);
    setError("");
    try {
      const enrollments = await listAdminClassEnrollments(slotItem.id);
      setClassRosters((current) => ({
        ...current,
        [slotItem.id]: enrollments,
      }));
      const students = await listAdminStudents({ page: 1, pageSize: 20 });
      setStudentCandidates(
        students.items.filter((student) => student.status === "active"),
      );
      setSelectedStudentId("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "فهرست دانش‌آموزان کلاس دریافت نشد."
            : "Could not load the class roster.",
      );
    } finally {
      setLoadingRoster(false);
    }
  };

  const searchStudents = async () => {
    setLoadingRoster(true);
    setError("");
    try {
      const result = await listAdminStudents({
        page: 1,
        pageSize: 20,
        search: studentSearch.trim() || undefined,
      });
      setStudentCandidates(
        result.items.filter((student) => student.status === "active"),
      );
      setSelectedStudentId("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "جستجوی دانش‌آموز ناموفق بود."
            : "Could not search students.",
      );
    } finally {
      setLoadingRoster(false);
    }
  };

  const addStudentToSlot = async (slotItem: DisplayClassSlot) => {
    if (!selectedStudentId) return;
    setAddingStudent(true);
    setError("");
    try {
      await addAdminStudentToClass(slotItem.id, selectedStudentId);
      await openRoster(slotItem);
      await refresh();
      setMessage(
        fa ? "دانش‌آموز به کلاس اضافه شد." : "Student added to the class.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "افزودن دانش‌آموز انجام نشد."
            : "Could not add the student.",
      );
    } finally {
      setAddingStudent(false);
    }
  };

  const moveStudent = async (
    enrollment: AdminClassEnrollment,
  ) => {
    const targetSlotId = studentTargetByEnrollment[enrollment.id];
    if (!targetSlotId) return;
    setMovingEnrollmentId(enrollment.id);
    setError("");
    try {
      await moveAdminClassEnrollment(enrollment.id, targetSlotId);
      if (rosterSlotId) {
        const updatedRoster = await listAdminClassEnrollments(rosterSlotId);
        setClassRosters((current) => ({
          ...current,
          [rosterSlotId]: updatedRoster,
        }));
      }
      await refresh();
      setMessage(
        fa
          ? "دانش‌آموز با موفقیت به کلاس دیگر منتقل شد."
          : "Student was moved to the selected class.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "انتقال دانش‌آموز انجام نشد."
            : "Could not move the student.",
      );
    } finally {
      setMovingEnrollmentId("");
    }
  };

  const reviewAvailability = async (slotItem: DisplayClassSlot) => {
    setLoadingAvailabilityId(slotItem.id);
    setError("");
    try {
      const teachers = await listAvailableTeachersForClass(slotItem.id);
      setAvailableTeachers((current) => ({
        ...current,
        [slotItem.id]: teachers,
      }));
      setSelectedTeachers((current) => ({
        ...current,
        [slotItem.id]: current[slotItem.id] || teachers[0]?.id || "",
      }));
      if (teachers.length === 0) {
        setMessage(
          fa
            ? "معلم تأییدشده‌ای با زمان آزاد مناسب پیدا نشد."
            : "No approved teacher with matching availability was found.",
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "بررسی زمان‌های آزاد معلمان انجام نشد."
            : "Could not review teacher availability.",
      );
    } finally {
      setLoadingAvailabilityId("");
    }
  };

  const assignTeacher = async (slotItem: DisplayClassSlot) => {
    const teacherId = selectedTeachers[slotItem.id];
    if (!teacherId) return;
    setAssigningSlotId(slotItem.id);
    setError("");
    setMessage("");
    try {
      await assignTeacherToClassSlot(slotItem.id, teacherId);
      await refresh();
      setMessage(
        fa
          ? "معلم با موفقیت به کلاس اختصاص یافت."
          : "Teacher assigned to the class.",
      );
      setAvailableTeachers((current) => {
        const next = { ...current };
        delete next[slotItem.id];
        return next;
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "اختصاص معلم انجام نشد."
            : "Could not assign the teacher.",
      );
    } finally {
      setAssigningSlotId("");
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!slot.title || !slot.level || !slot.startsAt || !slot.endsAt) {
        throw new Error("Title, English level, start time, and end time are required.");
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
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
          ? `کلاس ${slot.classType === "semi_private" ? "نیمه‌خصوصی" : slot.classType === "private" ? "خصوصی" : "عمومی"} با ظرفیت ${created.capacity} نفر ساخته شد.`
          : `${slot.classType === "semi_private" ? "Semi-private" : slot.classType === "private" ? "Private" : "Public"} class created with ${created.capacity} seat${created.capacity === 1 ? "" : "s"}.`,
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
                ? "کلاس را با سطح، برنامه و ظرفیت موردنظر تعریف کنید؛ سپس زمان‌های آزاد معلمان را بررسی و معلم مناسب را اختصاص دهید."
                : "Define the class level, schedule, and capacity, then review teacher availability and assign a suitable teacher."}
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
            <span>{fa ? "سطح انگلیسی" : "English level"}</span>
            <select
              value={slot.level}
              onChange={(e) => handleChange("level", e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            >
              <option value="">{fa ? "انتخاب سطح" : "Select level"}</option>
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-[13px] text-muted">
            <span>{fa ? "نوع کلاس" : "Class type"}</span>
            <select
              value={slot.classType}
              onChange={(e) => {
                const classType = e.target.value as ClassType;
                setSlot((current) => ({
                  ...current,
                  classType,
                  capacity:
                    classType === "semi_private" ? 4 : current.capacity,
                }));
              }}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            >
              <option value="public">{fa ? "عمومی" : "Public"}</option>
              <option value="semi_private">
                {fa ? "نیمه‌خصوصی (۴ نفر)" : "Semi-private (4 seats)"}
              </option>
              <option value="private">{fa ? "خصوصی" : "Private"}</option>
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
            <input
              type="number"
              min={slot.classType === "semi_private" ? 4 : 1}
              max={slot.classType === "semi_private" ? 4 : undefined}
              step={1}
              value={slot.capacity}
              onChange={(e) => handleChange("capacity", Number(e.target.value))}
              disabled={slot.classType === "semi_private"}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 outline-none focus:border-blue"
            />
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
                        ? `${slotItem.classType === "semi_private" ? "نیمه‌خصوصی" : slotItem.classType === "private" ? "خصوصی" : "عمومی"} · ظرفیت ${slotItem.capacity} نفر${slotItem.level ? ` · سطح ${slotItem.level}` : ""}`
                        : `${slotItem.classType === "semi_private" ? "Semi-private" : slotItem.classType === "private" ? "Private" : "Public"} · Capacity ${slotItem.capacity}${slotItem.level ? ` · ${slotItem.level}` : ""}`}
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

                {!slotItem.isDemo && (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          editingSlotId === slotItem.id
                            ? (setEditingSlotId(""), setEditDraft(null))
                            : void beginEdit(slotItem)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-semibold hover:border-blue hover:text-blue"
                      >
                        {editingSlotId === slotItem.id ? (
                          <X size={14} />
                        ) : (
                          <Pencil size={14} />
                        )}
                        {editingSlotId === slotItem.id
                          ? fa
                            ? "بستن ویرایش"
                            : "Close editor"
                          : fa
                            ? "ویرایش کلاس"
                            : "Edit class"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          rosterSlotId === slotItem.id
                            ? setRosterSlotId("")
                            : void openRoster(slotItem)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-semibold hover:border-blue hover:text-blue"
                      >
                        <Users size={14} />
                        {rosterSlotId === slotItem.id
                          ? fa
                            ? "بستن فهرست"
                            : "Close roster"
                          : fa
                            ? "مدیریت دانش‌آموزان"
                            : "Manage students"}
                      </button>
                    </div>

                    {editingSlotId === slotItem.id && editDraft && (
                      <section className="mb-3 space-y-3 rounded-xl border border-blue/20 bg-white p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "نام کلاس" : "Class name"}
                            <input
                              value={editDraft.title}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  title: event.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "سطح" : "Level"}
                            <select
                              value={editDraft.level}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  level: event.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            >
                              {["A1", "A2", "B1", "B2", "C1", "C2"].map(
                                (level) => (
                                  <option key={level} value={level}>
                                    {level}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "نوع کلاس" : "Class type"}
                            <select
                              value={editDraft.classType}
                              onChange={(event) => {
                                const classType = event.target.value as ClassType;
                                setEditDraft({
                                  ...editDraft,
                                  classType,
                                  capacity:
                                    classType === "semi_private"
                                      ? 4
                                      : editDraft.capacity,
                                })
                              }}
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            >
                              <option value="public">
                                {fa ? "عمومی" : "Public"}
                              </option>
                              <option
                                value="semi_private"
                                disabled={slotItem.enrolledCount > 4}
                              >
                                {fa
                                  ? "نیمه‌خصوصی (۴ نفر)"
                                  : "Semi-private (4 seats)"}
                              </option>
                              <option value="private">
                                {fa ? "خصوصی" : "Private"}
                              </option>
                            </select>
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "ظرفیت" : "Capacity"}
                            <input
                              type="number"
                              min={
                                editDraft.classType === "semi_private"
                                  ? 4
                                  : Math.max(1, slotItem.enrolledCount)
                              }
                              max={
                                editDraft.classType === "semi_private"
                                  ? 4
                                  : undefined
                              }
                              step={1}
                              value={editDraft.capacity}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  capacity: Number(event.target.value),
                                })
                              }
                              disabled={
                                editDraft.classType === "semi_private"
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "قیمت" : "Price"}
                            <input
                              type="number"
                              min={0}
                              value={editDraft.basePrice}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  basePrice: Number(event.target.value),
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "واحد پول" : "Currency"}
                            <input
                              value={editDraft.currency}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  currency: event.target.value.toUpperCase(),
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "شروع" : "Starts at"}
                            <input
                              type="datetime-local"
                              value={editDraft.startsAt}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  startsAt: event.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted">
                            {fa ? "پایان" : "Ends at"}
                            <input
                              type="datetime-local"
                              value={editDraft.endsAt}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  endsAt: event.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-muted sm:col-span-2">
                            {fa ? "توضیحات" : "Description"}
                            <textarea
                              value={editDraft.description}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  description: event.target.value,
                                })
                              }
                              className="mt-1 min-h-20 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-normal text-ink"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void saveClassEdit(slotItem)}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
                          >
                            <Save size={14} />
                            {savingEdit
                              ? fa
                                ? "در حال ذخیره…"
                                : "Saving…"
                              : fa
                                ? "ذخیره تغییرات"
                                : "Save changes"}
                          </button>
                          <select
                            value={selectedEditTeacher}
                            onChange={(event) =>
                              setSelectedEditTeacher(event.target.value)
                            }
                            aria-label={fa ? "مدرس کلاس" : "Class teacher"}
                            className="min-w-48 flex-1 rounded-lg border border-line px-3 py-2 text-[11px]"
                          >
                            <option value="">
                              {fa ? "بدون مدرس" : "No teacher"}
                            </option>
                            {slotItem.teacherAssignments
                              ?.filter(
                                (assignment) =>
                                  assignment.status === "confirmed",
                              )
                              .map((assignment) => (
                                <option
                                  key={`current-${assignment.teacherId}`}
                                  value={assignment.teacherId}
                                >
                                  {assignment.teacherName ||
                                    assignment.teacherId}
                                </option>
                              ))}
                            {(availableTeachers[slotItem.id] ?? [])
                              .filter(
                                (teacher) =>
                                  !slotItem.teacherAssignments?.some(
                                    (assignment) =>
                                      assignment.teacherId === teacher.id,
                                  ),
                              )
                              .map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => void saveClassTeacher(slotItem)}
                            disabled={changingTeacher}
                            className="rounded-lg border border-line px-3 py-2 text-[11px] font-semibold disabled:opacity-60"
                          >
                            {changingTeacher
                              ? fa
                                ? "در حال تغییر…"
                                : "Updating…"
                              : fa
                                ? "ثبت مدرس"
                                : "Update teacher"}
                          </button>
                        </div>
                      </section>
                    )}

                    {rosterSlotId === slotItem.id && (
                      <section className="mb-3 space-y-3 rounded-xl border border-sage/50 bg-white p-3">
                        <h5 className="m-0 text-[12px] font-semibold">
                          {fa ? "دانش‌آموزان کلاس" : "Class students"}
                        </h5>
                        {loadingRoster ? (
                          <p className="m-0 text-[11px] text-muted">
                            {fa ? "در حال بارگذاری…" : "Loading…"}
                          </p>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {(classRosters[slotItem.id] ?? []).map(
                                (enrollment) => (
                                  <div
                                    key={enrollment.id}
                                    className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="m-0 truncate text-[11px] font-semibold">
                                        {enrollment.studentName ||
                                          enrollment.studentEmail ||
                                          enrollment.studentId}
                                      </p>
                                      <p className="m-0 text-[10px] text-muted">
                                        {enrollment.studentEmail}
                                      </p>
                                    </div>
                                    <select
                                      value={
                                        studentTargetByEnrollment[
                                          enrollment.id
                                        ] ?? ""
                                      }
                                      onChange={(event) =>
                                        setStudentTargetByEnrollment(
                                          (current) => ({
                                            ...current,
                                            [enrollment.id]:
                                              event.target.value,
                                          }),
                                        )
                                      }
                                      aria-label={
                                        fa
                                          ? "انتخاب کلاس مقصد"
                                          : "Select destination class"
                                      }
                                      className="max-w-48 rounded-lg border border-line px-2 py-1.5 text-[10px]"
                                    >
                                      <option value="">
                                        {fa ? "انتقال به کلاس…" : "Move to…"}
                                      </option>
                                      {slots
                                        .filter(
                                          (target) =>
                                            target.id !== slotItem.id &&
                                            !target.isDemo &&
                                            target.status === "active" &&
                                            target.remainingSeats > 0,
                                        )
                                        .map((target) => (
                                          <option
                                            key={target.id}
                                            value={target.id}
                                          >
                                            {target.title} ·{" "}
                                            {target.remainingSeats}{" "}
                                            {fa ? "ظرفیت" : "seats"}
                                          </option>
                                        ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void moveStudent(enrollment)
                                      }
                                      disabled={
                                        movingEnrollmentId === enrollment.id ||
                                        !studentTargetByEnrollment[
                                          enrollment.id
                                        ]
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-[10px] font-semibold disabled:opacity-50"
                                    >
                                      <ArrowRightLeft size={12} />
                                      {fa ? "انتقال" : "Move"}
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <input
                                value={studentSearch}
                                onChange={(event) =>
                                  setStudentSearch(event.target.value)
                                }
                                placeholder={
                                  fa
                                    ? "جستجوی نام یا ایمیل دانش‌آموز"
                                    : "Search student name or email"
                                }
                                className="min-w-48 flex-1 rounded-lg border border-line px-3 py-2 text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={() => void searchStudents()}
                                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold"
                              >
                                <Search size={13} />
                                {fa ? "جستجو" : "Search"}
                              </button>
                              <select
                                value={selectedStudentId}
                                onChange={(event) =>
                                  setSelectedStudentId(event.target.value)
                                }
                                aria-label={
                                  fa
                                    ? "انتخاب دانش‌آموز برای افزودن"
                                    : "Select student to add"
                                }
                                className="min-w-48 flex-1 rounded-lg border border-line px-3 py-2 text-[11px]"
                              >
                                <option value="">
                                  {fa
                                    ? "انتخاب دانش‌آموز"
                                    : "Select a student"}
                                </option>
                                {studentCandidates
                                  .filter(
                                    (student) =>
                                      !classRosters[slotItem.id]?.some(
                                        (enrollment) =>
                                          enrollment.studentId === student.id,
                                      ),
                                  )
                                  .map((student) => (
                                    <option
                                      key={student.id}
                                      value={student.id}
                                    >
                                      {student.fullName} · {student.email}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => void addStudentToSlot(slotItem)}
                                disabled={addingStudent || !selectedStudentId}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                              >
                                <UserPlus size={13} />
                                {fa ? "افزودن" : "Add"}
                              </button>
                            </div>
                          </>
                        )}
                      </section>
                    )}
                  </>
                )}

                <div className="mb-3 space-y-2">
                  {(slotItem.teacherAssignments ?? []).length === 0 ? (
                    <p className="text-[11px] text-muted">
                      {fa
                        ? "هنوز معلمی برای این کلاس اختصاص نیافته است."
                        : "No teacher has been assigned to this class yet."}
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

                {!slotItem.isDemo && (
                  <div className="mb-3 rounded-xl border border-blue/15 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={loadingAvailabilityId === slotItem.id}
                        onClick={() => void reviewAvailability(slotItem)}
                        className="rounded-full border border-blue/20 bg-blue/5 px-3 py-1.5 text-[11px] font-semibold text-blue disabled:opacity-60"
                      >
                        {loadingAvailabilityId === slotItem.id
                          ? fa
                            ? "در حال بررسی…"
                            : "Checking…"
                          : fa
                            ? "بررسی زمان‌های آزاد"
                            : "Review teacher availability"}
                      </button>
                      {availableTeachers[slotItem.id]?.length ? (
                        <>
                          <select
                            value={selectedTeachers[slotItem.id] ?? ""}
                            onChange={(event) =>
                              setSelectedTeachers((current) => ({
                                ...current,
                                [slotItem.id]: event.target.value,
                              }))
                            }
                            aria-label={fa ? "انتخاب معلم" : "Select teacher"}
                            className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-2 text-[11px]"
                          >
                            {availableTeachers[slotItem.id].map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                                {teacher.matchedAvailability
                                  ? ` — ${teacher.matchedAvailability}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={assigningSlotId === slotItem.id}
                            onClick={() => void assignTeacher(slotItem)}
                            className="rounded-full bg-blue px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
                          >
                            {assigningSlotId === slotItem.id
                              ? fa
                                ? "در حال اختصاص…"
                                : "Assigning…"
                              : fa
                                ? "اختصاص معلم"
                                : "Assign teacher"}
                          </button>
                        </>
                      ) : null}
                    </div>
                    {availableTeachers[slotItem.id]?.length === 0 && (
                      <p className="mb-0 mt-2 text-[10px] text-muted">
                        {fa
                          ? "برای این زمان معلمی در دسترس نیست."
                          : "No matching teachers are available for this time."}
                      </p>
                    )}
                  </div>
                )}

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
