"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, Megaphone, Users } from "lucide-react";
import { getRole, getUserId } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getTeacherGroupMessages,
  sendTeacherGroupMessage,
  type TeacherGroupMessage,
} from "@/lib/api/teacher-group-chat";

function formatTimestamp(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function TeacherGroupChat() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";
  const [role, setRole] = useState<"teacher" | "admin">("teacher");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<TeacherGroupMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const loaded = await getTeacherGroupMessages();
    setMessages(loaded);
    setError("");
  }, []);

  useEffect(() => {
    setRole(getRole() === "admin" ? "admin" : "teacher");
    setUserId(getUserId() || "");
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loaded = await getTeacherGroupMessages();
        if (active) {
          setMessages(loaded);
          setError("");
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "گفت‌وگوی گروهی بارگذاری نشد."
                : "Could not load the teacher group chat.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [fa]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    try {
      const sent = await sendTeacherGroupMessage(
        content,
        role === "admin" && isAnnouncement,
      );
      setMessages((current) =>
        current.some((message) => message.id === sent.id)
          ? current
          : [...current, sent],
      );
      setDraft("");
      try {
        await refresh();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? `${fa ? "پیام ارسال شد، اما فهرست پیام‌ها تازه نشد" : "Message sent, but the chat could not be refreshed"}: ${reason.message}`
            : fa
              ? "پیام ارسال شد، اما فهرست پیام‌ها تازه نشد."
              : "Message sent, but the chat could not be refreshed.",
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "پیام ارسال نشد."
            : "Could not send the message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-[min(76dvh,780px)] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue">
          <Users size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 truncate text-[14px] font-semibold">
            {fa ? "گفت‌وگوی گروهی معلمان" : "Teacher Group Chat"}
          </h2>
          <p className="m-0 mt-0.5 text-[11px] text-muted">
            {fa
              ? "همه معلمان تأییدشده و مدیران"
              : "All approved teachers and admins"}
          </p>
        </div>
      </header>

      <div
        aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-5"
      >
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-[12px] text-muted">
            <LoaderCircle size={16} className="animate-spin" />
            {fa ? "در حال بارگذاری پیام‌ها…" : "Loading messages…"}
          </p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-muted">
            {fa ? "هنوز پیامی در گروه نیست." : "No messages in the group yet."}
          </p>
        ) : (
          messages.map((message) => {
            const mine = Boolean(userId && message.senderId === userId);
            return (
              <article
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] break-words rounded-2xl px-3.5 py-2.5 sm:max-w-[78%] ${
                    message.isAnnouncement
                      ? "border border-gold/40 bg-gold/10 text-ink"
                      : mine
                        ? "bg-blue text-white"
                        : "border border-line bg-cream text-ink"
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold opacity-75">
                    {message.isAnnouncement && <Megaphone size={12} />}
                    <span>{message.senderName}</span>
                    <span>
                      {message.senderRole === "admin"
                        ? fa
                          ? "مدیر"
                          : "Admin"
                        : fa
                          ? "معلم"
                          : "Teacher"}
                    </span>
                  </div>
                  <p className="m-0 whitespace-pre-wrap text-[12px] leading-5">
                    {message.content}
                  </p>
                  <time className="mt-1.5 block text-[9px] opacity-65">
                    {formatTimestamp(message.createdAt, locale)}
                  </time>
                </div>
              </article>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mx-3 mb-0 rounded-lg bg-danger/10 p-2.5 text-[11px] text-danger sm:mx-5">
          {error}
        </p>
      )}
      <form onSubmit={(event) => void send(event)} className="shrink-0 border-t border-line p-3 sm:p-4">
        {role === "admin" && (
          <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 text-[11px] font-medium text-ink70">
            <input
              type="checkbox"
              checked={isAnnouncement}
              onChange={(event) => setIsAnnouncement(event.target.checked)}
              className="accent-blue"
            />
            <Megaphone size={14} />
            {fa ? "ارسال به‌عنوان اطلاعیه مهم" : "Send as an announcement"}
          </label>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            maxLength={5000}
            placeholder={fa ? "پیام گروه را بنویسید…" : "Write to the group…"}
            className="min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[12px] outline-none focus:border-blue focus:bg-white"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label={fa ? "ارسال پیام" : "Send message"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue text-white hover:bg-blueDeep disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Send size={16} className="rtl:rotate-180" />
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
