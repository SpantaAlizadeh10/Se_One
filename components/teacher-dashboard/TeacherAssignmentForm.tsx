"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAssignment,
  type CreateAssignmentInput,
} from "@/lib/api/assignments";
import {
  getTeacherStudents,
  type TeacherStudent,
} from "@/lib/api/teacher-dashboard";

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function TeacherAssignmentForm() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [studentKey, setStudentKey] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    if (!isApiConfigured()) {
      setError(
        fa
          ? "اتصال به سامانه برای ارسال تمرین تنظیم نشده است."
          : "The backend API is not configured.",
      );
      setLoadingStudents(false);
      return;
    }
    getTeacherStudents()
      .then((items) => {
        if (active) setStudents(items);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "فهرست دانش‌آموزان دریافت نشد."
                : "Could not load your students.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });
    return () => {
      active = false;
    };
  }, [fa]);

  const options = useMemo(() => {
    const unique = new Map<string, TeacherStudent>();
    for (const student of students) {
      const key = `${student.studentId}:${student.courseId}`;
      if (!unique.has(key)) unique.set(key, student);
    }
    return [...unique.entries()];
  }, [students]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const student = options.find(([key]) => key === studentKey)?.[1];
    if (!student) {
      setError(
        fa ? "دانش‌آموز موردنظر را انتخاب کنید." : "Choose a student first.",
      );
      return;
    }
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime()) || due.getTime() <= Date.now()) {
      setError(
        fa
          ? "مهلت تمرین باید در آینده باشد."
          : "The due date must be in the future.",
      );
      return;
    }

    const input: CreateAssignmentInput = {
      courseId: student.courseId,
      targetStudentId: student.studentId,
      completionType: "check",
      title: title.trim(),
      description: instructions.trim(),
      instructions: instructions.trim(),
      dueDate: due.toISOString(),
      maxPoints: 0,
      isPublished: true,
    };
    setSaving(true);
    try {
      await createAssignment(input);
      setTitle("");
      setInstructions("");
      setDueDate(defaultDueDate());
      setSuccess(
        fa
          ? `تمرین برای ${student.studentName} ارسال شد.`
          : `Exercise sent to ${student.studentName}.`,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ارسال تمرین انجام نشد."
            : "Could not send the exercise.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5">
        <h2 className="mb-1 font-serif text-[21px] font-semibold">
          {fa ? "ارسال تمرین به دانش‌آموز" : "Assign an exercise"}
        </h2>
        <p className="m-0 text-[12.5px] text-muted">
          {fa
            ? "دانش‌آموزی از فهرست کلاس‌های خود انتخاب کنید؛ تمرین در داشبورد همان دانش‌آموز نمایش داده می‌شود."
            : "Choose a student from your own classes. The exercise will appear in that student's dashboard."}
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-[12px] font-semibold text-ink70">
          <span>{fa ? "دانش‌آموز و دوره" : "Student and course"}</span>
          <select
            value={studentKey}
            onChange={(event) => setStudentKey(event.target.value)}
            required
            disabled={loadingStudents || options.length === 0}
            className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] outline-none focus:border-blue disabled:opacity-60"
          >
            <option value="">
              {loadingStudents
                ? fa
                  ? "در حال بارگذاری…"
                  : "Loading…"
                : fa
                  ? "انتخاب دانش‌آموز"
                  : "Select a student"}
            </option>
            {options.map(([key, student]) => (
              <option key={key} value={key}>
                {student.studentName} ·{" "}
                {student.courseTitle || student.courseId}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-[12px] font-semibold text-ink70">
          <span>{fa ? "عنوان تمرین" : "Exercise title"}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
            placeholder={
              fa
                ? "مثلاً تمرین مکالمه درس سوم"
                : "e.g. Lesson 3 conversation practice"
            }
            className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] outline-none focus:border-blue"
          />
        </label>

        <label className="space-y-2 text-[12px] font-semibold text-ink70 md:col-span-2">
          <span>{fa ? "شرح تمرین" : "Exercise instructions"}</span>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            required
            maxLength={5000}
            rows={4}
            placeholder={
              fa
                ? "تمرین و کاری که دانش‌آموز باید انجام دهد را بنویسید…"
                : "Describe what the student should practice…"
            }
            className="w-full resize-y rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] leading-6 outline-none focus:border-blue"
          />
        </label>

        <label className="space-y-2 text-[12px] font-semibold text-ink70">
          <span>{fa ? "مهلت انجام" : "Due date"}</span>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
            className="w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] outline-none focus:border-blue"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving || loadingStudents || options.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {saving
              ? fa
                ? "در حال ارسال…"
                : "Sending…"
              : fa
                ? "ارسال تمرین"
                : "Send exercise"}
          </button>
        </div>

        {(error || success) && (
          <p
            role={error ? "alert" : "status"}
            className={`m-0 rounded-xl p-3 text-[12px] md:col-span-2 ${error ? "bg-danger/10 text-danger" : "flex items-center gap-2 bg-sage/40 text-sageDeep"}`}
          >
            {success && <CheckCircle2 size={15} />}
            {error || success}
          </p>
        )}
      </form>
    </section>
  );
}
