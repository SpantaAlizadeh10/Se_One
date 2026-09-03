"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { teacherDirectory } from "@/lib/teachers-directory";

export default function InstructorsList() {
  const { t, href } = useLanguage();
  const p = t("instructorsPage");

  return (
    <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="text-center max-w-[560px] mx-auto mb-10">
        <h1 className="font-serif text-[28px] sm:text-[34px] font-semibold mb-3">{p.heading}</h1>
        <p className="text-ink70 text-[14.5px] leading-relaxed">{p.lead}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-14">
        {teacherDirectory.map((tc) => (
          <div key={tc.id} className="bg-white border border-line rounded-lg shadow-card p-5 text-center">
            <Image src={tc.avatar} alt={tc.name} width={72} height={72} className="rounded-full object-cover mx-auto mb-4" />
            <h3 className="text-[14.5px] font-semibold mb-1">{tc.name}</h3>
            <div className="text-[12px] text-muted mb-2">{tc.subject}</div>
            <div className="flex items-center justify-center gap-1 mb-3">
              <Star size={13} className="text-gold" fill="currentColor" />
              <span className="text-[12.5px] font-semibold">{tc.rating.toFixed(1)}</span>
            </div>
            <p className="text-[12px] text-ink70 leading-relaxed">{tc.bio}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue rounded-lg p-8 sm:p-10 text-center">
        <h2 className="font-serif text-[20px] sm:text-[22px] font-semibold text-white mb-5">{p.ctaTitle}</h2>
        <Link
          href={href("/teachers")}
          className="inline-flex items-center gap-2 bg-gold text-white px-7 py-3.5 rounded-full text-[14px] font-semibold hover:bg-goldDeep transition-colors"
        >
          {p.ctaButton} <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </main>
  );
}
