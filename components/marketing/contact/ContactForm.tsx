"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { submitContactForm } from "@/lib/api/support";

export default function ContactForm() {
  const { t, lang } = useLanguage();
  const f = t("contact.form");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setError("");
    setSent(false);

    try {
      await submitContactForm({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        subject:
          String(formData.get("subject") || "").trim() ||
          (lang === "fa" ? "پیام از فرم تماس" : "Contact form message"),
        message: String(formData.get("message") || "").trim(),
      });
      form.reset();
      setSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : lang === "fa"
            ? "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید."
            : "Your message could not be sent. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full border border-line bg-white rounded-2xl px-5 py-3.5 text-[14px] outline-none focus:border-blue transition-colors placeholder:text-muted";

  return (
    <section className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold mb-2">
        {f.heading}
      </h2>
      <div className="w-16 h-[3px] bg-gold rounded mb-7" />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            type="text"
            required
            placeholder={f.name}
            className={fieldClass}
          />
          <input
            name="email"
            type="email"
            required
            placeholder={f.email}
            className={fieldClass}
          />
        </div>
        <input
          name="subject"
          type="text"
          placeholder={f.subject}
          className={fieldClass}
        />
        <textarea
          name="message"
          required
          placeholder={f.message}
          rows={6}
          className={`${fieldClass} resize-y`}
        />
        {(error || sent) && (
          <p
            role={error ? "alert" : "status"}
            aria-live="polite"
            className={`m-0 text-[13px] ${error ? "text-danger" : "text-sageDeep"}`}
          >
            {error || f.sent}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue text-white rounded-full py-4 text-[14.5px] font-bold flex items-center justify-center gap-2 hover:bg-blueDeep transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? lang === "fa"
              ? "در حال ارسال…"
              : "Sending…"
            : f.send}
          {!isSubmitting && <ArrowRight size={15} className="rtl:rotate-180" />}
        </button>
      </form>
    </section>
  );
}
