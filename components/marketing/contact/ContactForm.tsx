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
          (lang === "fa" ? "پیام از صفحهٔ تماس با ما" : "Contact form message"),
        message: String(formData.get("message") || "").trim(),
      });
      form.reset();
      setSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : lang === "fa"
            ? "پیامتان ارسال نشد. لطفاً دوباره تلاش کنید."
            : "Your message could not be sent. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full border border-line bg-white rounded-2xl px-5 py-3.5 text-[14px] outline-none focus:border-blue transition-colors placeholder:text-muted/60";

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-3">
        <div className="text-center sm:text-start">
          <h2 className="mb-2 font-serif text-[26px] font-semibold sm:text-[28px]">
            {f.heading}
          </h2>
          <div className="mx-auto mb-4 h-[3px] w-16 rounded bg-gold sm:mx-0" />
        </div>

        <form
          onSubmit={submit}
          aria-busy={isSubmitting}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6 md:p-7"
        >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label
            htmlFor="contact-name"
            className="flex flex-col gap-2 text-start text-[13px] font-semibold text-ink"
          >
            {f.name}
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder={f.name}
              className={fieldClass}
            />
          </label>
          <label
            htmlFor="contact-email"
            className="flex flex-col gap-2 text-start text-[13px] font-semibold text-ink"
          >
            {f.email}
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              dir={lang === "fa" ? "rtl" : "ltr"}
              className={`${fieldClass} text-start`}
              placeholder={f.email}
            />
          </label>
        </div>
        <label
          htmlFor="contact-subject"
          className="flex flex-col gap-2 text-start text-[13px] font-semibold text-ink"
        >
          {f.subject}
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder={f.subject}
            className={fieldClass}
          />
        </label>
        <label
          htmlFor="contact-message"
          className="flex flex-col gap-2 text-start text-[13px] font-semibold text-ink"
        >
          {f.message}
          <textarea
            id="contact-message"
            name="message"
            required
            placeholder={f.message}
            rows={6}
            className={`${fieldClass} resize-y`}
          />
        </label>
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
          aria-busy={isSubmitting}
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
      </div>
    </section>
  );
}
