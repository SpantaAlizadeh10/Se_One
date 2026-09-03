"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JourneyBanner() {
  const { t, href } = useLanguage();
  const j = t("coursesPage.journey");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="bg-blue rounded-lg p-5 flex items-center gap-6 flex-wrap">
        <div className="w-[170px] h-[130px] rounded-2xl bg-gradient-to-br from-[#F0D97A] to-[#E8AE85] flex items-center justify-center shrink-0">
          <Users size={54} className="text-ink" strokeWidth={1.4} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-white text-[21px] font-semibold mb-2">{j.title}</h3>
          <p className="text-white/85 text-[13px] leading-relaxed">{j.lead}</p>
        </div>
        <Link
          href={href("/signup")}
          className="bg-white text-ink rounded-full px-7 py-3.5 text-[13.5px] font-bold whitespace-nowrap hover:bg-cream transition-colors shrink-0"
        >
          {j.cta}
        </Link>
      </div>
    </section>
  );
}
