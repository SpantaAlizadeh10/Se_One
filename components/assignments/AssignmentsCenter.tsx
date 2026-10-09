"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  LoaderCircle,
  Paperclip,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";
import { formatApiDate } from "@/lib/date-utils";
import {
  getStudentAssignments,
  getStudentSubmissions,
  getStudentAttachmentDownloadUrl,
  finalizeStudentSubmission,
  saveStudentAssignmentDraft,
  submitAssignment,
  uploadStudentAssignmentFile,
  type Assignment,
  type Submission,
} from "@/lib/api/assignments";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS =
  /\.(pdf|png|jpe?g|webp|gif|docx?|xlsx?|pptx?|txt|mp3|m4a|wav|mp4|zip)$/i;

type AssignmentItem = { assignment: Assignment; submission?: Submission };
type StatusFilter = "all" | "pending" | "submitted" | "returned" | "graded";

export default function AssignmentsCenter() {
  const { lang } = useLanguage();
  const { isChildMode } = useStudentExperience();
  const fa = lang === "fa";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AssignmentItem | null>(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [assignments, submissions] = await Promise.all([
        getStudentAssignments(),
        getStudentSubmissions(),
      ]);
      const nextItems = assignments
        .filter((assignment) => assignment.isPublished)
        .map((assignment) => ({
          assignment,
          submission: submissions.find(
            (submission) => submission.assignmentId === assignment.id,
          ),
        }))
        .sort((a, b) => {
          const aDue = a.assignment.dueDate
            ? new Date(a.assignment.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bDue = b.assignment.dueDate
            ? new Date(b.assignment.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          return aDue - bDue;
        });
      setItems(nextItems);
      const requestedId = new URLSearchParams(window.location.search).get(
        "assignment",
      );
      const requested = nextItems.find(
        (item) => item.assignment.id === requestedId,
      );
      if (requested) openAssignment(requested);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "تکلیف‌ها بارگذاری نشدند."
            : "Could not load assignments.",
      );
    } finally {
      setLoading(false);
    }
  }, [fa]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAssignment = (item: AssignmentItem) => {
    setSelected(item);
    setContent(item.submission?.content || "");
    setAttachmentPaths(item.submission?.attachments || []);
    setFiles([]);
    setError("");
    setSuccess("");
  };

  const visibleItems = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter(({ submission }) => {
            if (filter === "pending")
              return !submission || submission.status === "draft";
            return submission?.status === filter;
          }),
    [filter, items],
  );

  const statusFor = (submission?: Submission): StatusFilter => {
    if (!submission || submission.status === "draft") return "pending";
    return submission.status === "returned" ? "returned" : submission.status;
  };

  const uploadNewFiles = async () => {
    if (!selected || files.length === 0) return attachmentPaths;
    const filesToUpload = [...files];
    const uploaded = [...attachmentPaths];
    for (let index = 0; index < filesToUpload.length; index += 1) {
      setUploadProgress(
        fa
          ? `در حال بارگذاری ${index + 1} از ${filesToUpload.length}…`
          : `Uploading ${index + 1} of ${filesToUpload.length}…`,
      );
      uploaded.push(
        await uploadStudentAssignmentFile(
          selected.assignment.id,
          filesToUpload[index],
        ),
      );
      setAttachmentPaths([...uploaded]);
      setFiles((current) =>
        current.filter((file) => file !== filesToUpload[index]),
      );
    }
    setUploadProgress("");
    return uploaded;
  };

  const saveOrSubmit = async (submit: boolean) => {
    if (!selected) return;
    setError("");
    setSuccess("");
    if (!content.trim() && attachmentPaths.length === 0 && files.length === 0) {
      setError(
        fa
          ? "پاسخ یا فایل تمرین را اضافه کنید."
          : "Add a written response or an attachment first.",
      );
      return;
    }
    setSaving(true);
    try {
      const attachments = await uploadNewFiles();
      const input = { content: content.trim(), attachments };
      let saved: Submission;
      if (submit) {
        saved = selected.submission?.id
          ? await finalizeStudentSubmission(selected.submission.id, input)
          : await submitAssignment(selected.assignment.id, input);
      } else {
        saved = await saveStudentAssignmentDraft(selected.assignment.id, input);
      }
      setItems((current) =>
        current.map((item) =>
          item.assignment.id === selected.assignment.id
            ? { ...item, submission: saved }
            : item,
        ),
      );
      setSelected((current) =>
        current ? { ...current, submission: saved } : current,
      );
      setAttachmentPaths(saved.attachments || attachments);
      setSuccess(
        submit
          ? fa
            ? "تمرین برای معلم ارسال شد."
            : "Your work was sent to your teacher."
          : fa
            ? "پیش‌نویس ذخیره شد؛ می‌توانی بعداً ادامه بدهی."
            : "Draft saved. You can continue later.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ذخیره یا ارسال تمرین ناموفق بود."
            : "Could not save or submit your work.",
      );
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const incoming = Array.from(selectedFiles);
    const allowed = incoming.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(
          fa
            ? `حجم «${file.name}» بیشتر از ۲۰ مگابایت است.`
            : `“${file.name}” is larger than 20 MB.`,
        );
        return false;
      }
      if (!ACCEPTED_EXTENSIONS.test(file.name)) {
        setError(
          fa
            ? `فرمت «${file.name}» پشتیبانی نمی‌شود.`
            : `“${file.name}” has an unsupported file type.`,
        );
        return false;
      }
      return true;
    });
    setFiles((current) =>
      [...current, ...allowed].slice(
        0,
        Math.max(0, MAX_FILES - attachmentPaths.length),
      ),
    );
    setError("");
  };

  const download = async (path: string) => {
    try {
      const url = /^https:\/\//i.test(path)
        ? path
        : await getStudentAttachmentDownloadUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "دریافت فایل ناموفق بود."
            : "Could not download this file.",
      );
    }
  };

  const counts = {
    pending: items.filter(
      ({ submission }) => !submission || submission.status === "draft",
    ).length,
    submitted: items.filter(
      ({ submission }) => submission?.status === "submitted",
    ).length,
    returned: items.filter(
      ({ submission }) => submission?.status === "returned",
    ).length,
    graded: items.filter(({ submission }) => submission?.status === "graded")
      .length,
  };
  const filterLabels: Record<StatusFilter, string> = {
    all: fa ? "همه" : "All",
    pending: fa ? "انجام‌نشده" : "To do",
    submitted: fa ? "ارسال‌شده" : "Submitted",
    returned: fa ? "نیازمند اصلاح" : "Needs revision",
    graded: fa ? "نمره‌گرفته" : "Graded",
  };
  const statusStyle: Record<StatusFilter, string> = {
    all: "bg-blue/10 text-blue",
    pending: "bg-goldSoft text-goldDeep",
    submitted: "bg-blue/10 text-blue",
    returned: "bg-danger/10 text-danger",
    graded: "bg-sage text-sageDeep",
  };
  const actionLabel = (status: StatusFilter, hasDraft: boolean) => {
    if (!isChildMode) {
      if (status === "graded") return fa ? "دیدن بازخورد" : "View feedback";
      if (status === "submitted") return fa ? "دیدن ارسال" : "View submission";
      if (status === "returned") return fa ? "اصلاح و ارسال" : "Revise";
      if (hasDraft) return fa ? "ادامه پیش‌نویس" : "Continue draft";
      return fa ? "شروع تمرین" : "Start";
    }
    if (status === "graded") return fa ? "پیام معلم" : "Teacher’s note";
    if (status === "submitted") return fa ? "دیدن کارم" : "See my work";
    if (status === "returned") return fa ? "دوباره امتحان می‌کنم" : "Try again";
    if (hasDraft) return fa ? "ادامه کارم" : "Keep going";
    return fa ? "شروع کنیم!" : "Let’s start!";
  };

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {(
          [
            ["pending", Clock, counts.pending],
            ["submitted", Send, counts.submitted],
            ["returned", FileText, counts.returned],
            ["graded", Award, counts.graded],
          ] as const
        ).map(([key, Icon, count]) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-card"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusStyle[key]}`}
            >
              <Icon size={18} />
            </span>
            <span>
              <strong className="block text-[20px]">{count}</strong>
              <span className="text-[11px] text-muted">
                {filterLabels[key]}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "submitted", "returned", "graded"] as const).map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold ${filter === key ? "border-ink bg-ink text-white" : "border-line bg-white text-ink70"}`}
            >
              {filterLabels[key]}
            </button>
          ),
        )}
      </div>

      {error && !selected && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-danger/10 p-3 text-[12px] text-danger"
        >
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-cream">
              {[
                fa ? "تمرین" : "Assignment",
                fa ? "مهلت" : "Due",
                fa ? "وضعیت" : "Status",
                fa ? "نمره" : "Grade",
                "",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-start text-[10px] font-bold uppercase tracking-wide text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[13px] text-muted"
                >
                  <LoaderCircle
                    className="mx-auto mb-2 animate-spin"
                    size={18}
                  />
                  {fa
                    ? "در حال بارگذاری تمرین‌ها…"
                    : "Loading your assignments…"}
                </td>
              </tr>
            ) : (
              visibleItems.map((item) => {
                const status = statusFor(item.submission);
                const overdue =
                  status === "pending" &&
                  item.assignment.dueDate &&
                  new Date(item.assignment.dueDate).getTime() < Date.now();
                const gradePercent =
                  item.submission?.grade != null &&
                  item.assignment.maxPoints > 0
                    ? Math.round(
                        (item.submission.grade / item.assignment.maxPoints) *
                          100,
                      )
                    : null;
                return (
                  <tr
                    key={item.assignment.id}
                    className="border-b border-line last:border-0 hover:bg-cream/50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[13px]">
                        {item.assignment.title}
                      </div>
                      <div className="mt-1 text-[11px] text-muted">
                        {item.assignment.courseTitle}
                        {item.assignment.teacherName
                          ? ` · ${item.assignment.teacherName}`
                          : ""}
                      </div>
                    </td>
                    <td
                      className={`px-4 py-4 text-[12px] ${overdue ? "font-semibold text-danger" : "text-ink70"}`}
                    >
                      {item.assignment.dueDate
                        ? formatApiDate(item.assignment.dueDate, lang)
                        : "—"}
                      {overdue && (
                        <span className="ms-1">
                          {fa ? "(گذشته)" : "(overdue)"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[status]}`}
                      >
                        {overdue
                          ? fa
                            ? "عقب‌افتاده"
                            : "Overdue"
                          : filterLabels[status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-semibold">
                      {gradePercent == null ? "—" : `${gradePercent}%`}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openAssignment(item)}
                        className="rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white hover:bg-blueDeep"
                      >
                        {actionLabel(status, Boolean(item.submission))}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            {!loading && visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <CheckCircle2
                    size={25}
                    className="mx-auto mb-2 text-sageDeep"
                  />
                  <p className="m-0 text-[13px] font-semibold">
                    {items.length === 0
                      ? fa
                        ? "تکلیف فعالی نداری"
                        : "You’re all caught up"
                      : fa
                        ? "تمرینی با این فیلتر پیدا نشد."
                        : "No assignments in this filter."}
                  </p>
                  <p className="mb-0 mt-1 text-[11px] text-muted">
                    {items.length === 0
                      ? fa
                        ? "وقتی معلم تمرین جدیدی بدهد، همین‌جا می‌بینی."
                        : "New work from your teacher will show up here."
                      : ""}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-dialog-title"
            className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <header className="mb-4 flex items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-blue">
                  {selected.assignment.courseTitle}
                </div>
                <h2
                  id="assignment-dialog-title"
                  className="m-0 text-[18px] font-semibold"
                >
                  {selected.assignment.title}
                </h2>
                <p className="mb-0 mt-1 text-[11px] text-muted">
                  {selected.assignment.dueDate
                    ? `${fa ? "مهلت ارسال" : "Due"}: ${formatApiDate(selected.assignment.dueDate, lang)}`
                    : fa
                      ? "بدون مهلت مشخص"
                      : "No due date"}
                  {selected.assignment.maxPoints
                    ? ` · ${selected.assignment.maxPoints} ${fa ? "امتیاز" : "points"}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label={fa ? "بستن" : "Close"}
                onClick={() => !saving && setSelected(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-muted"
              >
                <X size={17} />
              </button>
            </header>
            <div className="space-y-4">
              <section className="rounded-xl bg-cream/70 p-3.5">
                <h3 className="mb-1 mt-0 text-[12px] font-bold">
                  {fa ? "توضیحات" : "Instructions"}
                </h3>
                <p className="m-0 whitespace-pre-wrap text-[12.5px] leading-6">
                  {selected.assignment.instructions ||
                    selected.assignment.description ||
                    (fa ? "توضیحی ثبت نشده." : "No additional instructions.")}
                </p>
              </section>
              {selected.assignment.attachments?.length ? (
                <section>
                  <h3 className="mb-2 mt-0 text-[12px] font-bold">
                    {fa ? "فایل‌های معلم" : "Teacher files"}
                  </h3>
                  <div className="space-y-2">
                    {selected.assignment.attachments.map((path) => (
                      <button
                        type="button"
                        key={path}
                        onClick={() => void download(path)}
                        className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-start text-[11px] text-blue"
                      >
                        <Download size={14} />
                        {path.split("/").pop()}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {selected.submission?.feedback && (
                <section className="rounded-xl border border-sage/70 bg-sage/35 p-3.5">
                  <h3 className="mb-1 mt-0 text-[12px] font-bold">
                    {fa ? "بازخورد معلم" : "Teacher feedback"}
                  </h3>
                  <p className="m-0 whitespace-pre-wrap text-[12.5px] leading-6">
                    {selected.submission.feedback}
                  </p>
                  {selected.submission.grade != null && (
                    <p className="mb-0 mt-2 text-[12px] font-bold">
                      {fa ? "نمره" : "Grade"}: {selected.submission.grade} /{" "}
                      {selected.assignment.maxPoints}
                    </p>
                  )}
                </section>
              )}
              {selected.submission?.attachments?.length ? (
                <section>
                  <h3 className="mb-2 mt-0 text-[12px] font-bold">
                    {fa ? "فایل‌های ارسال‌شده" : "Your uploaded files"}
                  </h3>
                  <div className="space-y-2">
                    {selected.submission.attachments.map((path) => (
                      <button
                        type="button"
                        key={path}
                        onClick={() => void download(path)}
                        className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-start text-[11px] text-blue"
                      >
                        <Download size={14} />
                        {path.split("/").pop()}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {!selected.submission ||
              selected.submission.status === "draft" ||
              selected.submission.status === "returned" ? (
                <>
                  <label className="block text-[12px] font-semibold">
                    {fa ? "پاسخ تو" : "Your response"}
                    <textarea
                      rows={6}
                      maxLength={10000}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder={
                        fa
                          ? "پاسخت را اینجا بنویس…"
                          : "Type your response here…"
                      }
                      className="mt-1.5 w-full resize-y rounded-xl border border-line px-3.5 py-3 text-[13px] font-normal leading-6 outline-none focus:border-blue"
                    />
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp3,.m4a,.wav,.mp4,.zip"
                    className="sr-only"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <div className="rounded-xl border border-dashed border-blue/30 bg-blue/[0.03] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="m-0 flex items-center gap-2 text-[12px] font-bold">
                          <UploadCloud size={15} className="text-blue" />
                          {fa ? "پیوست تمرین" : "Attach your work"}
                        </h3>
                        <p className="mb-0 mt-1 text-[10.5px] text-muted">
                          {fa
                            ? "PDF، عکس، Word، صدا یا ZIP · حداکثر ۵ فایل و هر فایل ۲۰ مگابایت"
                            : "PDF, images, Office, audio or ZIP · up to 5 files, 20 MB each"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                          saving ||
                          attachmentPaths.length + files.length >= MAX_FILES
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-semibold text-blue disabled:opacity-50"
                      >
                        <Paperclip size={14} />
                        {fa ? "انتخاب فایل" : "Choose files"}
                      </button>
                    </div>
                    {(attachmentPaths.length > 0 || files.length > 0) && (
                      <div className="mt-3 space-y-1.5">
                        {attachmentPaths.map((path, index) => (
                          <div
                            key={`${path}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[10.5px]"
                          >
                            <FileText
                              size={13}
                              className="shrink-0 text-blue"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {path.split("/").pop()}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setAttachmentPaths((current) =>
                                  current.filter(
                                    (_, itemIndex) => itemIndex !== index,
                                  ),
                                )
                              }
                              className="text-muted"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[10.5px]"
                          >
                            <FileText
                              size={13}
                              className="shrink-0 text-blue"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {file.name} · {Math.ceil(file.size / 1024)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((current) =>
                                  current.filter(
                                    (_, fileIndex) => fileIndex !== index,
                                  ),
                                )
                              }
                              className="text-muted"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {uploadProgress && (
                    <p className="m-0 text-[11px] text-blue">
                      {uploadProgress}
                    </p>
                  )}
                  {error && (
                    <p
                      role="alert"
                      className="m-0 rounded-lg bg-danger/10 p-3 text-[11px] text-danger"
                    >
                      {error}
                    </p>
                  )}
                  {success && (
                    <p
                      role="status"
                      className="m-0 rounded-lg bg-sage p-3 text-[11px] text-sageDeep"
                    >
                      {success}
                    </p>
                  )}
                  <footer className="flex flex-col-reverse gap-2 border-t border-line pt-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      disabled={saving}
                      className="rounded-xl border border-line px-4 py-2.5 text-[12px] font-semibold"
                    >
                      {fa ? "بستن" : "Close"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveOrSubmit(false)}
                        disabled={saving}
                        className="flex-1 rounded-xl border border-blue px-4 py-2.5 text-[12px] font-semibold text-blue disabled:opacity-50 sm:flex-none"
                      >
                        {saving
                          ? fa
                            ? "در حال ذخیره…"
                            : "Saving…"
                          : fa
                            ? "ذخیره پیش‌نویس"
                            : "Save draft"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveOrSubmit(true)}
                        disabled={saving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blueDeep disabled:opacity-50 sm:flex-none"
                      >
                        {saving ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        {fa ? "ارسال برای معلم" : "Submit to teacher"}
                      </button>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="rounded-xl border border-line bg-cream/60 p-3 text-[12px] text-ink70">
                  {selected.submission.status === "graded"
                    ? fa
                      ? "این تمرین بررسی شده است."
                      : "This assignment has been graded."
                    : fa
                      ? "تمرین ارسال شده و منتظر بررسی معلم است."
                      : "Submitted and waiting for your teacher’s review."}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
