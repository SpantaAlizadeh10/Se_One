"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  Check,
  Share2,
  Copy,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  createInviteCode,
  type ClassType,
  type CourseClass,
} from "@/lib/api/classes";
import { getCourses } from "@/lib/api/courses";
import {
  enrollStudentInClass,
  listStudentClassSlots,
  type StudentAvailableClass,
} from "@/lib/api/class-scheduling";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  getDemoStudentClasses,
  onDemoClassSchedulingChange,
} from "@/lib/demo-class-scheduling";

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function formatTime(value: string) {
  return value; // Already in HH:mm format
}

function formatPrice(price: number, currency: string = "IRR") {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

function SeatCapacityIndicator({
  capacity,
  enrolled,
  fa,
}: {
  capacity: number;
  enrolled: number;
  fa: boolean;
}) {
  const total = Math.max(0, Math.min(20, Math.floor(capacity)));
  const occupied = Math.max(0, Math.min(total, Math.floor(enrolled)));
  const numberFormat = new Intl.NumberFormat(fa ? "fa-IR" : "en-US");

  return (
    <div
      role="img"
      aria-label={
        fa
          ? `${numberFormat.format(occupied)} صندلی از ${numberFormat.format(total)} صندلی پر است`
          : `${occupied} of ${total} seats occupied`
      }
      className="space-y-1.5"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`h-3 w-3 rounded-full border ${
              index < occupied
                ? "border-blue bg-blue shadow-[0_0_0_2px_rgba(59,94,230,0.12)]"
                : "border-line bg-white"
            }`}
          />
        ))}
      </div>
      <span className="block text-[11px] text-muted">
        {fa
          ? `${numberFormat.format(occupied)} از ${numberFormat.format(total)} صندلی پر`
          : `${occupied} of ${total} seats filled`}
      </span>
    </div>
  );
}

type BookingClass = CourseClass & {
  assignmentId: string;
  slotId: string;
  currency: string;
  isDemo?: boolean;
};

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function normalizeLanguage(value?: string) {
  const language = value?.trim().toLowerCase();
  if (
    ["en", "eng", "english", "انگلیسی"].includes(language ?? "") ||
    language?.startsWith("english")
  )
    return "english";
  if (
    ["de", "ger", "german", "deutsch", "آلمانی"].includes(language ?? "") ||
    language?.startsWith("german") ||
    language?.startsWith("deutsch")
  )
    return "german";
  return "";
}

function studentSlotsToBookingClasses(
  slots: StudentAvailableClass[],
  courseCatalog: Awaited<ReturnType<typeof getCourses>>,
  isDemo = false,
): BookingClass[] {
  const demoPrices: Record<string, number> = {
    "mock-class-conversation": 500000,
    "mock-class-beginners": 420000,
    "mock-class-ielts": 700000,
    "mock-class-german": 650000,
  };

  return slots.map((item) => {
    const course =
      courseCatalog.find(
        (entry) => entry.id.toLowerCase() === item.courseId?.toLowerCase(),
      ) ??
      courseCatalog.find(
        (entry) =>
          Boolean(item.courseTitle) &&
          entry.title.trim().toLowerCase() === item.courseTitle?.trim().toLowerCase(),
      );
    const start = new Date(item.startsAt);
    const end = new Date(item.endsAt);
    const price =
      item.basePrice || course?.basePrice || demoPrices[item.id] || 0;
    const language =
      normalizeLanguage(item.language) ||
      normalizeLanguage(course?.language) ||
      normalizeLanguage(item.teacherRole) ||
      undefined;
    return {
      id: item.assignmentId,
      assignmentId: item.assignmentId,
      slotId: item.id,
      title: item.title,
      description: item.description,
      level: item.level || course?.level || "",
      term: item.term || course?.term,
      language,
      subject: item.teacherRole,
      type: item.classType,
      maxCapacity: item.capacity,
      currentEnrollment: item.enrolledCount,
      remainingCapacity: item.remainingSeats,
      basePrice: price,
      finalPrice: item.finalPrice || price,
      scheduledDate: item.startsAt,
      startTime: start.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: end.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: "scheduled",
      teacher: {
        id: item.teacherId,
        name: item.teacherName,
        avatar: item.teacherAvatarUrl || "/images/Teacher.jpeg",
        rating: 4.8,
      },
      course: {
        id: item.courseId ?? "",
        title: item.courseTitle || course?.title || item.title,
        imageUrl: course?.image || "/images/course-placeholder.jpg",
      },
      currency: item.currency || course?.currency || "IRR",
      isDemo,
    };
  });
}

function demoClassesToCourses(
  courseCatalog: Awaited<ReturnType<typeof getCourses>>,
): BookingClass[] {
  return studentSlotsToBookingClasses(
    getDemoStudentClasses(),
    courseCatalog,
    true,
  );
}

