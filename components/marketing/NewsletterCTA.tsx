"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NewsletterCTA() {
  const { t, href } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-[36px] bg-[#EDEAE0] px-6 py-12 text-center sm:rounded-[48px] sm:px-14 sm:py-16">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg">
          <MapPin size={22} className="text-white" aria-hidden="true" />
        </div>

        <h2 className="mb-2 font-serif text-[26px] font-semibold text-ink sm:text-[32px]">
          {t("home.newsletter.title")}
        </h2>
        <p className="mb-7 mx-auto max-w-[480px] text-[14px] text-ink70 sm:text-[15px]">
          {t("home.newsletter.lead")}
        </p>

        <Link
          href={href("/signup")}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-goldDeep px-8 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#644400]"
        >
          {t("home.newsletter.cta")}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
