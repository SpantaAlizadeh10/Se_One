"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Languages,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TeacherProfile } from "@/lib/teachers-directory";

export default function TeacherCard({
  teacher,
  compact = false,
}: {
  teacher: TeacherProfile;
  compact?: boolean;
}) {
  const { href, t } = useLanguage();
  const labels = t("instructorsPage");
  const copy = labels.teacherCopy[teacher.id] ?? {
    name: teacher.name,
    subject: teacher.subject,
    bio: teacher.bio,
  };
  const availableSlots = teacher.slots.filter((slot) => !slot.booked).length;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover ${compact ? "" : "h-full"}`}
    >
      <div className="relative h-[208px] overflow-hidden bg-gradient-to-br from-[#DCEFED] via-[#C7E1DE] to-[#A9CFC9]">
        <div className="absolute -end-10 -top-14 h-44 w-44 rounded-full border-[18px] border-white/25" />
        <div className="absolute -bottom-16 -start-8 h-36 w-36 rounded-full bg-gold/20" />
        <img
          src={teacher.avatar}
          alt={copy.name}
          width={196}
          height={196}
          className="absolute bottom-[-8px] left-1/2 h-[196px] w-[196px] -translate-x-1/2 rounded-full border-4 border-white object-cover object-center shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute start-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-sageDeep shadow-sm">
          <CheckCircle2 size={12} /> {labels.verified}
        </span>
        <span className="absolute end-4 top-4 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold text-white">
          <Star size={11} fill="currentColor" className="text-gold" />{" "}
          {teacher.rating.toFixed(1)}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-bold text-ink">{copy.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <p className="text-[12px] font-medium text-blue">
                {copy.subject}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-bold text-blue">
                <Languages size={11} />{" "}
                {labels.languages[teacher.teachingLanguage]}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-ink70">
            {teacher.level}
          </span>
        </div>
        <p className="mb-4 line-clamp-2 text-[12.5px] leading-relaxed text-ink70">
          {copy.bio}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sageDeep">
            <CalendarDays size={13} />
            {availableSlots} {labels.slotsAvailable}
          </span>
          {!compact && (
            <Link
              href={href(`/dashboard/teachers?teacher=${teacher.id}`)}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-blue hover:text-blueDeep"
            >
              {labels.viewProfile}{" "}
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
