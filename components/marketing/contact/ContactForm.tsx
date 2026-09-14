"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ContactForm() {
  const { t } = useLanguage();
  const f = t("contact.form");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const fieldClass =
    "w-full border border-line bg-white rounded-2xl px-5 py-3.5 text-[14px] outline-none focus:border-blue transition-colors placeholder:text-muted";

  return (
    <section className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold mb-2">{f.heading}</h2>
      <div className="w-16 h-[3px] bg-gold rounded mb-7" />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" required placeholder={f.name} className={fieldClass} />
          <input type="email" required placeholder={f.email} className={fieldClass} />
        </div>
        <input type="text" placeholder={f.subject} className={fieldClass} />
        <textarea required placeholder={f.message} rows={6} className={`${fieldClass} resize-y`} />
        <button
          type="submit"
          className="w-full bg-blue text-white rounded-full py-4 text-[14.5px] font-bold flex items-center justify-center gap-2 hover:bg-blueDeep transition-colors"
        >
          {sent ? f.sent : f.send}
          {!sent && <ArrowRight size={15} className="rtl:rotate-180" />}
        </button>
      </form>
    </section>
  );
}
