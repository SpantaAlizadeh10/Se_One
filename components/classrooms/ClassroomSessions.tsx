"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  ExternalLink,
  FileText,
  Link2,
  Upload,
} from "lucide-react";
import { getCourses, type Course } from "@/lib/api/courses";
import {
  createClassroomSession,
  getClassroomSessions,
  isSafeClassroomUrl,
  joinClassroomSession,
  uploadClassroomFile,
  type ClassroomFileCategory,
  type ClassroomMaterial,
  type ClassroomSession,
} from "@/lib/api/classrooms";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Audience = "teacher" | "student";
type Copy = {
  title: string;
  description: string;
  empty: string;
  loading: string;
  course: string;
  scheduledAt: string;
  duration: string;
  meetingUrl: string;
  notes: string;
  create: string;
  creating: string;
  join: string;
  noLink: string;
  materials: string;
  homework: string;
  submission: string;
  upload: string;
  uploading: string;
  status: Record<ClassroomSession["status"], string>;
  error: string;
};

const words: Record<"en" | "fa", Copy> = {
  en: {
    title: "Online classrooms",
    description:
      "Schedule sessions and manage persistent class files. Live lessons open in the selected classroom provider.",
    empty: "No classroom sessions are scheduled yet.",
    loading: "Loading sessions…",
    course: "Course",
    scheduledAt: "Date and time",
    duration: "Duration (minutes)",
    meetingUrl: "Adobe Connect meeting URL (optional)",
    notes: "Session notes (optional)",
    create: "Schedule class",
    creating: "Saving…",
    join: "Join Class",
    noLink: "The classroom link has not been added yet.",
    materials: "Course materials",
    homework: "Homework files",
    submission: "Submit homework",
    upload: "Upload file",
    uploading: "Uploading…",
    status: {
      scheduled: "Scheduled",
      ongoing: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    error: "Could not complete the request. Please try again.",
  },
  fa: {
    title: "کلاس‌های آنلاین",
    description:
      "جلسه‌ها را برنامه‌ریزی و فایل‌های ماندگار کلاس را مدیریت کنید. کلاس زنده در سامانه انتخاب‌شده باز می‌شود.",
    empty: "هنوز جلسه‌ای برنامه‌ریزی نشده است.",
    loading: "در حال دریافت جلسه‌ها…",
    course: "دوره",
    scheduledAt: "تاریخ و ساعت",
    duration: "مدت (دقیقه)",
    meetingUrl: "پیوند جلسه Adobe Connect (اختیاری)",
    notes: "یادداشت جلسه (اختیاری)",
    create: "برنامه‌ریزی کلاس",
    creating: "در حال ذخیره…",
    join: "ورود به کلاس",
    noLink: "پیوند کلاس هنوز ثبت نشده است.",
    materials: "منابع دوره",
    homework: "فایل‌های تکلیف",
    submission: "ارسال تکلیف",
    upload: "بارگذاری فایل",
    uploading: "در حال بارگذاری…",
    status: {
      scheduled: "برنامه‌ریزی‌شده",
      ongoing: "در حال برگزاری",
      completed: "تمام‌شده",
      cancelled: "لغوشده",
    },
    error: "انجام درخواست ناموفق بود. دوباره تلاش کنید.",
  },
};

const inputClass =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] outline-none focus:border-blue focus:bg-white";

