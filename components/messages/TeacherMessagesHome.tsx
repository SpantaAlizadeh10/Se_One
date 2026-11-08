"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import MessagesHub from "@/components/messages/MessagesHub";
import TeacherGroupChat from "@/components/messages/TeacherGroupChat";

type TeacherMessagesView = "students" | "teachers" | null;

export default function TeacherMessagesHome() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [view, setView] = useState<TeacherMessagesView>(null);

  if (view === "teachers" || view === "students") {
    return (
      <section>
        <button
          type="button"
          onClick={() => setView(null)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink70 hover:bg-surface"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {fa ? "بازگشت به پیام‌ها" : "Back to messages"}
        </button>
        {view === "teachers" ? <TeacherGroupChat /> : <MessagesHub />}
      </section>
    );
  }

  return (
    <section>
      <header className="mb-5">
        <h1 className="m-0 text-xl font-bold">
          {fa ? "پیام‌ها" : "Messages"}
        </h1>
        <p className="mb-0 mt-1 text-sm text-muted">
          {fa
            ? "نوع گفت‌وگویی را که می‌خواهید باز کنید انتخاب کنید."
            : "Choose which conversation you want to open."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setView("teachers")}
          className="flex min-h-36 items-start gap-4 rounded-2xl border border-line bg-white p-5 text-start shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-cardHover"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
            <Users size={21} />
          </span>
          <span>
            <span className="block text-base font-semibold">
              {fa ? "گفت‌وگوی گروهی معلمان" : "Teacher group chat"}
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted">
              {fa
                ? "گفت‌وگوی مشترک معلمان تأییدشده و مدیران"
                : "Shared chat for approved teachers and admins"}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView("students")}
          className="flex min-h-36 items-start gap-4 rounded-2xl border border-line bg-white p-5 text-start shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-cardHover"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage/15 text-sageDeep">
            <MessageCircle size={21} />
          </span>
          <span>
            <span className="block text-base font-semibold">
              {fa ? "گفت‌وگو با دانش‌آموزان" : "Chats with students"}
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted">
              {fa
                ? "مشاهده و ادامهٔ پیام‌های خصوصی معلم و دانش‌آموز"
                : "View and continue your teacher–student conversations"}
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
