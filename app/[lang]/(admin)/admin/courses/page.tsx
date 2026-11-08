"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  X,
  Star,
  Upload,
  Search,
  UserPlus,
  Trash2,
  Users,
} from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  listAdminCourses,
  patchAdminCoursePricing,
  updateAdminCourse,
  createAdminCourse,
  uploadCourseImage,
  listAdminTeachers,
  listAdminStudents,
  getAdminCourseEnrollments,
  adminEnrollStudent,
  adminCancelStudentEnrollment,
  type AdminCourse,
  type AdminCourseEnrollment,
  type AdminStudent,
  type CreateCourseInput,
  type AdminTeacher,
} from "@/lib/api/admin";
import {
  createAdminClassSlot,
  assignTeacherToClassSlot,
  replaceAdminClassTeacher,
  listAvailableTeachersForClass,
  type AdminAssignableTeacher,
  updateAdminClassSlot,
  toDateTimeLocalValue,
  listAdminClassSlots,
  type AdminClassSlot,
  type ClassType,
} from "@/lib/api/class-scheduling";

type CourseDraft = CreateCourseInput & {
  classType: ClassType;
  startsAt: string;
  endsAt: string;
  capacity: number;
  teacherRole: string;
};

type AdditionalOfferingDraft = {
  startsAt: string;
  endsAt: string;
  classType: ClassType;
  capacity: number;
  basePrice: number;
};

const emptyOfferingDraft: AdditionalOfferingDraft = {
  startsAt: "",
  endsAt: "",
  classType: "public",
  capacity: 10,
  basePrice: 0,
};

const emptyCourseDraft: CourseDraft = {
  title: "",
  description: "",
  level: "",
  basePrice: 0,
  currency: "IRR",
  duration: "",
  category: "",
  language: "english",
  discountPercent: 0,
  isFeatured: false,
  imageUrl: "",
  teacherId: "",
  classType: "public",
  startsAt: "",
  endsAt: "",
  capacity: 10,
  teacherRole: "english",
};

const courseCategories = [
  { value: "Free Discussion", fa: "فری دیسکاشن", en: "Free Discussion" },
  { value: "Private", fa: "خصوصی", en: "Private" },
  { value: "IELTS", fa: "آیلتس", en: "IELTS" },
  { value: "Kids", fa: "کودکان", en: "Kids" },
  { value: "PTE", fa: "PTE", en: "PTE" },
  { value: "General", fa: "عمومی", en: "General" },
] as const;

