"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function OurStory() {
  const { t, href } = useLanguage();
  const s = t("about.story");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="h-[260px] sm:h-[300px] rounded-[58%_42%_53%_47%/55%_48%_52%_45%] bg-sageDeep flex items-center justify-center">
          <Users size={110} className="text-white/95" strokeWidth={1.3} />
        </div>
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-4">
            {s.titleOur} <span className="text-goldDeep">{s.titleGold}</span>
          </h2>
          <p className="text-ink70 text-[14.5px] leading-[1.8] max-w-[440px] mb-6">{s.lead}</p>
          <Link
            href={href("/courses")}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {s.cta} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
