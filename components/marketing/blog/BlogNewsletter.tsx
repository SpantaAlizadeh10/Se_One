"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useState } from "react";

export default function BlogNewsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setEmail("");
  };

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="bg-gradient-to-br from-blue to-blueDeep rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold text-white mb-4">
          {t("blog.newsletter.title")}
        </h2>
        <p className="text-blue-100 text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto mb-8">
          {t("blog.newsletter.lead")}
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("blog.newsletter.placeholder")}
              className="flex-1 px-5 py-3.5 rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-gold text-ink"
              required
            />
            <button
              type="submit"
              className="bg-gold text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-goldDeep transition-colors whitespace-nowrap"
            >
              {isSubmitted ? t("blog.newsletter.sent") : t("blog.newsletter.send")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}