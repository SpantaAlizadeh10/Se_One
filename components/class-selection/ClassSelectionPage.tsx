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

export default function ClassSelectionPage() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";

  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      const filters: ClassFilters = {
        teacherId: teacherFilter || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        availableOnly: availableOnly || undefined,
        level: levelFilter || undefined,
        subject: subjectFilter || undefined,
      };
      const result = await getClasses(filters);
      setClasses(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load classes");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const teacherList = await getTeachers();
      setTeachers(teacherList.map((t) => ({ id: t.id, name: t.name })));
    } catch (err) {
      console.error("Could not load teachers", err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [teacherFilter, typeFilter, availableOnly, levelFilter, subjectFilter]);

  const visibleClasses = useMemo(() => {
    return classes;
  }, [classes]);

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

  const confirmEnrollment = async () => {
    if (!selectedClass) return;

    setEnrollingId(selectedClass.id);
    setError("");
    setSuccess("");

    try {
      await enrollInClass(selectedClass.id, {});
      setSuccess(fa ? "ثبت‌نام با موفقیت انجام شد" : "Enrollment successful");
      setShowEnrollModal(false);
      setSelectedClass(null);
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrollingId("");
    }
  };

  const handleCreateInviteCode = async () => {
    if (!selectedClass) return;

    try {
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
          {fa ? "انتخاب کلاس" : "Choose a Class"}
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
                      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        classItem.type === "private"
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
                  disabled={isFull || enrollingId === classItem.id}
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
                      : classItem.type === "private"
                        ? fa
                          ? "ثبت‌نام یا دعوت دوست"
                          : "Enroll or Invite Friend"
                        : fa
                          ? "ثبت‌نام در کلاس"
                          : "Enroll in Class"}
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
                onClick={confirmEnrollment}
                disabled={enrollingId === selectedClass.id}
                className="w-full rounded-xl bg-blue px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:opacity-50 transition-colors"
              >
                {enrollingId === selectedClass.id
                  ? fa
                    ? "در حال ثبت‌نام..."
                    : "Enrolling..."
                  : fa
                    ? "تایید ثبت‌نام"
                    : "Confirm Enrollment"}
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
