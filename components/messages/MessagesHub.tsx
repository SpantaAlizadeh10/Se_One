"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  MessageCirclePlus,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getRole } from "@/lib/auth-client";
import {
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  getMessagingContacts,
  markConversationAsRead,
  sendMessage,
  uploadMessageAttachment,
  type Conversation,
  type Message,
  type MessagingContact,
} from "@/lib/api/messaging";

const MAX_CHAT_FILES = 5;
const MAX_CHAT_FILE_SIZE = 20 * 1024 * 1024;
const CHAT_FILE_TYPES =
  /\.(pdf|png|jpe?g|webp|gif|docx?|xlsx?|pptx?|txt|mp3|m4a|wav|mp4|zip)$/i;

function formatTime(value: string, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesHub() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const locale = fa ? "fa-IR" : "en-US";
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const isTeacher = role === "teacher";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<MessagingContact[]>([]);
  const [activeId, setActiveId] = useState("");
  const [mobilePane, setMobilePane] = useState<"list" | "thread">("list");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [selectedContact, setSelectedContact] =
    useState<MessagingContact | null>(null);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRole(getRole() || "student");
  }, []);

  const refreshConversations = useCallback(async () => {
    const loaded = await getConversations();
    setConversations(loaded);
    return loaded;
  }, []);

  useEffect(() => {
    let active = true;
    getConversations()
      .then((loaded) => {
        if (!active) return;
        setConversations(loaded);
        setActiveId((current) => current || loaded[0]?.id || "");
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "گفت‌وگوها بارگذاری نشدند."
                : "Could not load conversations.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fa]);

  const loadThread = useCallback(async (id: string) => {
    if (!id) return;
    const [conversation, loadedMessages] = await Promise.all([
      getConversation(id),
      getMessages(id),
    ]);
    setConversations((current) =>
      current.map((item) => (item.id === id ? conversation : item)),
    );
    setMessages(loadedMessages);
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const [conversation, loadedMessages] = await Promise.all([
          getConversation(activeId),
          getMessages(activeId),
        ]);
        if (!active) return;
        setConversations((current) =>
          current.map((item) => (item.id === activeId ? conversation : item)),
        );
        setMessages(loadedMessages);
      } catch {
        // Keep the last loaded messages visible during transient network failures.
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 6000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const activeConversation = conversations.find((item) => item.id === activeId);
  const visibleConversations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((item) => {
      const other = item.participants.find(
        (participant) => participant.role !== role,
      );
      return `${other?.name ?? item.subject ?? ""} ${item.lastMessage?.content ?? ""}`
        .toLocaleLowerCase()
        .includes(normalized);
    });
  }, [conversations, query, role]);

  const select = async (id: string) => {
    setActiveId(id);
    setMobilePane("thread");
    setError("");
    try {
      await markConversationAsRead(id);
      await loadThread(id);
      setConversations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, unreadCount: 0 } : item,
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "گفت‌وگو باز نشد."
            : "Could not open this conversation.",
      );
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_CHAT_FILE_SIZE) {
        setError(
          fa
            ? `حجم «${file.name}» بیشتر از ۲۰ مگابایت است.`
            : `“${file.name}” is larger than 20 MB.`,
        );
      } else if (!CHAT_FILE_TYPES.test(file.name)) {
        setError(
          fa
            ? `فرمت «${file.name}» پشتیبانی نمی‌شود.`
            : `“${file.name}” is not a supported file type.`,
        );
      } else accepted.push(file);
    }
    setFiles((current) => [...current, ...accepted].slice(0, MAX_CHAT_FILES));
  };

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if ((!draft.trim() && files.length === 0) || !activeId || sending) return;
    setSending(true);
    setError("");
    try {
      const sent = await sendMessage(activeId, {
        content: draft.trim() || (fa ? "فایل پیوست" : "Attachment"),
      });
      const outgoingFiles = [...files];
      setDraft("");
      for (let index = 0; index < outgoingFiles.length; index += 1) {
        setUploadProgress(
          fa
            ? `بارگذاری ${index + 1} از ${outgoingFiles.length}…`
            : `Uploading ${index + 1} of ${outgoingFiles.length}…`,
        );
        await uploadMessageAttachment(activeId, sent.id, outgoingFiles[index]);
        setFiles((current) =>
          current.filter((file) => file !== outgoingFiles[index]),
        );
      }
      setFiles([]);
      setUploadProgress("");
      await loadThread(activeId);
      await refreshConversations();
    } catch (reason) {
      void loadThread(activeId).catch(() => undefined);
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ارسال پیام ناموفق بود. دوباره تلاش کن."
            : "Message could not be sent. Please try again.",
      );
    } finally {
      setSending(false);
      setUploadProgress("");
    }
  };

  const startNewChat = async () => {
    setShowNewChat(true);
    setError("");
    if (contacts.length) return;
    setContactsLoading(true);
    try {
      setContacts(await getMessagingContacts());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "فهرست معلمان در دسترس نیست."
            : "Could not load available contacts.",
      );
    } finally {
      setContactsLoading(false);
    }
  };

  const createChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedContact) return;
    setCreating(true);
    setError("");
    try {
      const type =
        selectedContact.role === "support"
          ? isTeacher
            ? "teacher_support"
            : "student_support"
          : "student_teacher";
      const created = await createConversation({
        participantId: selectedContact.id,
        subject: subject.trim() || selectedContact.courseTitle,
        type,
        relatedCourseId: selectedContact.courseId,
        initialMessage: initialMessage.trim() || undefined,
      });
      const loaded = await refreshConversations();
      setActiveId(created.id);
      setShowNewChat(false);
      setSelectedContact(null);
      setSubject("");
      setInitialMessage("");
      setMobilePane("thread");
      await loadThread(created.id);
      if (!loaded.some((item) => item.id === created.id))
        setConversations((current) => [created, ...current]);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "گفت‌وگوی جدید ساخته نشد."
            : "Could not start the conversation.",
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    `${contact.name} ${contact.courseTitle ?? ""}`
      .toLocaleLowerCase()
      .includes(contactQuery.trim().toLocaleLowerCase()),
  );

  return (
    <>
      <div className="grid h-[calc(100dvh-220px)] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border border-line bg-white shadow-card md:grid-cols-[290px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 border-e border-line ${mobilePane === "thread" ? "hidden md:flex" : "flex"} flex-col`}
        >
          <div className="border-b border-line p-3.5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="m-0 text-[14px] font-semibold">
                {fa ? "گفت‌وگوها" : "Messages"}
              </h2>
              <button
                type="button"
                onClick={() => void startNewChat()}
                aria-label={fa ? "گفت‌وگوی جدید" : "Start a new chat"}
                title={fa ? "گفت‌وگوی جدید" : "Start a new chat"}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue text-white hover:bg-blueDeep"
              >
                <MessageCirclePlus size={17} />
              </button>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2">
              <Search size={15} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={fa ? "جستجوی گفت‌وگو…" : "Search conversations…"}
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-5 text-center text-[12px] text-muted">
                {fa ? "در حال بارگذاری…" : "Loading…"}
              </p>
            ) : visibleConversations.length === 0 ? (
              <div className="p-5 text-center">
                <p className="mb-3 text-[12px] text-muted">
                  {conversations.length
                    ? fa
                      ? "نتیجه‌ای پیدا نشد."
                      : "No matching conversations."
                    : fa
                      ? "هنوز گفت‌وگویی نداری."
                      : "No conversations yet."}
                </p>
                {!conversations.length && (
                  <button
                    type="button"
                    onClick={() => void startNewChat()}
                    className="rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white"
                  >
                    {fa ? "پیام به معلم" : "Message a teacher"}
                  </button>
                )}
              </div>
            ) : (
              visibleConversations.map((conversation) => {
                const other =
                  conversation.participants.find(
                    (participant) => participant.role !== role,
                  ) ?? conversation.participants[0];
                const selected = conversation.id === activeId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void select(conversation.id)}
                    className={`flex w-full items-center gap-2.5 border-b border-line px-3.5 py-3 text-start transition-colors ${selected ? "bg-blue/[0.06]" : "hover:bg-cream"}`}
                  >
                    <Image
                      src={other?.avatar || "/images/Teacher.jpeg"}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12.5px] font-semibold">
                          {other?.name ||
                            conversation.subject ||
                            (fa ? "پشتیبانی" : "Support")}
                        </span>
                        <time className="shrink-0 text-[9px] text-muted">
                          {formatTime(
                            conversation.lastMessage?.createdAt ||
                              conversation.updatedAt,
                            locale,
                          )}
                        </time>
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-muted">
                        {conversation.lastMessage?.content ||
                          conversation.subject ||
                          (fa ? "گفت‌وگوی جدید" : "New conversation")}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1 text-[9px] font-bold text-white">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`${mobilePane === "list" ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-col`}
        >
          {activeConversation ? (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-line px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => setMobilePane("list")}
                  aria-label={
                    fa ? "بازگشت به گفت‌وگوها" : "Back to conversations"
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-cream md:hidden"
                >
                  <ArrowLeft size={18} className="rtl:rotate-180" />
                </button>
                {(() => {
                  const other =
                    activeConversation.participants.find(
                      (participant) => participant.role !== role,
                    ) ?? activeConversation.participants[0];
                  return (
                    <>
                      <Image
                        src={other?.avatar || "/images/Teacher.jpeg"}
                        alt=""
                        width={38}
                        height={38}
                        unoptimized
                        className="h-[38px] w-[38px] rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <h2 className="m-0 truncate text-[13px] font-semibold">
                          {other?.name ||
                            activeConversation.subject ||
                            "Support"}
                        </h2>
                        <p className="m-0 mt-0.5 text-[10px] text-muted">
                          {activeConversation.subject ||
                            (other?.role === "support"
                              ? fa
                                ? "پشتیبانی"
                                : "Support"
                              : fa
                                ? "معلم"
                                : "Teacher")}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </header>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-4 sm:px-5">
                {messages.length === 0 && (
                  <div className="py-10 text-center text-[11px] text-muted">
                    {fa
                      ? "پیام‌ها و فایل‌های مربوط به این دوره را همین‌جا نگه دارید."
                      : "Keep class questions and files together in this chat."}
                  </div>
                )}
                {messages.map((message) => {
                  const mine = message.senderRole === role;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%] ${mine ? "rounded-br-sm bg-blue text-white" : "rounded-bl-sm border border-line bg-cream text-ink"}`}
                      >
                        {!mine && (
                          <div className="mb-1 text-[9px] font-semibold opacity-70">
                            {message.senderName}
                          </div>
                        )}
                        {message.content && (
                          <p className="m-0 whitespace-pre-wrap break-words text-[12px] leading-5">
                            {message.content}
                          </p>
                        )}
                        {message.attachments?.map((attachment) => (
                          <a
                            key={attachment}
                            href={attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 flex items-center gap-1.5 break-all text-[10px] underline"
                          >
                            <FileText size={13} />
                            {attachment.split("/").pop() ||
                              (fa ? "فایل پیوست" : "Attachment")}
                          </a>
                        ))}
                        <time
                          className={`mt-1 block text-[9px] opacity-65 ${mine ? "text-end" : ""}`}
                        >
                          {formatTime(message.createdAt, locale)}
                        </time>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              {error && (
                <p
                  role="alert"
                  className="mx-3 mb-0 rounded-lg bg-danger/10 p-2.5 text-[10.5px] text-danger sm:mx-5"
                >
                  {error}
                </p>
              )}
              <form
                onSubmit={(event) => void send(event)}
                className="shrink-0 border-t border-line p-3 sm:px-4"
              >
                {files.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {files.map((file, index) => (
                      <span
                        key={`${file.name}-${index}`}
                        className="inline-flex max-w-full items-center gap-1 rounded-lg bg-cream px-2 py-1 text-[9.5px]"
                      >
                        <FileText size={12} className="shrink-0 text-blue" />
                        <span className="max-w-40 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          aria-label={fa ? "حذف فایل" : "Remove file"}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {uploadProgress && (
                  <p className="mb-2 mt-0 text-[10px] text-blue">
                    {uploadProgress}
                  </p>
                )}
                <div className="flex items-end gap-2">
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || files.length >= MAX_CHAT_FILES}
                    aria-label={fa ? "پیوست فایل" : "Attach files"}
                    title={fa ? "پیوست فایل" : "Attach files"}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-muted hover:bg-cream disabled:opacity-50"
                  >
                    <Paperclip size={17} />
                  </button>
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    placeholder={
                      fa
                        ? "پیام بنویس… (Shift+Enter برای خط جدید)"
                        : "Write a message… (Shift+Enter for new line)"
                    }
                    className="max-h-28 min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[12px] outline-none focus:border-blue focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!draft.trim() && files.length === 0)}
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
                <p className="mb-0 mt-1.5 ps-12 text-[9px] text-muted">
                  {fa
                    ? "تا ۵ فایل، هرکدام حداکثر ۲۰ مگابایت"
                    : "Up to 5 files, 20 MB each"}
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue">
                <MessageCirclePlus size={25} />
              </div>
              <h2 className="mb-1 mt-0 text-[15px] font-semibold">
                {fa
                  ? "ارتباط با معلم، همین‌جا"
                  : "Talk to your teacher, right here"}
              </h2>
              <p className="mb-4 mt-0 max-w-sm text-[11.5px] leading-5 text-muted">
                {fa
                  ? "سؤال‌ها، پاسخ‌ها و فایل‌های تمرین در یک گفت‌وگوی امن می‌مانند؛ نیازی به جابه‌جایی بین برنامه‌ها نیست."
                  : "Keep class questions, replies, and exercise files in one secure conversation—no app switching needed."}
              </p>
              <button
                type="button"
                onClick={() => void startNewChat()}
                className="rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                {fa ? "شروع گفت‌وگوی جدید" : "Start a new chat"}
              </button>
              {error && (
                <p role="alert" className="mt-3 text-[11px] text-danger">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {showNewChat && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating)
              setShowNewChat(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-heading"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-5"
          >
            <header className="mb-4 flex items-center justify-between">
              <h2
                id="new-chat-heading"
                className="m-0 text-[16px] font-semibold"
              >
                {fa ? "گفت‌وگوی جدید" : "New conversation"}
              </h2>
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                aria-label={fa ? "بستن" : "Close"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream"
              >
                <X size={16} />
              </button>
            </header>
            {error && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-danger/10 p-2.5 text-[11px] text-danger"
              >
                {error}
              </p>
            )}
            {contactsLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-muted">
                <LoaderCircle className="animate-spin" size={16} />
                {fa ? "در حال یافتن معلمان…" : "Finding your teachers…"}
              </div>
            ) : (
              <>
                <label className="mb-2 block text-[11px] font-semibold">
                  {fa
                    ? "انتخاب معلم یا پشتیبانی"
                    : "Choose a teacher or support"}
                  <span className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                    <Search size={14} className="text-muted" />
                    <input
                      value={contactQuery}
                      onChange={(event) => setContactQuery(event.target.value)}
                      placeholder={
                        fa
                          ? "جستجو بر اساس نام یا دوره"
                          : "Search by name or course"
                      }
                      className="min-w-0 flex-1 text-[12px] outline-none"
                    />
                  </span>
                </label>
                <div className="mb-3 max-h-40 overflow-y-auto rounded-xl border border-line">
                  {filteredContacts.length ? (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className={`flex w-full items-center gap-2.5 border-b border-line px-3 py-2.5 text-start last:border-0 ${selectedContact?.id === contact.id ? "bg-blue/10" : "hover:bg-cream"}`}
                      >
                        <Image
                          src={contact.avatar || "/images/Teacher.jpeg"}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-semibold">
                            {contact.name}
                          </span>
                          <span className="block truncate text-[9.5px] text-muted">
                            {contact.courseTitle ||
                              (contact.role === "support"
                                ? fa
                                  ? "پشتیبانی"
                                  : "Support"
                                : fa
                                  ? "معلم"
                                  : "Teacher")}
                          </span>
                        </span>
                        <span className="text-[10px] text-blue">
                          {selectedContact?.id === contact.id ? "✓" : ""}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="m-0 p-4 text-center text-[11px] text-muted">
                      {fa
                        ? "مخاطبی پیدا نشد. اتصال API فهرست معلمان را بررسی کنید."
                        : "No contacts found. Check that the teacher contacts API is enabled."}
                    </p>
                  )}
                </div>
                <form
                  onSubmit={(event) => void createChat(event)}
                  className="space-y-2.5"
                >
                  <label className="block text-[11px] font-semibold">
                    {fa ? "موضوع (اختیاری)" : "Subject (optional)"}
                    <input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      maxLength={100}
                      placeholder={
                        selectedContact?.courseTitle ||
                        (fa
                          ? "مثلاً سؤال درباره تکلیف"
                          : "e.g. Question about an assignment")
                      }
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[11.5px] font-normal outline-none focus:border-blue"
                    />
                  </label>
                  <label className="block text-[11px] font-semibold">
                    {fa ? "پیام اول (اختیاری)" : "First message (optional)"}
                    <textarea
                      rows={3}
                      value={initialMessage}
                      onChange={(event) =>
                        setInitialMessage(event.target.value)
                      }
                      maxLength={2000}
                      placeholder={
                        fa
                          ? "سؤالت را همین حالا بنویس…"
                          : "Add context to your question…"
                      }
                      className="mt-1 w-full resize-y rounded-lg border border-line px-3 py-2 text-[11.5px] font-normal outline-none focus:border-blue"
                    />
                  </label>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewChat(false)}
                      className="rounded-lg border border-line px-3 py-2 text-[11px]"
                    >
                      {fa ? "لغو" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedContact || creating}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                    >
                      {creating && (
                        <LoaderCircle size={14} className="animate-spin" />
                      )}
                      {fa ? "شروع گفت‌وگو" : "Start chat"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