export default function ClassSelectionPage() {
  const { lang, href } = useLanguage();
  const router = useRouter();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";

  const [classes, setClasses] = useState<BookingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockClasses, setUsingMockClasses] = useState(false);
  const [mockEnrolledIds, setMockEnrolledIds] = useState<string[]>([]);
  const [enrollingId, setEnrollingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [teacherSearch, setTeacherSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ClassType>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [levelFilter, setLevelFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  // Modal state
  const [selectedClass, setSelectedClass] = useState<BookingClass | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [approvedSlots, courseCatalog] = await Promise.all([
        isApiConfigured() ? listStudentClassSlots() : Promise.resolve([]),
        isApiConfigured()
          ? getCourses(lang).catch(() => [])
          : Promise.resolve([]),
      ]);
      const remoteClasses = studentSlotsToBookingClasses(
        approvedSlots,
        courseCatalog,
      );
      const demoClasses = demoClassesToCourses(courseCatalog);
      setClasses([...remoteClasses, ...demoClasses]);
      setUsingMockClasses(demoClasses.length > 0);
      setMockEnrolledIds(
        getDemoStudentClasses()
          .filter((item) => item.enrolled)
          .map((item) => item.assignmentId),
      );
    } catch (reason) {
      const demoClasses = demoClassesToCourses([]);
      setClasses(demoClasses);
      setUsingMockClasses(demoClasses.length > 0);
      setMockEnrolledIds(
        getDemoStudentClasses()
          .filter((item) => item.enrolled)
          .map((item) => item.assignmentId),
      );
      if (demoClasses.length === 0) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load approved classes.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    void loadClasses();
    const unsubscribe = onDemoClassSchedulingChange(() => void loadClasses());
    return unsubscribe;
  }, [loadClasses]);

  const visibleClasses = useMemo(() => {
    return classes.filter(
      (item) =>
        (!teacherSearch ||
          item.teacher.name
            .toLocaleLowerCase()
            .includes(teacherSearch.trim().toLocaleLowerCase())) &&
        (typeFilter === "all" || item.type === typeFilter) &&
        (!availableOnly || item.remainingCapacity > 0) &&
        (!levelFilter ||
          item.level.trim().toLowerCase() === levelFilter.toLowerCase()) &&
        (!termFilter || item.term === termFilter) &&
        (!languageFilter ||
          normalizeLanguage(item.language) === languageFilter),
    );
  }, [
    classes,
    teacherSearch,
    typeFilter,
    availableOnly,
    levelFilter,
    termFilter,
    languageFilter,
  ]);

  const levels = useMemo(() => {
    const additionalLevels = classes
      .map((item) => item.level.trim())
      .filter(Boolean)
      .filter((level) => !CEFR_LEVELS.includes(level.toUpperCase()));
    return [...CEFR_LEVELS, ...new Set(additionalLevels)];
  }, [classes]);

  const terms = useMemo(
    () => [
      ...new Set(
        classes
          .map((item) => item.term?.trim())
          .filter((term): term is string => Boolean(term)),
      ),
    ],
    [classes],
  );

  const handleEnroll = async (classItem: BookingClass) => {
    if (classItem.remainingCapacity <= 0) {
      setError(fa ? "ظرفیت کلاس تکمیل شده است" : "Class is full");
      return;
    }

    setSelectedClass(classItem);
    setShowEnrollModal(true);
  };

  const proceedToPayment = async () => {
    if (!selectedClass) return;
    setEnrollingId(selectedClass.id);
    setError("");
    try {
      const params = new URLSearchParams({
        title: selectedClass.title,
        teacher: selectedClass.teacher.name,
        amount: String(selectedClass.finalPrice),
        currency: selectedClass.currency,
      });
      if (selectedClass.isDemo) {
        params.set("demoAssignmentId", selectedClass.assignmentId);
      } else {
        const enrollment = await enrollStudentInClass(
          selectedClass.assignmentId,
        );
        if (!enrollment.id) {
          throw new Error(
            fa
              ? "رزرو ایجاد شد اما شناسه پرداخت از سرور دریافت نشد."
              : "The booking was created but the server did not return an enrollment ID.",
          );
        }
        params.set("enrollmentId", enrollment.id);
      }
      setShowEnrollModal(false);
      router.push(`${href("/dashboard/classes/payment")}?${params.toString()}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ایجاد رزرو انجام نشد."
            : "Could not reserve this class.",
      );
    } finally {
      setEnrollingId("");
    }
  };

  const handleCreateInviteCode = async () => {
    if (!selectedClass) return;

    try {
      if (selectedClass.isDemo) {
        const code = `DEMO${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setInviteCode(code);
        setSuccess(
          fa ? "کد دعوت آزمایشی ساخته شد." : "Demo invite code created.",
        );
        return;
      }
      const result = await createInviteCode(selectedClass.slotId);
      setInviteCode(result.inviteCode);
      setSuccess(fa ? "کد دعوت ایجاد شد" : "Invite code created");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create invite code",
      );
    }
  };

  const copyInviteLink = () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/classes/${selectedClass?.slotId}?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-[24px] font-semibold mb-2">
          {fa ? "رزرو کلاس" : "Book a Class"}
        </h2>
        <p className="text-muted text-[13px] max-w-2xl">
          {fa
            ? "کلاس‌ها را بر اساس نوع، ترم، سطح، زبان، معلم و ظرفیت فیلتر کنید و صندلی‌های پر و خالی را ببینید."
            : "Filter by class type, term, level, language, teacher, and available seats."}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-muted" />
          <span className="text-[13px] font-semibold text-muted">
            {fa ? "فیلترها" : "Filters"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Teacher Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "معلم" : "Teacher"}</span>
            <span className="relative block">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={teacherSearch}
                onChange={(event) => setTeacherSearch(event.target.value)}
                placeholder={
                  fa
                    ? "همه معلم‌ها · جستجوی نام"
                    : "All teachers · Search by name"
                }
                aria-label={fa ? "جستجوی معلم‌ها" : "Search teachers"}
                className="w-full rounded-xl border border-line bg-white py-2.5 pe-3 ps-9 text-[13px] outline-none focus:border-blue"
              />
            </span>
          </label>

          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "ترم" : "Term"}</span>
            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه ترم‌ها" : "All terms"}</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "زبان" : "Language"}</span>
            <select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه زبان‌ها" : "All languages"}</option>
              <option value="english">{fa ? "انگلیسی" : "English"}</option>
              <option value="german">{fa ? "آلمانی" : "German"}</option>
            </select>
          </label>

          {/* Class Type Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "نوع کلاس" : "Class Type"}</span>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | ClassType)
              }
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="all">{fa ? "همه" : "All"}</option>
              <option value="public">
                {fa ? "عمومی (10 نفر)" : "Public (10 seats)"}
              </option>
              <option value="semi_private">
                {fa ? "نیمه‌خصوصی (۴ نفر)" : "Semi-private (4 seats)"}
              </option>
              <option value="private">
                {fa ? "خصوصی" : "Private"}
              </option>
            </select>
          </label>

          {/* Level Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "سطح" : "Level"}</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه سطوح" : "All levels"}</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          {/* Available Only */}
          <label className="text-[12px] font-semibold text-muted flex items-end">
            <div className="flex items-center gap-2 w-full p-2.5 rounded-xl border border-line bg-white">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-line"
              />
              <span>{fa ? "فقط با ظرفیت" : "Available only"}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-danger/10 border border-danger/25 rounded-xl p-3 text-[13px] text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-sage/40 border border-sage/60 rounded-xl p-3 text-[13px] text-sageDeep flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {usingMockClasses && (
        <div className="rounded-xl border border-blue/20 bg-blue/5 p-3 text-[12.5px] text-blue">
          {fa
            ? "کلاس‌های نمونه برای نمایش و رزرو آزمایشی هستند؛ پرداخت یا ثبت‌نام واقعی انجام نمی‌شود."
            : "Sample classes are shown for preview and demo booking only. No real payment or enrollment is made."}
        </div>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center text-[13px] text-muted">
          {fa ? "در حال بارگذاری..." : "Loading..."}
        </div>
      ) : visibleClasses.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center text-[13px] text-muted">
          {fa ? "کلاسی یافت نشد" : "No classes found"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleClasses.map((classItem) => {
            const isFull = classItem.remainingCapacity <= 0;
            const isMockEnrolled = mockEnrolledIds.includes(classItem.id);
            const hasDiscount = classItem.finalPrice < classItem.basePrice;
            const discountPercent =
              classItem.basePrice > 0
                ? Math.round(
                    ((classItem.basePrice - classItem.finalPrice) /
                      classItem.basePrice) *
                      100,
                  )
                : 0;

            return (
              <article
                key={classItem.id}
                className="bg-white border border-line rounded-2xl p-4 shadow-card hover:shadow-lg transition-shadow"
              >
                {/* Class Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Image
                    src={classItem.teacher.avatar}
                    alt={classItem.teacher.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        {classItem.teacher.name}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-goldDeep bg-goldSoft px-1.5 py-0.5 rounded-full">
                        <Star size={9} fill="currentColor" />
                        {classItem.teacher.rating}
                      </div>
                    </div>
                    <h3 className="text-[14px] font-semibold truncate">
                      {classItem.title}
                    </h3>
                    <span
                      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        classItem.type === "private"
                          ? "bg-purple/10 text-purple"
                          : classItem.type === "semi_private"
                            ? "bg-goldSoft text-goldDeep"
                            : "bg-blue/10 text-blue"
                      }`}
                    >
                      {classItem.type === "semi_private"
                        ? fa
                          ? "نیمه‌خصوصی · ۴ نفر"
                          : "Semi-private · 4 seats"
                        : classItem.type === "private"
                          ? fa
                            ? "خصوصی"
                            : "Private"
                          : fa
                            ? `عمومی · ${classItem.maxCapacity} نفر`
                            : `Public · ${classItem.maxCapacity} seats`}
                    </span>
                  </div>
                </div>

                {/* Class Details */}
                <div className="space-y-2 mb-4 text-[12px] text-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(classItem.scheduledDate, locale)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {formatTime(classItem.startTime)} –{" "}
                    {formatTime(classItem.endTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>
                      {fa
                        ? `${classItem.remainingCapacity} صندلی خالی`
                        : `${classItem.remainingCapacity} seats available`}
                    </span>
                  </div>
                  <div className="ps-5">
                    <SeatCapacityIndicator
                      capacity={classItem.maxCapacity}
                      enrolled={classItem.currentEnrollment}
                      fa={fa}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {hasDiscount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-sageDeep">
                        {formatPrice(classItem.finalPrice)}
                      </span>
                      <span className="text-[11px] text-muted line-through">
                        {formatPrice(classItem.basePrice)}
                      </span>
                      <span className="text-[10px] font-bold text-sageDeep bg-sage/40 px-1.5 py-0.5 rounded-full">
                        {discountPercent}% {fa ? "تخفیف" : "off"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[13px] font-bold">
                      {formatPrice(classItem.basePrice)}
                    </span>
                  )}
                </div>

                {/* Enroll Button */}
                <button
                  type="button"
                  disabled={
                    isFull || isMockEnrolled || enrollingId === classItem.id
                  }
                  onClick={() => handleEnroll(classItem)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                    isFull
                      ? "bg-line text-muted cursor-not-allowed"
                      : "bg-blue text-white hover:bg-blueDeep"
                  } disabled:opacity-50`}
                >
                  {enrollingId === classItem.id
                    ? fa
                      ? "در حال ثبت‌نام..."
                      : "Enrolling..."
                    : isFull
                      ? fa
                        ? "ظرفیت تکمیل"
                        : "Full"
                      : isMockEnrolled
                        ? fa
                          ? "رزرو شد (آزمایشی)"
                          : "Booked (demo)"
                        : classItem.type === "private"
                          ? fa
                            ? "رزرو یا دعوت دوست"
                            : "Book or Invite Friend"
                          : fa
                            ? "رزرو کلاس"
                            : "Book this class"}
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => setShowEnrollModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold">
                {fa ? "ثبت‌نام در کلاس" : "Enroll in Class"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="p-1 rounded-full hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Image
                  src={selectedClass.teacher.avatar}
                  alt={selectedClass.teacher.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="text-[13px] font-semibold">
                    {selectedClass.title}
                  </div>
                  <div className="text-[11px] text-muted">
                    {selectedClass.teacher.name}
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {formatDate(selectedClass.scheduledDate, locale)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {formatTime(selectedClass.startTime)} –{" "}
                  {formatTime(selectedClass.endTime)}
                </div>
              </div>

              <div className="border-t border-line pt-3">
                <div className="text-[13px] font-semibold mb-1">
                  {fa ? "قیمت نهایی" : "Final Price"}
                </div>
                <div className="text-[18px] font-bold text-blue">
                  {formatPrice(selectedClass.finalPrice)}
                </div>
                {selectedClass.type === "private" &&
                  selectedClass.currentEnrollment === 0 && (
                    <div className="text-[11px] text-muted mt-1">
                      {fa
                        ? "با دعوت یک دوست، هر دو 30% تخفیف می‌گیرید"
                        : "Invite a friend and both get 30% off"}
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={proceedToPayment}
                disabled={enrollingId === selectedClass.id}
                className="w-full rounded-xl bg-blue px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:opacity-50 transition-colors"
              >
                {fa ? "ادامه به پرداخت" : "Proceed to Payment"}
              </button>

              {selectedClass.type === "private" && !inviteCode && (
                <button
                  type="button"
                  onClick={handleCreateInviteCode}
                  className="w-full rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold hover:bg-cream transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  {fa ? "ایجاد کد دعوت" : "Create Invite Code"}
                </button>
              )}

              {inviteCode && (
                <div className="bg-cream rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[12px] font-mono">{inviteCode}</code>
                    <button
                      type="button"
                      onClick={copyInviteLink}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue hover:text-blueDeep"
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          {fa ? "کپی شد" : "Copied"}
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          {fa ? "کپی لینک" : "Copy Link"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
