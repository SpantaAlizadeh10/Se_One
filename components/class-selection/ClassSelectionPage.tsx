"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Users,
  Star,
  Filter,
  Check,
  Share2,
  Copy,
  X,
  LoaderCircle,
  Upload,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getClasses,
  enrollInClass,
  createInviteCode,
  type CourseClass,
  type ClassFilters,
  type Enrollment,
} from "@/lib/api/classes";
import { getTeachers } from "@/lib/api/teachers";

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

function createMockClasses(): CourseClass[] {
  const makeStart = (daysFromNow: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const mockClass = (
    id: string,
    title: string,
    subject: string,
    level: string,
    type: CourseClass["type"],
    maxCapacity: number,
    currentEnrollment: number,
    daysFromNow: number,
    hour: number,
    basePrice: number,
    teacher: CourseClass["teacher"],
    course: CourseClass["course"],
  ): CourseClass => {
    const start = makeStart(daysFromNow, hour);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const finalPrice =
      type === "private" && currentEnrollment > 0
        ? Math.round(basePrice * 0.7)
        : basePrice;
    return {
      id,
      title,
      description: `${subject} · ${level}`,
      level,
      subject,
      type,
      maxCapacity,
      currentEnrollment,
      remainingCapacity: Math.max(0, maxCapacity - currentEnrollment),
      basePrice,
      finalPrice,
      scheduledDate: start.toISOString(),
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
      teacher,
      course,
    };
  };

  const sara = {
    id: "mock-teacher-sara",
    name: "Sara Williams",
    avatar: "/images/Teacher.jpeg",
    rating: 4.9,
  };
  const daniel = {
    id: "mock-teacher-daniel",
    name: "Daniel Meyer",
    avatar: "/images/Teacher.jpeg",
    rating: 4.8,
  };

  return [
    mockClass(
      "mock-class-conversation",
      "Everyday Conversation Club",
      "Speaking & Conversation",
      "B1",
      "public",
      10,
      4,
      2,
      18,
      500000,
      sara,
      { id: "mock-course-conversation", title: "Practical English", imageUrl: "/images/course-placeholder.jpg" },
    ),
    mockClass(
      "mock-class-beginners",
      "English for Beginners",
      "English Fundamentals",
      "A1",
      "public",
      10,
      6,
      3,
      16,
      420000,
      daniel,
      { id: "mock-course-beginners", title: "English Foundations", imageUrl: "/images/course-placeholder.jpg" },
    ),
    mockClass(
      "mock-class-ielts",
      "IELTS Writing Workshop",
      "Writing & IELTS",
      "B2",
      "private",
      2,
      1,
      4,
      17,
      700000,
      sara,
      { id: "mock-course-ielts", title: "IELTS Preparation", imageUrl: "/images/course-placeholder.jpg" },
    ),
    mockClass(
      "mock-class-german",
      "German for Travel",
      "German Conversation",
      "A2",
      "private",
      2,
      0,
      5,
      15,
      650000,
      daniel,
      { id: "mock-course-german", title: "Travel German", imageUrl: "/images/course-placeholder.jpg" },
    ),
  ];
}

function getMockTeacherOptions() {
  return Array.from(
    new Map(
      createMockClasses().map((item) => [
        item.teacher.id,
        item.teacher.name,
      ] as const),
    ),
    ([id, name]) => ({ id, name }),
  );
}

export default function ClassSelectionPage() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";

  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockClasses, setUsingMockClasses] = useState(false);
  const [mockEnrolledIds, setMockEnrolledIds] = useState<string[]>([]);
  const [enrollingId, setEnrollingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [teacherFilter, setTeacherFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "public" | "private">("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  // Modal state
  const [selectedClass, setSelectedClass] = useState<CourseClass | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cardNumber] = useState("6037-9974-1234-5678"); // Example card number

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const filters: ClassFilters = {
        teacherId: teacherFilter || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        availableOnly: availableOnly || undefined,
        level: levelFilter || undefined,
        subject: subjectFilter || undefined,
      };
      const result = await getClasses(filters);
      if (result.items.length > 0) {
        setClasses(result.items);
        setUsingMockClasses(false);
      } else {
        const samples = createMockClasses();
        setClasses(samples);
        setTeachers(getMockTeacherOptions());
        setUsingMockClasses(true);
      }
    } catch {
      const samples = createMockClasses();
      setClasses(samples);
      setTeachers(getMockTeacherOptions());
      setUsingMockClasses(true);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const teacherList = await getTeachers();
      const options = teacherList.map((t) => ({ id: t.id, name: t.name }));
      setTeachers(options.length > 0 ? options : getMockTeacherOptions());
    } catch (err) {
      console.error("Could not load teachers", err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [teacherFilter, typeFilter, availableOnly, levelFilter, subjectFilter]);

  const visibleClasses = useMemo(() => {
    return classes.filter(
      (item) =>
        (!teacherFilter || item.teacher.id === teacherFilter) &&
        (typeFilter === "all" || item.type === typeFilter) &&
        (!availableOnly || item.remainingCapacity > 0) &&
        (!levelFilter || item.level === levelFilter) &&
        (!subjectFilter || item.subject === subjectFilter),
    );
  }, [
    classes,
    teacherFilter,
    typeFilter,
    availableOnly,
    levelFilter,
    subjectFilter,
  ]);

  const levels = useMemo(() => {
    const unique = new Set(classes.map((c) => c.level));
    return [...unique].filter(Boolean);
  }, [classes]);

  const subjects = useMemo(() => {
    const unique = new Set(classes.map((c) => c.subject));
    return [...unique].filter(Boolean);
  }, [classes]);

  const handleEnroll = async (classItem: CourseClass) => {
    if (classItem.remainingCapacity <= 0) {
      setError(fa ? "ظرفیت کلاس تکمیل شده است" : "Class is full");
      return;
    }

    setSelectedClass(classItem);
    setShowEnrollModal(true);
  };

  const proceedToPayment = () => {
    setShowEnrollModal(false);
    setShowPaymentModal(true);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const confirmPayment = async () => {
    const isMockClass = selectedClass?.id.startsWith("mock-") ?? false;
    if (!selectedClass || (!isMockClass && !receiptFile)) {
      setError(fa ? "لطفاً فیش پرداخت را آپلود کنید" : "Please upload the payment receipt");
      return;
    }

    setEnrollingId(selectedClass.id);
    setError("");
    setSuccess("");

    try {
      if (isMockClass) {
        setMockEnrolledIds((current) =>
          current.includes(selectedClass.id)
            ? current
            : [...current, selectedClass.id],
        );
        setClasses((current) =>
          current.map((item) =>
            item.id === selectedClass.id
              ? {
                  ...item,
                  currentEnrollment: Math.min(
                    item.currentEnrollment + 1,
                    item.maxCapacity,
                  ),
                  remainingCapacity: Math.max(item.remainingCapacity - 1, 0),
                }
              : item,
          ),
        );
        setSuccess(
          fa
            ? "رزرو آزمایشی انجام شد؛ پرداخت واقعی انجام نشده است."
            : "Demo booking confirmed. No real payment was processed.",
        );
      } else {
        await enrollInClass(selectedClass.id, {});
        setSuccess(fa ? "ثبت‌نام با موفقیت انجام شد" : "Enrollment successful");
      }
      setShowPaymentModal(false);
      setSelectedClass(null);
      setReceiptFile(null);
      if (!isMockClass) await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrollingId("");
    }
  };

  const handleCreateInviteCode = async () => {
    if (!selectedClass) return;

    try {
      if (selectedClass.id.startsWith("mock-")) {
        const code = `DEMO${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setInviteCode(code);
        setSuccess(
          fa
            ? "کد دعوت آزمایشی ساخته شد."
            : "Demo invite code created.",
        );
        return;
      }
      const result = await createInviteCode(selectedClass.id);
      setInviteCode(result.inviteCode);
      setSuccess(fa ? "کد دعوت ایجاد شد" : "Invite code created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invite code");
    }
  };

  const copyInviteLink = () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/classes/${selectedClass?.id}?invite=${inviteCode}`;
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
            ? "کلاس‌ها را بر اساس معلم، نوع و ظرفیت فیلتر کنید و در کلاس‌های با ظرفیت خالی ثبت‌نام کنید."
            : "Filter classes by teacher, type, and capacity, and enroll in classes with available seats."}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Teacher Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "معلم" : "Teacher"}</span>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه معلم‌ها" : "All teachers"}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>

          {/* Class Type Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "نوع کلاس" : "Class Type"}</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "public" | "private")}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="all">{fa ? "همه" : "All"}</option>
              <option value="public">{fa ? "عمومی (10 نفر)" : "Public (10 seats)"}</option>
              <option value="private">{fa ? "خصوصی (2 نفر)" : "Private (2 seats)"}</option>
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

          {/* Subject Filter */}
          <label className="text-[12px] font-semibold text-muted">
            <span className="mb-1 block">{fa ? "موضوع" : "Subject"}</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-blue"
            >
              <option value="">{fa ? "همه موضوعات" : "All subjects"}</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
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
            const discountPercent = classItem.basePrice > 0
              ? Math.round(((classItem.basePrice - classItem.finalPrice) / classItem.basePrice) * 100)
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
                    <h3 className="text-[14px] font-semibold truncate">{classItem.title}</h3>
                    <span
                      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${classItem.type === "private"
                        ? "bg-purple/10 text-purple"
                        : "bg-blue/10 text-blue"
                        }`}
                    >
                      {classItem.type === "private"
                        ? fa
                          ? "خصوصی · 2 نفر"
                          : "Private · 2 seats"
                        : fa
                          ? "عمومی · 10 نفر"
                          : "Public · 10 seats"}
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
                    {formatTime(classItem.startTime)} – {formatTime(classItem.endTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    {fa
                      ? `${classItem.remainingCapacity} صندلی خالی از ${classItem.maxCapacity}`
                      : `${classItem.remainingCapacity} of ${classItem.maxCapacity} seats available`}
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
                    <span className="text-[13px] font-bold">{formatPrice(classItem.basePrice)}</span>
                  )}
                </div>

                {/* Enroll Button */}
                <button
                  type="button"
                  disabled={isFull || isMockEnrolled || enrollingId === classItem.id}
                  onClick={() => handleEnroll(classItem)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${isFull
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
                  <div className="text-[13px] font-semibold">{selectedClass.title}</div>
                  <div className="text-[11px] text-muted">{selectedClass.teacher.name}</div>
                </div>
              </div>

              <div className="text-[12px] text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {formatDate(selectedClass.scheduledDate, locale)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {formatTime(selectedClass.startTime)} – {formatTime(selectedClass.endTime)}
                </div>
              </div>

              <div className="border-t border-line pt-3">
                <div className="text-[13px] font-semibold mb-1">
                  {fa ? "قیمت نهایی" : "Final Price"}
                </div>
                <div className="text-[18px] font-bold text-blue">
                  {formatPrice(selectedClass.finalPrice)}
                </div>
                {selectedClass.type === "private" && selectedClass.currentEnrollment === 0 && (
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

      {/* Payment Modal */}
      {showPaymentModal && selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold">
                {fa ? "پرداخت" : "Payment"}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-full hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {selectedClass.id.startsWith("mock-") && (
                <div className="rounded-xl border border-blue/20 bg-blue/5 p-3 text-[12px] text-blue">
                  {fa
                    ? "این رزرو آزمایشی است و نیازی به پرداخت یا بارگذاری فیش ندارد."
                    : "This is a demo booking. No payment or receipt upload is needed."}
                </div>
              )}
              {/* Class Summary */}
              <div className="bg-cream rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={selectedClass.teacher.avatar}
                    alt={selectedClass.teacher.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <div className="text-[13px] font-semibold">{selectedClass.title}</div>
                    <div className="text-[11px] text-muted">{selectedClass.teacher.name}</div>
                  </div>
                </div>
                <div className="border-t border-line pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted">{fa ? "قیمت نهایی" : "Final Price"}</span>
                    <span className="text-[16px] font-bold text-blue">
                      {formatPrice(selectedClass.finalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {!selectedClass.id.startsWith("mock-") && (
                <>
                  {/* Card Number */}
                  <div>
                    <label className="block text-[12px] font-semibold text-muted mb-2">
                      {fa ? "شماره کارت" : "Card Number"}
                    </label>
                    <div className="bg-cream border border-line rounded-xl px-4 py-3 flex items-center gap-3">
                      <Smartphone size={18} className="text-muted" />
                      <code className="text-[14px] font-mono text-ink">{cardNumber}</code>
                    </div>
                    <p className="text-[10px] text-muted mt-1">
                      {fa ? "مبلغ را به این شماره کارت واریز کنید" : "Transfer the amount to this card number"}
                    </p>
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-[12px] font-semibold text-muted mb-2">
                      {fa ? "آپلود فیش پرداخت" : "Upload Payment Receipt"}
                    </label>
                    <div className="border-2 border-dashed border-line rounded-xl p-4 text-center hover:border-blue transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {receiptFile ? (
                          <>
                            <Check size={24} className="text-sageDeep" />
                            <span className="text-[12px] font-semibold text-sageDeep">
                              {receiptFile.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-muted" />
                            <span className="text-[12px] text-muted">
                              {fa ? "کلیک کنید یا فایل را بکشید" : "Click or drag file here"}
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp Info */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Smartphone size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-green-800">
                        {fa
                          ? "فیش پرداخت به واتساپ ارسال می‌شود و پس از تایید، ثبت‌نام شما نهایی می‌شود."
                          : "Payment receipt will be sent to WhatsApp. After verification, your enrollment will be confirmed."}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={confirmPayment}
              disabled={
                (!selectedClass.id.startsWith("mock-") && !receiptFile) ||
                enrollingId === selectedClass.id
              }
              className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {enrollingId === selectedClass.id ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  {fa ? "در حال ارسال..." : "Sending..."}
                </>
              ) : (
                <>
                  <Smartphone size={16} />
                  {selectedClass.id.startsWith("mock-")
                    ? fa
                      ? "تأیید رزرو آزمایشی"
                      : "Confirm demo booking"
                    : fa
                      ? "ارسال فیش به واتساپ"
                      : "Send Receipt to WhatsApp"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
