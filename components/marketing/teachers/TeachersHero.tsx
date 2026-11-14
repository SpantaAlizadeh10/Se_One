"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Languages, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TeachersHero() {
  const { t, href } = useLanguage();
  const h = t("teachersPage.hero");
  const highlights = [
    { Icon: Languages, label: h.highlights.languages },
    { Icon: CalendarDays, label: h.highlights.schedule },
    { Icon: UserRound, label: h.highlights.profile },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-12 items-center">
        <div>
          <h1 className="font-serif text-[34px] sm:text-[46px] leading-[1.15] font-semibold mb-3">
            {h.title1} <span className="text-blue">{h.title2}</span> {h.title3}
          </h1>
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-6">{h.lead}</p>
          <Link
            href={href("/signup")}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {h.cta} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="relative flex h-[230px] items-center justify-center sm:h-[300px] md:h-[260px] lg:h-[300px]">
          <div className="absolute h-[220px] w-[220px] rounded-full bg-gradient-to-br from-[#E4ECFF] to-goldSoft sm:h-[280px] sm:w-[280px] md:h-[240px] md:w-[240px] lg:h-[280px] lg:w-[280px]" />
          <div className="relative flex h-[145px] w-[145px] items-center justify-center overflow-hidden rounded-full bg-white shadow-card sm:h-[170px] sm:w-[170px] md:h-[150px] md:w-[150px] lg:h-[170px] lg:w-[170px]">
            <Image
              src="/images/Student6.jpeg"
              alt=""
              fill
              sizes="(max-width: 640px) 145px, 170px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
        {highlights.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-line bg-white p-3 text-center shadow-card sm:min-h-28 sm:p-5"
          >
            <Icon size={20} className="mb-2 text-blue" aria-hidden="true" />
            <span className="text-[11px] font-semibold leading-snug text-ink sm:text-[12px]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
