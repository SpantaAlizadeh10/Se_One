"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarClock,
  Megaphone,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement,
  type Announcement,
  type AnnouncementAudience,
  type AnnouncementInput,
  type AnnouncementKind,
  type AnnouncementStatus,
} from "@/lib/api/announcements";

const emptyForm: AnnouncementInput = {
  title: "",
  message: "",
  audience: "students",
  kind: "info",
  status: "draft",
};

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function AdminAnnouncements({ lang }: { lang: "fa" | "en" }) {
  const fa = lang === "fa";
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listAdminAnnouncements("all"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : fa
            ? "بارگذاری اطلاعیه‌ها ناموفق بود."
            : "Could not load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }, [fa]);

  useEffect(() => {
    if (!isApiConfigured()) {
      setError(
        fa ? "آدرس API تنظیم نشده است." : "Backend API URL is not configured.",
      );
      return;
    }
    void load();
  }, [fa, load]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
  };

  const startEdit = (item: Announcement) => {
    setEditing(item);
    setForm({
      title: item.title,
      message: item.message,
      audience: item.audience,
      kind: item.kind,
      status: item.status,
      actionUrl: item.actionUrl || "",
      actionLabel: item.actionLabel || "",
      publishAt: localDateTime(item.publishAt),
      expiresAt: localDateTime(item.expiresAt),
    });
    setError("");
    setNotice("");
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const publishDate = form.publishAt ? new Date(form.publishAt) : undefined;
    const expiryDate = form.expiresAt ? new Date(form.expiresAt) : undefined;
    const actionUrl = form.actionUrl?.trim();
    if (
      form.status === "scheduled" &&
      (!publishDate ||
        Number.isNaN(publishDate.getTime()) ||
        publishDate <= new Date())
    ) {
      setError(
        fa
          ? "برای زمان‌بندی، زمان انتشار آینده را انتخاب کنید."
          : "Choose a future publish time to schedule this announcement.",
      );
      return;
    }
    if (
      expiryDate &&
      (Number.isNaN(expiryDate.getTime()) ||
        expiryDate <= (publishDate || new Date()))
    ) {
      setError(
        fa
          ? "زمان انقضا باید بعد از زمان انتشار باشد."
          : "Expiry must be later than the publish time.",
      );
      return;
    }
    if (
      actionUrl &&
      !/^https:\/\//i.test(actionUrl) &&
      !/^\/(?!\/)/.test(actionUrl)
    ) {
      setError(
        fa
          ? "لینک باید با https:// یا مسیر داخلی مثل /fa/courses شروع شود."
          : "Use an https:// link or a same-site path such as /en/courses.",
      );
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    const payload: AnnouncementInput = {
      ...form,
      title: form.title.trim(),
      message: form.message.trim(),
      actionUrl: actionUrl || undefined,
      actionLabel: form.actionLabel?.trim() || undefined,
      publishAt: isoDateTime(form.publishAt || ""),
      expiresAt: isoDateTime(form.expiresAt || ""),
    };
    try {
      if (editing) await updateAdminAnnouncement(editing.id, payload);
      else await createAdminAnnouncement(payload);
      setNotice(fa ? "اطلاعیه ذخیره شد." : "Announcement saved.");
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : fa
            ? "ذخیره اطلاعیه ناموفق بود."
            : "Could not save announcement.",
      );
    } finally {
      setSaving(false);
    }
  };

  const publishNow = async (item: Announcement) => {
    setError("");
    try {
      await updateAdminAnnouncement(item.id, {
        status: "published",
        publishAt: new Date().toISOString(),
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : fa
            ? "انتشار اطلاعیه ناموفق بود."
            : "Could not publish announcement.",
      );
    }
  };

  const remove = async (item: Announcement) => {
    if (
      !window.confirm(
        fa ? `اطلاعیه «${item.title}» حذف شود؟` : `Delete “${item.title}”?`,
      )
    )
      return;
    try {
      await deleteAdminAnnouncement(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editing?.id === item.id) startCreate();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : fa
            ? "حذف اطلاعیه ناموفق بود."
            : "Could not delete announcement.",
      );
    }
  };

  const audienceText = (audience: AnnouncementAudience) =>
    audience === "students"
      ? fa
        ? "دانش‌آموزان"
        : "Students"
      : audience === "teachers"
        ? fa
          ? "معلمان"
          : "Teachers"
        : fa
          ? "همه"
          : "Everyone";
  const statusText = (status: AnnouncementStatus) =>
    status === "published"
      ? fa
        ? "منتشرشده"
        : "Published"
      : status === "scheduled"
        ? fa
          ? "زمان‌بندی‌شده"
          : "Scheduled"
        : fa
          ? "پیش‌نویس"
          : "Draft";

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-[16px] font-semibold">
              <Megaphone size={18} className="text-blue" />
              {fa ? "اطلاعیه‌ها" : "Announcements"}
            </h2>
            <p className="mb-0 mt-1 text-[12px] text-muted">
              {fa
                ? "پیام‌های کاربردی برای دانش‌آموزان و معلمان منتشر کنید."
                : "Share helpful updates with students and teachers."}
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full bg-blue px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blueDeep"
          >
            <Plus size={16} />
            {fa ? "اطلاعیه جدید" : "New announcement"}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-xl bg-danger/10 p-3 text-[12px] text-danger"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-3 rounded-xl bg-sage p-3 text-[12px] text-sageDeep"
          >
            {notice}
          </p>
        )}
        {loading ? (
          <p className="py-8 text-center text-[13px] text-muted">
            {fa ? "در حال بارگذاری…" : "Loading…"}
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-cream/50 px-4 py-8 text-center">
            <Bell size={24} className="mx-auto mb-2 text-muted" />
            <p className="m-0 text-[13px] font-medium">
              {fa ? "هنوز اطلاعیه‌ای ندارید" : "No announcements yet"}
            </p>
            <p className="mb-0 mt-1 text-[12px] text-muted">
              {fa
                ? "اولین پیام را برای زبان‌آموزان یا معلمان آماده کنید."
                : "Create the first useful update for your learners or teachers."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-line p-3.5 sm:p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[10px] font-bold text-blue">
                        {audienceText(item.audience)}
                      </span>
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-ink70">
                        {statusText(item.status)}
                      </span>
                      {item.kind === "urgent" && (
                        <span className="rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-bold text-danger">
                          {fa ? "مهم" : "Important"}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 mt-0 text-[14px] font-semibold">
                      {item.title}
                    </h3>
                    <p className="m-0 whitespace-pre-wrap break-words text-[12px] leading-6 text-ink70">
                      {item.message}
                    </p>
                    {(item.publishAt || item.expiresAt) && (
                      <p className="mb-0 mt-2 flex items-center gap-1 text-[10.5px] text-muted">
                        <CalendarClock size={13} />
                        {item.publishAt &&
                          new Date(item.publishAt).toLocaleString(
                            fa ? "fa-IR" : "en-US",
                          )}
                        {item.expiresAt &&
                          ` · ${fa ? "پایان" : "Until"} ${new Date(item.expiresAt).toLocaleString(fa ? "fa-IR" : "en-US")}`}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.status !== "published" && (
                      <button
                        type="button"
                        title={fa ? "انتشار" : "Publish now"}
                        onClick={() => void publishNow(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/70 text-sageDeep hover:bg-sage"
                      >
                        <Send size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      title={fa ? "ویرایش" : "Edit"}
                      onClick={() => startEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue/10 text-blue hover:bg-blue/15"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      title={fa ? "حذف" : "Delete"}
                      onClick={() => void remove(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger/15"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="h-fit rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <h2 className="mb-4 mt-0 text-[16px] font-semibold">
          {editing
            ? fa
              ? "ویرایش اطلاعیه"
              : "Edit announcement"
            : fa
              ? "ساخت اطلاعیه"
              : "Create announcement"}
        </h2>
        <form onSubmit={save} className="space-y-3.5">
          <label className="block text-[12px] font-semibold">
            {fa ? "عنوان کوتاه" : "Short title"}
            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-2.5 font-normal outline-none focus:border-blue"
              placeholder={
                fa ? "مثلاً کلاس‌های این هفته" : "e.g. This week's classes"
              }
            />
          </label>
          <label className="block text-[12px] font-semibold">
            {fa ? "متن پیام" : "Message"}
            <textarea
              required
              maxLength={1200}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5 w-full resize-y rounded-xl border border-line px-3.5 py-2.5 font-normal leading-6 outline-none focus:border-blue"
              placeholder={
                fa
                  ? "پیام را ساده و روشن بنویسید…"
                  : "Write a clear, friendly message…"
              }
            />
            <span className="mt-1 block text-end text-[10px] font-normal text-muted">
              {form.message.length}/1200
            </span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-[12px] font-semibold">
              {fa ? "نمایش برای" : "Show to"}
              <select
                value={form.audience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    audience: e.target.value as AnnouncementAudience,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-blue"
              >
                <option value="students">
                  {fa ? "دانش‌آموزان" : "Students"}
                </option>
                <option value="teachers">{fa ? "معلمان" : "Teachers"}</option>
                <option value="all">
                  {fa ? "دانش‌آموزان و معلمان" : "Students and teachers"}
                </option>
              </select>
            </label>
            <label className="block text-[12px] font-semibold">
              {fa ? "نوع پیام" : "Message style"}
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({ ...form, kind: e.target.value as AnnouncementKind })
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-blue"
              >
                <option value="info">
                  {fa ? "اطلاع‌رسانی" : "Friendly update"}
                </option>
                <option value="success">{fa ? "خبر خوب" : "Good news"}</option>
                <option value="warning">{fa ? "یادآوری" : "Reminder"}</option>
                <option value="urgent">{fa ? "مهم" : "Important"}</option>
              </select>
            </label>
          </div>
          <label className="block text-[12px] font-semibold">
            {fa ? "لینک دکمه (اختیاری)" : "Action link (optional)"}
            <input
              type="text"
              value={form.actionUrl || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  actionUrl: e.target.value,
                  actionLabel: e.target.value ? form.actionLabel : "",
                })
              }
              className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-2.5 font-normal outline-none focus:border-blue"
              placeholder="https://… or /en/courses"
            />
          </label>
          {form.actionUrl && (
            <label className="block text-[12px] font-semibold">
              {fa ? "متن دکمه" : "Button label"}
              <input
                maxLength={40}
                value={form.actionLabel || ""}
                onChange={(e) =>
                  setForm({ ...form, actionLabel: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-2.5 font-normal outline-none focus:border-blue"
                placeholder={fa ? "مشاهده جزئیات" : "View details"}
              />
            </label>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-[12px] font-semibold">
              {fa ? "زمان انتشار" : "Publish at"}
              <input
                type="datetime-local"
                value={form.publishAt || ""}
                onChange={(e) =>
                  setForm({ ...form, publishAt: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-line px-2 py-2.5 text-[11px] font-normal outline-none focus:border-blue"
              />
            </label>
            <label className="block text-[12px] font-semibold">
              {fa ? "انقضا (اختیاری)" : "Expires (optional)"}
              <input
                type="datetime-local"
                value={form.expiresAt || ""}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-line px-2 py-2.5 text-[11px] font-normal outline-none focus:border-blue"
              />
            </label>
          </div>
          <label className="block text-[12px] font-semibold">
            {fa ? "وضعیت انتشار" : "Publication"}
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as AnnouncementStatus,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-blue"
            >
              <option value="draft">{fa ? "پیش‌نویس" : "Save as draft"}</option>
              <option value="published">{fa ? "انتشار" : "Publish"}</option>
              <option value="scheduled">{fa ? "زمان‌بندی" : "Schedule"}</option>
            </select>
          </label>
          {error && (
            <p
              role="alert"
              className="m-0 rounded-xl bg-danger/10 p-3 text-[12px] text-danger"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            {editing && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-xl border border-line px-4 py-2.5 text-[12px] font-semibold"
              >
                {fa ? "لغو ویرایش" : "Cancel edit"}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:opacity-50"
            >
              {saving
                ? fa
                  ? "در حال ذخیره…"
                  : "Saving…"
                : editing
                  ? fa
                    ? "ذخیره تغییرات"
                    : "Save changes"
                  : fa
                    ? "ذخیره اطلاعیه"
                    : "Save announcement"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