function setLocalDate(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function changeLocalDate(current: string, selected: Date | null) {
  if (!selected) return "";
  return setLocalDate(selected, current.split("T")[1]?.slice(0, 5) || "09:00");
}

function changeLocalTime(current: string, time: string) {
  return setLocalDate(current ? new Date(current) : new Date(), time);
}

export default function AdminCoursesPage() {
  const { t, lang } = useLanguage();
  const s = t("adminCoursesPage");
  const coursesData: { id: string; title: string }[] = t("coursesData");

  const [apiCourses, setApiCourses] = useState<AdminCourse[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classSlots, setClassSlots] = useState<AdminClassSlot[]>([]);
  const [newCourse, setNewCourse] = useState<CourseDraft>(emptyCourseDraft);
  const [courseEnrollments, setCourseEnrollments] = useState<
    AdminCourseEnrollment[]
  >([]);
  const [courseStudentSearch, setCourseStudentSearch] = useState("");
  const [courseStudentCandidates, setCourseStudentCandidates] = useState<
    AdminStudent[]
  >([]);
  const [loadingCourseEnrollments, setLoadingCourseEnrollments] =
    useState(false);
  const [searchingCourseStudents, setSearchingCourseStudents] = useState(false);
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState("");
  const courseEnrollmentLoadRequest = useRef(0);
  const [availableCourseTeachers, setAvailableCourseTeachers] = useState<
    Record<string, AdminAssignableTeacher[]>
  >({});
  const [loadingCourseTeachers, setLoadingCourseTeachers] = useState("");
  const [assigningCourseTeacherId, setAssigningCourseTeacherId] = useState("");
  const [additionalOffering, setAdditionalOffering] =
    useState<AdditionalOfferingDraft>(emptyOfferingDraft);
  const [creatingOffering, setCreatingOffering] = useState(false);
  const [offeringMessage, setOfferingMessage] = useState("");

  useEffect(() => {
    if (!isApiConfigured()) {
      setApiError(
        "Backend API URL is not configured. Course pricing is unavailable.",
      );
      return;
    }
    listAdminCourses()
      .then(setApiCourses)
      .catch((error) =>
        setApiError(
          error instanceof Error ? error.message : "Could not load courses",
        ),
      );
    listAdminClassSlots()
      .then(setClassSlots)
      .catch((error) =>
        setApiError(
          error instanceof Error
            ? error.message
            : "Could not load scheduled classes",
        ),
      );
  }, []);

  useEffect(() => {
    if (showCreateModal && !editingCourseId && isApiConfigured()) {
      listAdminTeachers()
        .then((result) =>
          setTeachers(result.items.filter((teacher) => teacher.status === "active")),
        )
        .catch((error) =>
          setApiError(
            error instanceof Error ? error.message : "Could not load teachers",
          ),
        );
    }
  }, [showCreateModal, editingCourseId]);

  const setDraft = (id: string, value: string) =>
    setDrafts((prev) => ({ ...prev, [id]: value }));

  const save = async (id: string) => {
    const raw = drafts[id];
    if (raw === undefined) return;
    const clamped = Math.max(0, Math.min(100, Number(raw) || 0));
    if (apiCourses) {
      try {
        const updated = await patchAdminCoursePricing(id, {
          discountPercent: clamped,
        });
        setApiCourses((prev) =>
          prev.map((course) => (course.id === id ? updated : course)),
        );
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Could not save discount",
        );
        return;
      }
    }
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1800);
  };

  const togglePublished = async (course: AdminCourse) => {
    try {
      const updated = await updateAdminCourse(course.id, {
        isPublished: !course.isPublished,
      });
      setApiCourses((prev) =>
        prev.map((item) => (item.id === course.id ? updated : item)),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not update course publication",
      );
    }
  };

  const toggleFeatured = async (course: AdminCourse) => {
    try {
      const updated = await updateAdminCourse(course.id, {
        isFeatured: !course.isFeatured,
      });
      setApiCourses((prev) =>
        prev.map((item) => (item.id === course.id ? updated : item)),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not update course featured status",
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setApiError(null);
    try {
      const result = await uploadCourseImage(file);
      setNewCourse((current) => ({ ...current, imageUrl: result.imageUrl }));
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditCourse = (course: AdminCourse) => {
    const linkedClass = classSlots.find((slot) => slot.courseId === course.id);
    const currentTeacher = linkedClass?.teacherAssignments?.find(
      (assignment) => assignment.status === "confirmed",
    );
    setEditingCourseId(course.id);
    setNewCourse({
      ...emptyCourseDraft,
      title: course.title,
      description: course.description ?? "",
      level: course.level,
      basePrice: course.basePrice,
      currency: course.currency || "IRR",
      duration: course.duration ?? "",
      category: course.category ?? "",
      language: course.language || "english",
      discountPercent: course.discountPercent,
      isFeatured: course.isFeatured ?? false,
      imageUrl: course.imageUrl ?? "",
      teacherId: currentTeacher?.teacherId ?? course.teacherId ?? "",
      classType: linkedClass?.classType ?? "public",
      startsAt: linkedClass ? toDateTimeLocalValue(linkedClass.startsAt) : "",
      endsAt: linkedClass ? toDateTimeLocalValue(linkedClass.endsAt) : "",
      capacity: linkedClass?.capacity ?? 10,
      teacherRole: linkedClass?.teacherRole ?? course.language ?? "english",
    });
    setCourseEnrollments([]);
    setCourseStudentCandidates([]);
    setCourseStudentSearch("");
    setAvailableCourseTeachers({});
    setAdditionalOffering({
      ...emptyOfferingDraft,
      classType: linkedClass?.classType ?? "public",
      capacity: linkedClass?.capacity ?? 10,
      basePrice: linkedClass?.basePrice ?? course.basePrice,
    });
    setOfferingMessage("");
    setApiError(null);
    setShowCreateModal(true);
    const requestId = ++courseEnrollmentLoadRequest.current;
    setLoadingCourseEnrollments(true);
    getAdminCourseEnrollments(course.id)
      .then((enrollments) => {
        if (courseEnrollmentLoadRequest.current === requestId) {
          setCourseEnrollments(enrollments);
        }
      })
      .catch((error) => {
        if (courseEnrollmentLoadRequest.current === requestId) {
          setApiError(
            error instanceof Error
              ? error.message
              : lang === "fa"
                ? "فهرست دانش‌آموزان دوره بارگذاری نشد."
                : "Could not load course students.",
          );
        }
      })
      .finally(() => {
        if (courseEnrollmentLoadRequest.current === requestId) {
          setLoadingCourseEnrollments(false);
        }
      });
  };

  const findAvailableCourseTeachers = async (slot: AdminClassSlot) => {
    if (!editingCourseId) return;
    setLoadingCourseTeachers(slot.id);
    setApiError(null);
    setOfferingMessage("");
    try {
      const teachers = await listAvailableTeachersForClass(slot.id);
      setAvailableCourseTeachers((current) => ({
        ...current,
        [slot.id]: teachers,
      }));
      if (teachers.length === 0) {
        setOfferingMessage(
          lang === "fa"
            ? `برای زمان کلاس «${slot.title}»، معلم آزاد مناسبی پیدا نشد.`
            : `No matching available teacher was found for "${slot.title}".`,
        );
      }
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "بررسی زمان‌های آزاد معلمان انجام نشد."
            : "Could not check teacher availability.",
      );
    } finally {
      setLoadingCourseTeachers("");
    }
  };

  const assignAvailableCourseTeacher = async (
    slot: AdminClassSlot,
    teacher: AdminAssignableTeacher,
  ) => {
    if (!editingCourseId) return;
    setAssigningCourseTeacherId(`${slot.id}:${teacher.id}`);
    setApiError(null);
    setOfferingMessage("");
    try {
      const currentAssignment = slot.teacherAssignments?.find(
        (assignment) => assignment.status === "confirmed",
      );
      if (currentAssignment) {
        await replaceAdminClassTeacher(slot.id, teacher.id);
      } else {
        await assignTeacherToClassSlot(slot.id, teacher.id);
      }
      const refreshedSlots = await listAdminClassSlots();
      setClassSlots(refreshedSlots);
      setOfferingMessage(
        lang === "fa"
          ? `معلم ${teacher.name} به گروه «${slot.title}» اختصاص یافت.`
          : `${teacher.name} was assigned to "${slot.title}".`,
      );
      setAvailableCourseTeachers((current) => {
        const next = { ...current };
        delete next[slot.id];
        return next;
      });
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "اختصاص معلم انجام نشد."
            : "Could not assign the teacher.",
      );
    } finally {
      setAssigningCourseTeacherId("");
    }
  };

  const createAdditionalOffering = async () => {
    if (!editingCourseId) return;
    const start = new Date(additionalOffering.startsAt);
    const end = new Date(additionalOffering.endsAt);
    if (
      !additionalOffering.startsAt ||
      !additionalOffering.endsAt ||
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime())
    ) {
      setApiError(
        lang === "fa"
          ? "زمان شروع و پایان گروه جدید را وارد کنید."
          : "Enter a start and end time for the new class group.",
      );
      return;
    }
    if (start.getTime() <= Date.now() || end.getTime() <= start.getTime()) {
      setApiError(
        lang === "fa"
          ? "زمان شروع باید در آینده و زمان پایان بعد از شروع باشد."
          : "The start time must be in the future and the end time must follow it.",
      );
      return;
    }

    setCreatingOffering(true);
    setApiError(null);
    setOfferingMessage("");
    try {
      const updatedCourse = await updateAdminCourse(editingCourseId, {
        title: newCourse.title,
        description: newCourse.description,
        level: newCourse.level,
        basePrice: newCourse.basePrice,
        currency: newCourse.currency,
        discountPercent: newCourse.discountPercent,
        duration: newCourse.duration,
        category: newCourse.category,
        language: newCourse.language,
        imageUrl: newCourse.imageUrl,
      });
      setApiCourses((current) =>
        current.map((course) =>
          course.id === updatedCourse.id ? updatedCourse : course,
        ),
      );

      const basePrice = Math.max(0, additionalOffering.basePrice);
      const newSlot = await createAdminClassSlot({
        courseId: editingCourseId,
        title: updatedCourse.title,
        description: updatedCourse.description ?? "",
        level: updatedCourse.level,
        classType: additionalOffering.classType,
        capacity:
          additionalOffering.classType === "semi_private"
            ? 4
            : additionalOffering.capacity,
        teacherRole: newCourse.teacherRole,
        language: updatedCourse.language,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        basePrice,
        finalPrice: getDiscountedPrice(
          basePrice,
          updatedCourse.discountPercent,
        ),
        currency: updatedCourse.currency,
      });
      setClassSlots((current) => [newSlot, ...current]);

      try {
        const teachers = await listAvailableTeachersForClass(newSlot.id);
        setAvailableCourseTeachers((current) => ({
          ...current,
          [newSlot.id]: teachers,
        }));
        setOfferingMessage(
          teachers.length
            ? lang === "fa"
              ? `گروه جدید ساخته شد؛ ${teachers.length} معلم با زمان آزاد مناسب پیدا شد.`
              : `Class group created; ${teachers.length} available teacher(s) found.`
            : lang === "fa"
              ? "گروه ساخته شد، اما برای این زمان معلم آزادی پیدا نشد. زمان دیگری انتخاب و دوباره بررسی کنید."
              : "Class group created, but no available teacher was found. Choose another time and check again.",
        );
      } catch (error) {
        setOfferingMessage(
          lang === "fa"
            ? "گروه ساخته شد، اما بررسی معلم‌های آزاد انجام نشد. از دکمهٔ بررسی در کارت گروه دوباره تلاش کنید."
            : "Class group created, but availability could not be checked. Retry from the group card.",
        );
        setApiError(
          error instanceof Error ? error.message : "Availability check failed.",
        );
      }

      setAdditionalOffering({
        ...emptyOfferingDraft,
        basePrice: updatedCourse.basePrice,
      });
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "ساخت گروه جدید دوره ناموفق بود."
            : "Could not create another course group.",
      );
    } finally {
      setCreatingOffering(false);
    }
  };

  const searchCourseStudents = async () => {
    setSearchingCourseStudents(true);
    setApiError(null);
    try {
      const result = await listAdminStudents({
        page: 1,
        pageSize: 20,
        search: courseStudentSearch.trim() || undefined,
      });
      setCourseStudentCandidates(
        result.items.filter((student) => student.status === "active"),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "جستجوی دانش‌آموز ناموفق بود."
            : "Could not search students.",
      );
    } finally {
      setSearchingCourseStudents(false);
    }
  };

  const addStudentToCourse = async (student: AdminStudent) => {
    if (!editingCourseId) return;
    setUpdatingEnrollmentId(student.id);
    setApiError(null);
    try {
      await adminEnrollStudent(student.id, editingCourseId);
      setCourseEnrollments(await getAdminCourseEnrollments(editingCourseId));
      setCourseStudentCandidates((current) =>
        current.filter((candidate) => candidate.id !== student.id),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "افزودن دانش‌آموز به دوره انجام نشد."
            : "Could not add student to the course.",
      );
    } finally {
      setUpdatingEnrollmentId("");
    }
  };

  const removeStudentFromCourse = async (
    enrollment: AdminCourseEnrollment,
  ) => {
    if (!editingCourseId) return;
    const confirmed = window.confirm(
      lang === "fa"
        ? `ثبت‌نام ${enrollment.studentName || enrollment.studentEmail} از این دوره حذف شود؟`
        : `Remove ${enrollment.studentName || enrollment.studentEmail} from this course?`,
    );
    if (!confirmed) return;
    setUpdatingEnrollmentId(enrollment.id);
    setApiError(null);
    try {
      await adminCancelStudentEnrollment(
        enrollment.studentId,
        enrollment.id,
      );
      setCourseEnrollments((current) =>
        current.filter((item) => item.id !== enrollment.id),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : lang === "fa"
            ? "حذف دانش‌آموز از دوره انجام نشد."
            : "Could not remove student from the course.",
      );
    } finally {
      setUpdatingEnrollmentId("");
    }
  };

  const closeCourseModal = () => {
    if (creating) return;
    courseEnrollmentLoadRequest.current += 1;
    setShowCreateModal(false);
    setEditingCourseId(null);
    setNewCourse(emptyCourseDraft);
    setCourseEnrollments([]);
    setCourseStudentCandidates([]);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setApiError(null);

    try {
      const currentLinkedClass = editingCourseId
        ? classSlots.find((slot) => slot.courseId === editingCourseId)
        : undefined;
      const hasClassSchedule =
        !editingCourseId ||
        Boolean(currentLinkedClass) ||
        Boolean(newCourse.startsAt || newCourse.endsAt);
      if (hasClassSchedule && (!newCourse.startsAt || !newCourse.endsAt)) {
        throw new Error(
          lang === "fa"
            ? "زمان شروع و پایان کلاس الزامی است."
            : "Class start and end times are required.",
        );
      }
      const start = newCourse.startsAt ? new Date(newCourse.startsAt) : null;
      const end = newCourse.endsAt ? new Date(newCourse.endsAt) : null;
      if (
        hasClassSchedule &&
        (!start ||
          !end ||
          !Number.isFinite(start.getTime()) ||
          !Number.isFinite(end.getTime()))
      ) {
        throw new Error(
          lang === "fa"
            ? "تاریخ و زمان کلاس معتبر نیست."
            : "The class date and time are invalid.",
        );
      }
      const scheduleChanged =
        !currentLinkedClass ||
        !start ||
        !end ||
        start.getTime() !== new Date(currentLinkedClass.startsAt).getTime() ||
        end.getTime() !== new Date(currentLinkedClass.endsAt).getTime();
      if (hasClassSchedule && (!editingCourseId || scheduleChanged)) {
        if (start && start.getTime() <= Date.now()) {
          throw new Error(
            lang === "fa"
              ? "زمان شروع باید در آینده باشد."
              : "The class must start in the future.",
          );
        }
      }
      if (hasClassSchedule && start && end && end.getTime() <= start.getTime()) {
        throw new Error(
          lang === "fa"
            ? "زمان پایان باید بعد از زمان شروع باشد."
            : "The end time must be after the start time.",
        );
      }

      const {
        classType,
        startsAt,
        endsAt,
        capacity,
        teacherRole,
        teacherId,
        ...courseDetails
      } = newCourse;
      const classDetails =
        hasClassSchedule && start && end
          ? {
              courseId: editingCourseId ?? undefined,
              title: courseDetails.title,
              description: courseDetails.description,
              classType,
              capacity,
              level: courseDetails.level,
              teacherRole,
              language: courseDetails.language,
              basePrice: courseDetails.basePrice,
              finalPrice: getDiscountedPrice(
                courseDetails.basePrice,
                courseDetails.discountPercent ?? 0,
              ),
              currency: courseDetails.currency,
              startsAt: start.toISOString(),
              endsAt: end.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : null;

      if (editingCourseId) {
        const updatedCourse = await updateAdminCourse(
          editingCourseId,
          courseDetails,
        );
        setApiCourses((prev) =>
          prev.map((course) =>
            course.id === editingCourseId ? updatedCourse : course,
          ),
        );

        if (classDetails) {
          try {
            const updatedClass = currentLinkedClass
              ? await updateAdminClassSlot(currentLinkedClass.id, classDetails)
              : await createAdminClassSlot(classDetails);
            setClassSlots((prev) =>
              currentLinkedClass
                ? prev.map((slot) =>
                    slot.id === currentLinkedClass.id ? updatedClass : slot,
                  )
                  : [updatedClass, ...prev],
            );
          } catch (classUpdateError) {
            throw new Error(
              lang === "fa"
                ? `اطلاعات دوره ذخیره شد اما تغییرات کلاس کامل نشد: ${classUpdateError instanceof Error ? classUpdateError.message : "خطای نامشخص"}`
                : `Course details were saved, but its scheduled class was not fully updated: ${classUpdateError instanceof Error ? classUpdateError.message : "Unknown error"}`,
            );
          }
        }
      } else {
        const created = await createAdminCourse({ ...courseDetails, teacherId });
        setApiCourses((prev) => [created, ...prev]);
        if (!classDetails) {
          throw new Error(
            lang === "fa"
              ? "زمان‌بندی کلاس برای ایجاد دوره الزامی است."
              : "A class schedule is required when creating a course.",
          );
        }

        try {
          const scheduledClass = await createAdminClassSlot({
            ...classDetails,
            courseId: created.id,
          });
          setClassSlots((prev) => [scheduledClass, ...prev]);
          if (teacherId) {
            const assignment = await assignTeacherToClassSlot(
              scheduledClass.id,
              teacherId,
            );
            setClassSlots((prev) =>
              prev.map((slot) =>
                slot.id === scheduledClass.id
                  ? {
                      ...slot,
                      teacherAssignments: [
                        ...(slot.teacherAssignments ?? []),
                        assignment,
                      ],
                    }
                  : slot,
              ),
            );
          }
        } catch (scheduleError) {
          setShowCreateModal(false);
          setNewCourse(emptyCourseDraft);
          throw new Error(
            lang === "fa"
              ? `دوره ساخته شد اما زمان‌بندی یا تخصیص مدرس کلاس کامل نشد: ${scheduleError instanceof Error ? scheduleError.message : "خطای نامشخص"}`
              : `The course was created, but its class schedule or teacher assignment was not fully saved: ${scheduleError instanceof Error ? scheduleError.message : "Unknown error"}`,
          );
        }
      }

      setShowCreateModal(false);
      setEditingCourseId(null);
      setNewCourse(emptyCourseDraft);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : editingCourseId
            ? "Could not update course"
            : "Could not create course",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-[14px] max-w-[560px]">{s.sub}</p>
        <button
          onClick={() => {
            setEditingCourseId(null);
            setNewCourse(emptyCourseDraft);
            setApiError(null);
            setShowCreateModal(true);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-blueDeep sm:w-auto"
        >
          <Plus size={14} />
          Create Course
        </button>
      </div>
      {apiError && <p className="text-danger text-[13px] mb-4">{apiError}</p>}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white border border-line rounded-lg shadow-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="text-[18px] font-semibold">
                {editingCourseId
                  ? lang === "fa"
                    ? "ویرایش کامل دوره و کلاس"
                    : "Edit course and scheduled class"
                  : lang === "fa"
                    ? "ایجاد دوره جدید"
                    : "Create New Course"}
              </h3>
              <button
                type="button"
                onClick={closeCourseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink70 hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
              {apiError && (
                <p
                  role="alert"
                  className="rounded-lg bg-danger/10 p-3 text-[12px] text-danger"
                >
                  {apiError}
                </p>
              )}
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Description *
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue h-24 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Course Image
                </label>
                <div className="space-y-3">
                  {newCourse.imageUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-ink/5">
                      <img
                        src={newCourse.imageUrl}
                        alt="Course preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewCourse({ ...newCourse, imageUrl: "" })
                        }
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        <X size={14} className="text-danger" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2.5 bg-white border border-line px-4 py-3 rounded-xl text-[13.5px] font-semibold hover:border-ink transition-colors cursor-pointer w-fit">
                    <Upload size={16} />
                    {uploadingImage
                      ? "Uploading..."
                      : newCourse.imageUrl
                        ? "Change image"
                        : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Level *
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, level: e.target.value })
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCourse.basePrice}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        basePrice: Number(e.target.value),
                      })
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Currency
                  </label>
                  <select
                    value={newCourse.currency}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, currency: e.target.value })
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="IRR">IRR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    placeholder="e.g., 8 weeks"
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    {lang === "fa" ? "دسته‌بندی دوره *" : "Course category *"}
                  </label>
                  <select
                    value={newCourse.category}
                    onChange={(e) =>
                      setNewCourse((current) => ({
                        ...current,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                    required
                  >
                    <option value="">
                      {lang === "fa"
                        ? "دسته‌بندی را انتخاب کنید"
                        : "Select a category"}
                    </option>
                    {newCourse.category &&
                      !courseCategories.some(
                        (category) => category.value === newCourse.category,
                      ) && (
                        <option value={newCourse.category}>
                          {newCourse.category}
                        </option>
                      )}
                    {courseCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {lang === "fa" ? category.fa : category.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Language
                  </label>
                  <select
                    value={newCourse.language}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, language: e.target.value })
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="english">English</option>
                    <option value="german">German</option>
                  </select>
                </div>
              </div>
              {editingCourseId && (
                <section className="space-y-4 rounded-xl border border-line bg-cream/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-ink">
                        {lang === "fa"
                          ? "دانش‌آموزان دوره"
                          : "Students in this course"}
                      </h4>
                      <p className="mt-1 text-[12px] text-muted">
                        {lang === "fa"
                          ? "دانش‌آموز اضافه کنید یا ثبت‌نام او را از دوره حذف کنید."
                          : "Add students or remove their enrollment from this course."}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-ink70">
                      {
                        courseEnrollments.filter(
                          (enrollment) => enrollment.status === "active",
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3">
                      <Search size={15} className="shrink-0 text-muted" />
                      <input
                        type="search"
                        value={courseStudentSearch}
                        onChange={(event) =>
                          setCourseStudentSearch(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void searchCourseStudents();
                          }
                        }}
                        placeholder={
                          lang === "fa"
                            ? "جستجو بر اساس نام یا ایمیل دانش‌آموز"
                            : "Search students by name or email"
                        }
                        className="min-w-0 flex-1 bg-transparent py-2.5 text-[12px] outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void searchCourseStudents()}
                      disabled={searchingCourseStudents}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink70 hover:border-blue hover:text-blue disabled:opacity-60"
                    >
                      <Search size={14} />
                      {searchingCourseStudents
                        ? lang === "fa"
                          ? "در حال جستجو..."
                          : "Searching..."
                        : lang === "fa"
                          ? "جستجوی دانش‌آموز"
                          : "Search students"}
                    </button>
                  </div>

                  {courseStudentCandidates.length > 0 && (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-line bg-white p-2">
                      {courseStudentCandidates.map((student) => {
                        const alreadyEnrolled = courseEnrollments.some(
                          (enrollment) =>
                            enrollment.studentId === student.id &&
                            enrollment.status === "active",
                        );
                        return (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-semibold text-ink">
                                {student.fullName}
                              </p>
                              <p className="truncate text-[11px] text-muted">
                                {student.email}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void addStudentToCourse(student)}
                              disabled={
                                alreadyEnrolled ||
                                Boolean(updatingEnrollmentId)
                              }
                              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <UserPlus size={13} />
                              {alreadyEnrolled
                                ? lang === "fa"
                                  ? "عضو دوره"
                                  : "Enrolled"
                                : updatingEnrollmentId === student.id
                                  ? lang === "fa"
                                    ? "در حال افزودن..."
                                    : "Adding..."
                                  : lang === "fa"
                                    ? "افزودن"
                                    : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    {loadingCourseEnrollments ? (
                      <p className="text-[12px] text-muted">
                        {lang === "fa"
                          ? "در حال بارگذاری دانش‌آموزان دوره..."
                          : "Loading course students..."}
                      </p>
                    ) : courseEnrollments.filter(
                          (enrollment) => enrollment.status === "active",
                        ).length === 0 ? (
                      <p className="text-[12px] text-muted">
                        {lang === "fa"
                          ? "هنوز دانش‌آموز فعالی در این دوره ثبت‌نام نشده است."
                          : "No active students are enrolled in this course."}
                      </p>
                    ) : (
                      courseEnrollments
                        .filter((enrollment) => enrollment.status === "active")
                        .map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-semibold text-ink">
                                {enrollment.studentName ||
                                  enrollment.studentEmail ||
                                  enrollment.studentId}
                              </p>
                              {enrollment.studentEmail && (
                                <p className="truncate text-[11px] text-muted">
                                  {enrollment.studentEmail}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void removeStudentFromCourse(enrollment)
                              }
                              disabled={Boolean(updatingEnrollmentId)}
                              title={
                                lang === "fa"
                                  ? "حذف دانش‌آموز از دوره"
                                  : "Remove student from course"
                              }
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50"
                            >
                              {updatingEnrollmentId === enrollment.id ? (
                                <span className="text-[10px]">...</span>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </section>
              )}
              <section className="space-y-4 rounded-xl border border-line bg-cream/60 p-4">
                <div className="flex items-start gap-2">
                  <CalendarDays size={17} className="mt-0.5 text-blue" />
                  <div>
                    <h4 className="text-[13.5px] font-semibold text-ink">
                      {lang === "fa" ? "برنامه‌ریزی کلاس" : "Class schedule"}
                    </h4>
                    <p className="text-[12px] text-muted">
                      {lang === "fa"
                        ? "هر دوره همراه با یک کلاس زمان‌بندی‌شده ساخته می‌شود."
                        : "Every course is created with a scheduled class."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-[12.5px] font-semibold text-ink70">
                    <span>{lang === "fa" ? "نوع کلاس" : "Class type"}</span>
                    <select
                      value={newCourse.classType}
                      onChange={(e) => {
                        const classType = e.target.value as ClassType;
                        setNewCourse((current) => ({
                          ...current,
                          classType,
                          capacity:
                            classType === "semi_private"
                              ? 4
                              : current.capacity,
                        }));
                      }}
                      className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-blue"
                    >
                      <option value="public">
                        {lang === "fa"
                          ? "عمومی"
                          : "Public"}
                      </option>
                      <option value="private">
                        {lang === "fa"
                          ? "خصوصی"
                          : "Private"}
                      </option>
                      <option value="semi_private">
                        {lang === "fa"
                          ? "نیمه‌خصوصی (۴ نفر)"
                          : "Semi-private (4 seats)"}
                      </option>
                    </select>
                  </label>
                  <label className="space-y-2 text-[12.5px] font-semibold text-ink70">
                    <span>
                      {lang === "fa" ? "گروه معلم‌ها" : "Teacher group"}
                    </span>
                    <select
                      value={newCourse.teacherRole}
                      onChange={(e) =>
                        setNewCourse((current) => ({
                          ...current,
                          teacherRole: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-blue"
                    >
                      <option value="all">
                        {lang === "fa" ? "همه معلم‌ها" : "All teachers"}
                      </option>
                      <option value="english">English</option>
                      <option value="german">Deutsch / German</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-[12.5px] font-semibold text-ink70">
                    <span>
                      {lang === "fa" ? "زمان شروع" : "Start date & time"}
                      {(!editingCourseId ||
                        classSlots.some(
                          (slot) => slot.courseId === editingCourseId,
                        )) &&
                        " *"}
                    </span>
                    <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                      <DatePicker
                        key={
                          lang === "fa"
                            ? "persian-course-start"
                            : "gregorian-course-start"
                        }
                        value={
                          newCourse.startsAt ? new Date(newCourse.startsAt) : ""
                        }
                        calendar={lang === "fa" ? persian : undefined}
                        locale={lang === "fa" ? persian_fa : undefined}
                        placeholder={
                          !editingCourseId ||
                          classSlots.some(
                            (slot) => slot.courseId === editingCourseId,
                          )
                            ? lang === "fa"
                              ? "تاریخ شمسی را انتخاب کنید"
                              : "Select a date"
                            : lang === "fa"
                              ? "اختیاری؛ برای افزودن کلاس برنامه‌ریزی کنید"
                              : "Optional; set a date to schedule a class"
                        }
                        format={lang === "fa" ? "YYYY/MM/DD" : "MMM DD, YYYY"}
                        calendarPosition={
                          lang === "fa" ? "bottom-right" : "bottom-left"
                        }
                        inputClass="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-blue"
                        onChange={(value) =>
                          setNewCourse((current) => ({
                            ...current,
                            startsAt: changeLocalDate(
                              current.startsAt,
                              value && !Array.isArray(value)
                                ? value.toDate()
                                : null,
                            ),
                          }))
                        }
                      />
                      <input
                        type="time"
                        lang={lang === "fa" ? "fa-IR" : "en-US"}
                        aria-label={lang === "fa" ? "ساعت شروع" : "Start time"}
                        value={
                          newCourse.startsAt.split("T")[1]?.slice(0, 5) ?? ""
                        }
                        onChange={(event) =>
                          setNewCourse((current) => ({
                            ...current,
                            startsAt: changeLocalTime(
                              current.startsAt,
                              event.target.value,
                            ),
                          }))
                        }
                        required={
                          !editingCourseId ||
                          classSlots.some(
                            (slot) => slot.courseId === editingCourseId,
                          ) ||
                          Boolean(newCourse.endsAt)
                        }
                        className="w-full rounded-lg border border-line bg-white px-2 py-2.5 text-[13px] outline-none focus:border-blue"
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-[12.5px] font-semibold text-ink70">
                    <span>
                      {lang === "fa" ? "زمان پایان" : "End date & time"}
                      {(!editingCourseId ||
                        classSlots.some(
                          (slot) => slot.courseId === editingCourseId,
                        )) &&
                        " *"}
                    </span>
                    <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                      <DatePicker
                        key={
                          lang === "fa"
                            ? "persian-course-end"
                            : "gregorian-course-end"
                        }
                        value={
                          newCourse.endsAt ? new Date(newCourse.endsAt) : ""
                        }
                        calendar={lang === "fa" ? persian : undefined}
                        locale={lang === "fa" ? persian_fa : undefined}
                        placeholder={
                          !editingCourseId ||
                          classSlots.some(
                            (slot) => slot.courseId === editingCourseId,
                          )
                            ? lang === "fa"
                              ? "تاریخ شمسی را انتخاب کنید"
                              : "Select a date"
                            : lang === "fa"
                              ? "اختیاری؛ برای افزودن کلاس برنامه‌ریزی کنید"
                              : "Optional; set a date to schedule a class"
                        }
                        format={lang === "fa" ? "YYYY/MM/DD" : "MMM DD, YYYY"}
                        calendarPosition={
                          lang === "fa" ? "bottom-right" : "bottom-left"
                        }
                        inputClass="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-blue"
                        onChange={(value) =>
                          setNewCourse((current) => ({
                            ...current,
                            endsAt: changeLocalDate(
                              current.endsAt,
                              value && !Array.isArray(value)
                                ? value.toDate()
                                : null,
                            ),
                          }))
                        }
                      />
                      <input
                        type="time"
                        lang={lang === "fa" ? "fa-IR" : "en-US"}
                        aria-label={lang === "fa" ? "ساعت پایان" : "End time"}
                        value={
                          newCourse.endsAt.split("T")[1]?.slice(0, 5) ?? ""
                        }
                        onChange={(event) =>
                          setNewCourse((current) => ({
                            ...current,
                            endsAt: changeLocalTime(
                              current.endsAt,
                              event.target.value,
                            ),
                          }))
                        }
                        required={
                          !editingCourseId ||
                          classSlots.some(
                            (slot) => slot.courseId === editingCourseId,
                          ) ||
                          Boolean(newCourse.startsAt)
                        }
                        className="w-full rounded-lg border border-line bg-white px-2 py-2.5 text-[13px] outline-none focus:border-blue"
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-[12.5px] font-semibold text-ink70 sm:col-span-2">
                    <span>{lang === "fa" ? "ظرفیت" : "Capacity"}</span>
                    <input
                      type="number"
                      min={newCourse.classType === "semi_private" ? 4 : 1}
                      max={
                        newCourse.classType === "semi_private" ? 4 : undefined
                      }
                      step={1}
                      value={newCourse.capacity}
                      onChange={(e) =>
                        setNewCourse((current) => ({
                          ...current,
                          capacity: Number(e.target.value),
                        }))
                      }
                      disabled={newCourse.classType === "semi_private"}
                      className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-blue"
                      required
                    />
                  </label>
                </div>
              </section>
              {editingCourseId && (
                <section className="space-y-4 rounded-xl border border-blue/20 bg-blue/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-2 text-blue">
                      <Users size={17} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-ink">
                        {lang === "fa"
                          ? "گروه‌های این دوره و معلم‌ها"
                          : "Course groups and teachers"}
                      </h4>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink70">
                        {lang === "fa"
                          ? "برای هر معلم یک گروه جدا بسازید؛ زمان، ظرفیت و قیمت هر گروه مستقل است و دانش‌آموز هر گزینه را جداگانه می‌بیند."
                          : "Create a separate class group for each teacher. Each group has its own schedule, seats, and price, and appears separately to students."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {classSlots
                      .filter((slot) => slot.courseId === editingCourseId)
                      .map((slot) => {
                        const assignment = slot.teacherAssignments?.find(
                          (item) => item.status === "confirmed",
                        );
                        const candidates = availableCourseTeachers[slot.id] ?? [];
                        return (
                          <article
                            key={slot.id}
                            className="space-y-3 rounded-xl border border-line bg-white p-3"
                          >
                            <div className="flex flex-wrap items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <h5 className="truncate text-[12.5px] font-semibold text-ink">
                                  {slot.title}
                                </h5>
                                <p className="mt-1 text-[11px] text-muted">
                                  {new Intl.DateTimeFormat(
                                    lang === "fa" ? "fa-IR" : "en-US",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    },
                                  ).format(new Date(slot.startsAt))}
                                  {" · "}
                                  {slot.capacity}{" "}
                                  {lang === "fa" ? "ظرفیت" : "seats"}
                                  {" · "}
                                  {formatPrice(slot.basePrice ?? 0, lang)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  void findAvailableCourseTeachers(slot)
                                }
                                disabled={
                                  loadingCourseTeachers === slot.id ||
                                  Boolean(assigningCourseTeacherId)
                                }
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-blue/20 bg-blue/5 px-3 py-1.5 text-[11px] font-semibold text-blue hover:bg-blue/10 disabled:opacity-60"
                              >
                                <Search size={13} />
                                {loadingCourseTeachers === slot.id
                                  ? lang === "fa"
                                    ? "در حال بررسی..."
                                    : "Checking..."
                                  : lang === "fa"
                                    ? "بررسی معلم آزاد"
                                    : "Find available teacher"}
                              </button>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg bg-sage/20 px-3 py-2">
                              {assignment ? (
                                <>
                                  {assignment.teacherAvatarUrl ? (
                                    <img
                                      src={assignment.teacherAvatarUrl}
                                      alt=""
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sageDeep">
                                      <Check size={14} />
                                    </div>
                                  )}
                                  <span className="text-[12px] font-medium text-sageDeep">
                                    {assignment.teacherName ||
                                      assignment.teacherId}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[12px] text-muted">
                                  {lang === "fa"
                                    ? "هنوز معلمی به این گروه اختصاص نیافته"
                                    : "No teacher assigned to this group yet"}
                                </span>
                              )}
                            </div>

                            {candidates.length > 0 && (
                              <div className="grid gap-2 sm:grid-cols-2">
                                {candidates.map((teacher) => (
                                  <div
                                    key={teacher.id}
                                    className="flex min-w-0 items-center gap-2 rounded-lg border border-line bg-cream/40 p-2"
                                  >
                                    {teacher.avatarUrl ? (
                                      <img
                                        src={teacher.avatarUrl}
                                        alt=""
                                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                                        <UserPlus size={15} />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-[11.5px] font-semibold text-ink">
                                        {teacher.name}
                                      </p>
                                      <p className="truncate text-[10px] text-muted">
                                        {teacher.matchedAvailability ||
                                          [
                                            teacher.subject,
                                            teacher.teachingLanguage,
                                          ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void assignAvailableCourseTeacher(
                                          slot,
                                          teacher,
                                        )
                                      }
                                      disabled={Boolean(
                                        assigningCourseTeacherId,
                                      )}
                                      className="shrink-0 rounded-full bg-blue px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-blueDeep disabled:opacity-60"
                                    >
                                      {assigningCourseTeacherId ===
                                      `${slot.id}:${teacher.id}`
                                        ? lang === "fa"
                                          ? "در حال اختصاص..."
                                          : "Assigning..."
                                        : lang === "fa"
                                          ? "اختصاص"
                                          : "Assign"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                  </div>

                  {offeringMessage && (
                    <p
                      role="status"
                      className="rounded-lg bg-white px-3 py-2 text-[12px] font-medium text-sageDeep"
                    >
                      {offeringMessage}
                    </p>
                  )}

                  <div className="space-y-3 rounded-xl border border-dashed border-blue/30 bg-white p-3">
                    <div>
                      <h5 className="text-[12.5px] font-semibold text-ink">
                        {lang === "fa"
                          ? "افزودن گروه با زمان جدید"
                          : "Add a class at another time"}
                      </h5>
                      <p className="mt-1 text-[11px] text-muted">
                        {lang === "fa"
                          ? "زمان آزاد معلم را انتخاب کنید؛ سپس معلم‌های قابل‌تخصیص برای همان بازه نمایش داده می‌شوند."
                          : "Choose a time when a teacher is available, then view teachers who can take this group."}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-[11px] font-semibold text-muted">
                        {lang === "fa" ? "شروع" : "Starts"}
                        <input
                          type="datetime-local"
                          value={additionalOffering.startsAt}
                          onChange={(event) =>
                            setAdditionalOffering((current) => ({
                              ...current,
                              startsAt: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] text-ink"
                        />
                      </label>
                      <label className="space-y-1 text-[11px] font-semibold text-muted">
                        {lang === "fa" ? "پایان" : "Ends"}
                        <input
                          type="datetime-local"
                          value={additionalOffering.endsAt}
                          onChange={(event) =>
                            setAdditionalOffering((current) => ({
                              ...current,
                              endsAt: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] text-ink"
                        />
                      </label>
                      <label className="space-y-1 text-[11px] font-semibold text-muted">
                        {lang === "fa" ? "نوع کلاس" : "Class type"}
                        <select
                          value={additionalOffering.classType}
                          onChange={(event) => {
                            const classType = event.target.value as ClassType;
                            setAdditionalOffering((current) => ({
                              ...current,
                              classType,
                              capacity:
                                classType === "semi_private"
                                  ? 4
                                  : current.capacity,
                            }));
                          }}
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] text-ink"
                        >
                          <option value="public">
                            {lang === "fa" ? "عمومی" : "Public"}
                          </option>
                          <option value="semi_private">
                            {lang === "fa"
                              ? "نیمه‌خصوصی · ۴ نفر"
                              : "Semi-private · 4 seats"}
                          </option>
                          <option value="private">
                            {lang === "fa" ? "خصوصی" : "Private"}
                          </option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[11px] font-semibold text-muted">
                        {lang === "fa" ? "ظرفیت" : "Capacity"}
                        <input
                          type="number"
                          min="1"
                          max={
                            additionalOffering.classType === "semi_private"
                              ? 4
                              : undefined
                          }
                          value={additionalOffering.capacity}
                          disabled={
                            additionalOffering.classType === "semi_private"
                          }
                          onChange={(event) =>
                            setAdditionalOffering((current) => ({
                              ...current,
                              capacity: Number(event.target.value),
                            }))
                          }
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] text-ink disabled:bg-cream"
                        />
                      </label>
                      <label className="space-y-1 text-[11px] font-semibold text-muted sm:col-span-2">
                        {lang === "fa" ? "قیمت این گروه" : "This group's price"}
                        <input
                          type="number"
                          min="0"
                          value={additionalOffering.basePrice}
                          onChange={(event) =>
                            setAdditionalOffering((current) => ({
                              ...current,
                              basePrice: Number(event.target.value),
                            }))
                          }
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] text-ink"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => void createAdditionalOffering()}
                      disabled={creatingOffering}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blueDeep disabled:opacity-60 sm:w-auto"
                    >
                      <Plus size={14} />
                      {creatingOffering
                        ? lang === "fa"
                          ? "در حال ساخت گروه..."
                          : "Creating group..."
                        : lang === "fa"
                          ? "ساخت گروه و بررسی معلم‌های آزاد"
                          : "Create group and find available teachers"}
                    </button>
                  </div>
                </section>
              )}
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Discount Percent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newCourse.discountPercent}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-24 border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  />
                  <span className="text-[12px] text-muted">%</span>
                </div>
              </div>
              {!editingCourseId && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Teacher
                  </label>
                  <select
                    value={newCourse.teacherId}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, teacherId: e.target.value })
                    }
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="">Select a teacher (optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={newCourse.isFeatured}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-line text-blue focus:ring-blue"
                />
                <label htmlFor="isFeatured" className="text-[13px] text-ink70">
                  Featured Course
                </label>
              </div>
              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={closeCourseModal}
                  className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold border border-line text-ink70 hover:border-ink transition-colors"
                >
                  {lang === "fa" ? "لغو" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-blue text-white hover:bg-blueDeep transition-colors disabled:opacity-70"
                >
                  {creating
                    ? lang === "fa"
                      ? "در حال ذخیره..."
                      : "Saving..."
                    : editingCourseId
                      ? lang === "fa"
                        ? "ذخیره همه تغییرات"
                        : "Save all changes"
                      : lang === "fa"
                        ? "ایجاد دوره"
                        : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[
                s.colCourse,
                lang === "fa" ? "برنامه کلاس" : "Class schedule",
                s.colBasePrice,
                s.colDiscount,
                s.colFinalPrice,
                "Status",
                s.colActions,
              ].map((h) => (
                <th
                  key={h}
                  className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiCourses
              .map((course) => ({
                id: course.id,
                basePrice: course.basePrice,
                discountPercent: course.discountPercent,
                title: course.title,
                isPublished: course.isPublished,
                isFeatured: course.isFeatured,
              }))
              .map((p) => {
                const course = coursesData.find((c) => c.id === p.id);
                const courseTitle =
                  "title" in p && typeof p.title === "string"
                    ? p.title
                    : (course?.title ?? p.id);
                const isPublished =
                  "isPublished" in p && typeof p.isPublished === "boolean"
                    ? p.isPublished
                    : false;
                const isFeatured =
                  "isFeatured" in p && typeof p.isFeatured === "boolean"
                    ? p.isFeatured
                    : false;
                const draftValue = drafts[p.id] ?? String(p.discountPercent);
                const previewDiscount = Math.max(
                  0,
                  Math.min(100, Number(draftValue) || 0),
                );
                const discounted = getDiscountedPrice(
                  p.basePrice,
                  previewDiscount,
                );
                const linkedClass = classSlots.find(
                  (slotItem) => slotItem.courseId === p.id,
                );
                const fullCourse = apiCourses.find(
                  (item) => item.id === p.id,
                );

                return (
                  <tr
                    key={p.id}
                    className="border-b border-line last:border-none hover:bg-cream/60"
                  >
                    <td className="px-5 py-3.5 text-[13.5px] font-semibold">
                      {courseTitle}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-ink70">
                      {linkedClass ? (
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {linkedClass.classType === "semi_private"
                              ? lang === "fa"
                                ? "نیمه‌خصوصی"
                                : "Semi-private"
                              : linkedClass.classType === "private"
                                ? lang === "fa"
                                  ? "خصوصی"
                                  : "Private"
                                : lang === "fa"
                                  ? "عمومی"
                                  : "Public"}
                            {" · "}
                            {linkedClass.capacity}{" "}
                            {lang === "fa" ? "نفر" : "seats"}
                          </div>
                          <div>
                            {new Intl.DateTimeFormat(
                              lang === "fa" ? "fa-IR" : "en-US",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            ).format(new Date(linkedClass.startsAt))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-ink70">
                      {formatPrice(p.basePrice, lang)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={draftValue}
                          onChange={(e) => setDraft(p.id, e.target.value)}
                          className="w-16 border border-line rounded-lg px-2.5 py-1.5 text-[13px] text-center outline-none focus:border-blue"
                        />
                        <span className="text-[12px] text-muted">%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {previewDiscount > 0 ? (
                        <span className="text-[13px] font-bold text-goldDeep">
                          {formatPrice(discounted, lang)}
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted">
                          {s.noDiscount}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPublished
                              ? "bg-sage text-sageDeep"
                              : "bg-cream text-muted"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </span>
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-gold/20 text-goldDeep">
                            <Star size={10} fill="currentColor" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {fullCourse && (
                          <button
                            type="button"
                            onClick={() => openEditCourse(fullCourse)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink70 transition-colors hover:border-blue hover:text-blue"
                            title={
                              lang === "fa" ? "ویرایش کامل دوره" : "Edit course"
                            }
                          >
                            <Pencil size={13} />
                            {lang === "fa" ? "ویرایش" : "Edit"}
                          </button>
                        )}
                        <button
                          onClick={() => save(p.id)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue hover:bg-blueDeep px-3.5 py-1.5 rounded-full transition-colors"
                        >
                          {savedId === p.id ? <Check size={13} /> : null}
                          {savedId === p.id ? s.savedMsg : s.saveBtn}
                        </button>
                        {"isPublished" in p && (
                          <button
                            onClick={() =>
                              togglePublished(
                                apiCourses.find(
                                  (course) => course.id === p.id,
                                )!,
                              )
                            }
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sageDeep bg-sage hover:bg-sage/80"
                            title={
                              isPublished
                                ? "Unpublish course"
                                : "Publish course"
                            }
                          >
                            {isPublished ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            toggleFeatured(
                              apiCourses.find((course) => course.id === p.id)!,
                            )
                          }
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isFeatured
                              ? "text-goldDeep bg-gold hover:bg-gold/80"
                              : "text-muted bg-cream hover:bg-cream/80"
                          }`}
                          title={
                            isFeatured
                              ? "Remove from featured"
                              : "Add to featured"
                          }
                        >
                          <Star
                            size={14}
                            fill={isFeatured ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
