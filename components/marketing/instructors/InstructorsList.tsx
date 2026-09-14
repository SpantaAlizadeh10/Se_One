"use client";

import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTeachers } from "@/lib/use-teachers";
import TeacherCard from "./TeacherCard";

export default function InstructorsList() {
  const { t, href } = useLanguage();
  const p = t("instructorsPage");
  const { teachers } = useTeachers();

  return (
    <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="text-center max-w-[600px] mx-auto mb-10">
        <h1 className="font-serif text-[28px] sm:text-[34px] font-semibold mb-3">
          {p.heading}
        </h1>
        <p className="text-ink70 text-[14.5px] leading-relaxed">{p.lead}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-ink70 shadow-card">
          <SlidersHorizontal size={14} className="text-blue" />
          {teachers.length} {p.directoryCount}
        </div>
        <p className="text-[12px] text-muted">{p.directoryHint}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-14">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>

      <div className="bg-blue rounded-lg p-8 sm:p-10 text-center">
        <h2 className="font-serif text-[20px] sm:text-[22px] font-semibold text-white mb-5">
          {p.ctaTitle}
        </h2>
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
