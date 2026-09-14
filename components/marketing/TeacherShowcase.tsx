"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTeachers } from "@/lib/use-teachers";
import TeacherCard from "./instructors/TeacherCard";

export default function TeacherShowcase() {
  const { t, href } = useLanguage();
  const section = t("home.instructors");
  const { teachers } = useTeachers();

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-goldDeep">
            <Sparkles size={13} /> {section.eyebrow}
          </div>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-2 relative inline-block after:content-[''] after:absolute after:start-0 after:-bottom-2 after:w-16 after:h-[3px] after:bg-gold after:rounded">
            {section.heading}
          </h2>
          <p className="mt-3 max-w-[480px] text-[14px] text-ink70">
            {section.sub}
          </p>
        </div>
        <Link
          href={href("/our-instructors")}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-[13px] font-semibold text-ink hover:border-ink transition-colors"
        >
          {section.viewAll} <ArrowRight size={14} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 thin-scroll sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="w-[250px] min-w-[250px] shrink-0 snap-start sm:w-auto sm:min-w-0 sm:shrink"
          >
            <TeacherCard teacher={teacher} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
