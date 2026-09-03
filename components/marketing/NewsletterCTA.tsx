"use client";

import { useState } from "react";
import { MapPin, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NewsletterCTA() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="relative bg-blue rounded-[36px] sm:rounded-[48px] px-6 sm:px-14 py-12 sm:py-16 text-center overflow-hidden">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg">
          <MapPin size={22} className="text-white" />
        </div>

        <h2 className="font-serif text-[26px] sm:text-[32px] font-semibold text-white mb-3 mt-6">{t("home.newsletter.title")}</h2>
        <p className="text-white/85 text-[14px] sm:text-[15px] max-w-[480px] mx-auto mb-8">{t("home.newsletter.lead")}</p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-[460px] mx-auto">
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("home.newsletter.placeholder")}
            className="flex-1 min-w-0 bg-white rounded-full px-5 py-3.5 text-[14px] outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="bg-gold text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-goldDeep transition-colors inline-flex items-center justify-center gap-2 shrink-0"
          >
            {sent ? t("home.newsletter.sent") : t("home.newsletter.send")}
            {!sent && <Send size={14} />}
          </button>
        </form>
      </div>
    </section>
  );
}