export default function ClassroomSessions({
  audience,
}: {
  audience: Audience;
}) {
  const { lang } = useLanguage();
  const copy = words[lang === "fa" ? "fa" : "en"];
  const [sessions, setSessions] = useState<ClassroomSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState("");
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingJoin, setPendingJoin] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{
    sessionId: string;
    category: ClassroomFileCategory;
  } | null>(null);

  const refresh = useCallback(async () => {
    const next = await getClassroomSessions();
    setSessions(next);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getClassroomSessions(),
      audience === "teacher" ? getCourses(lang) : Promise.resolve([]),
    ])
      .then(([items, catalog]) => {
        if (!active) return;
        setSessions(items);
        setCourses(catalog);
        setCourseId(catalog[0]?.id ?? "");
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : copy.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [audience, copy.error, lang]);

  const schedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (meetingUrl && !isSafeClassroomUrl(meetingUrl)) {
      setError("Please enter a valid HTTPS classroom URL.");
      return;
    }
    setSaving(true);
    try {
      await createClassroomSession({
        courseId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        provider: "adobe_connect",
        meetingUrl: meetingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setScheduledAt("");
      setMeetingUrl("");
      setNotes("");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy.error);
    } finally {
      setSaving(false);
    }
  };

  const join = async (session: ClassroomSession) => {
    setError("");
    setPendingJoin(session.id);
    const opened = window.open("about:blank", "_blank");
    if (opened) opened.opener = null;
    try {
      const url = await joinClassroomSession(session.id);
      if (opened) opened.location.href = url;
      else window.location.assign(url);
    } catch (reason) {
      opened?.close();
      setError(reason instanceof Error ? reason.message : copy.error);
    } finally {
      setPendingJoin("");
    }
  };

  const chooseUpload = (sessionId: string, category: ClassroomFileCategory) => {
    uploadTargetRef.current = { sessionId, category };
    fileInputRef.current?.click();
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const target = uploadTargetRef.current;
    event.target.value = "";
    if (!file || !target) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("Files must be 50 MB or smaller.");
      return;
    }
    setUploadingId(target.sessionId);
    setError("");
    try {
      await uploadClassroomFile(target.sessionId, file, target.category);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy.error);
    } finally {
      setUploadingId("");
      uploadTargetRef.current = null;
    }
  };

  const materialGroups = (
    materials: ClassroomMaterial[],
    category: ClassroomMaterial["category"],
  ) => materials.filter((material) => material.category === category);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-serif text-[23px] font-semibold">
          {copy.title}
        </h2>
        <p className="m-0 text-[13.5px] text-muted">{copy.description}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger"
        >
          {error}
        </p>
      )}

      {audience === "teacher" && (
        <form
          onSubmit={schedule}
          className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-card sm:grid-cols-2 sm:p-5"
        >
          <label className="space-y-1.5 text-[12px] font-semibold text-ink70">
            {copy.course}
            <select
              className={inputClass}
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-[12px] font-semibold text-ink70">
            {copy.scheduledAt}
            <input
              className={inputClass}
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />
          </label>
          <label className="space-y-1.5 text-[12px] font-semibold text-ink70">
            {copy.duration}
            <input
              className={inputClass}
              type="number"
              min={15}
              max={480}
              step={15}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              required
            />
          </label>
          <label className="space-y-1.5 text-[12px] font-semibold text-ink70">
            {copy.meetingUrl}
            <input
              className={inputClass}
              type="url"
              placeholder="https://…"
              value={meetingUrl}
              onChange={(event) => setMeetingUrl(event.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-[12px] font-semibold text-ink70 sm:col-span-2">
            {copy.notes}
            <textarea
              className={inputClass}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="rounded-full bg-blue px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-blueDeep disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
          >
            {saving ? copy.creating : copy.create}
          </button>
        </form>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={upload}
      />
      {loading ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-[13px] text-muted">
          {copy.loading}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-[13px] text-muted">
          {copy.empty}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sessions.map((session) => {
            const materials = materialGroups(
              session.materials,
              "course_material",
            );
            const homework = materialGroups(session.materials, "homework");
            const submissions = materialGroups(session.materials, "submission");
            return (
              <article
                key={session.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-blue">
                      <BookOpen size={14} />{" "}
                      {session.provider.replaceAll("_", " ")}
                    </div>
                    <h3 className="mb-1 mt-2 text-[16px] font-semibold">
                      {session.courseTitle ||
                        courses.find((course) => course.id === session.courseId)
                          ?.title ||
                        copy.course}
                    </h3>
                    <p className="m-0 text-[12px] text-muted">
                      {audience === "teacher"
                        ? session.teacherName
                        : session.teacherName}
                    </p>
                  </div>
                  <span className="rounded-full bg-sage px-3 py-1.5 text-[11px] font-bold text-sageDeep">
                    {copy.status[session.status]}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-ink70">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock size={14} />
                    {session.scheduledAt
                      ? new Date(session.scheduledAt).toLocaleString(
                          lang === "fa" ? "fa-IR" : "en-US",
                        )
                      : "—"}
                  </span>
                  <span>{session.duration} min</span>
                </div>
                {session.notes && (
                  <p className="mb-0 mt-3 whitespace-pre-wrap text-[12.5px] leading-5 text-ink70">
                    {session.notes}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {session.meetingUrl ? (
                    <button
                      type="button"
                      onClick={() => void join(session)}
                      disabled={
                        pendingJoin === session.id ||
                        session.status === "cancelled" ||
                        session.status === "completed"
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-blue px-4 py-2.5 text-[12px] font-bold text-white hover:bg-blueDeep disabled:opacity-50"
                    >
                      <ExternalLink size={14} />
                      {pendingJoin === session.id ? "…" : copy.join}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                      <Link2 size={14} />
                      {copy.noLink}
                    </span>
                  )}
                  {audience === "teacher" && (
                    <button
                      type="button"
                      onClick={() =>
                        chooseUpload(session.id, "course_material")
                      }
                      disabled={uploadingId === session.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[11px] font-semibold text-ink70 hover:border-blue"
                    >
                      <Upload size={13} />
                      {uploadingId === session.id
                        ? copy.uploading
                        : copy.upload}{" "}
                      · {copy.materials}
                    </button>
                  )}
                  {audience === "teacher" && (
                    <button
                      type="button"
                      onClick={() => chooseUpload(session.id, "homework")}
                      disabled={uploadingId === session.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[11px] font-semibold text-ink70 hover:border-blue"
                    >
                      <Upload size={13} />
                      {copy.upload} · {copy.homework}
                    </button>
                  )}
                  {audience === "student" && (
                    <button
                      type="button"
                      onClick={() => chooseUpload(session.id, "submission")}
                      disabled={uploadingId === session.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[11px] font-semibold text-ink70 hover:border-blue"
                    >
                      <Upload size={13} />
                      {uploadingId === session.id
                        ? copy.uploading
                        : copy.submission}
                    </button>
                  )}
                </div>
                <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
                  {[
                    [copy.materials, materials],
                    [copy.homework, [...homework, ...submissions]],
                  ].map(([heading, files]) => (
                    <div key={heading as string}>
                      <h4 className="mb-2 text-[11px] font-bold text-ink70">
                        {heading as string}
                      </h4>
                      {(files as ClassroomMaterial[]).length === 0 ? (
                        <p className="m-0 text-[11px] text-muted">—</p>
                      ) : (
                        (files as ClassroomMaterial[]).map((file) => (
                          <a
                            key={file.id}
                            href={file.downloadUrl || undefined}
                            target="_blank"
                            rel="noreferrer"
                            className={`mb-1 flex items-center gap-1.5 truncate text-[11px] ${file.downloadUrl ? "text-blue hover:underline" : "text-muted"}`}
                          >
                            <FileText size={12} className="shrink-0" />
                            {file.name}
                          </a>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
