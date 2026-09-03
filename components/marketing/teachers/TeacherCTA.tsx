"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TeacherCTA() {
  const { t, href } = useLanguage();
  const c = t("teachersPage.cta");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="bg-blue rounded-lg p-8 sm:p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-5">
          <GraduationCap size={26} className="text-white" />
        </div>
        <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold text-white mb-3">{c.title}</h2>
        <p className="text-white/85 text-[14px] max-w-[440px] mx-auto mb-7">{c.lead}</p>
        <Link
          href={href("/signup")}
          className="inline-flex items-center gap-2 bg-gold text-white px-7 py-3.5 rounded-full text-[14px] font-semibold hover:bg-goldDeep transition-colors"
        >
          {c.button}
        </Link>
      </div>
    </section>
  );
}
