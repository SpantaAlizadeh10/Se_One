"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NewsletterCTA() {
  const { t, href } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="relative bg-blue rounded-[36px] sm:rounded-[48px] px-6 sm:px-14 pt-24 pb-10 sm:py-16 text-center overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg">
          <MapPin size={22} className="text-white" />
        </div>

        <h2 className="font-serif text-[26px] sm:text-[32px] font-semibold text-white mb-3">
          {t("home.newsletter.title")}
        </h2>
        <p className="text-white/85 text-[14px] sm:text-[15px] max-w-[480px] mx-auto mb-6">
          {t("home.newsletter.lead")}
        </p>

        <Link
          href={href("/signup")}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-goldDeep"
        >
          {t("home.newsletter.cta")}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
