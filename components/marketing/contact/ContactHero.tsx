"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ContactHero() {
  const { t } = useLanguage();
  const c = t("contact.hero");

  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 sm:pt-16 md:pt-12">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="text-center sm:text-start">
          <h1 className="font-serif text-[32px] font-semibold leading-[1.15] sm:text-[46px]">
            {c.title1}
            <br />
            <span className="text-blue">{c.title2}</span>
          </h1>
          <div className="mx-auto my-4 h-[3px] w-[74px] rounded bg-gold sm:mx-0" />
          <p className="mx-auto mb-6 max-w-[460px] text-[15px] leading-relaxed text-ink70 sm:mx-0 sm:text-[16px]">
            {c.lead}
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <div className="flex min-h-11 max-w-full items-center gap-2.5 rounded-full bg-[#EDEAE0] px-4 py-2.5 text-[13px] font-semibold text-ink70 sm:px-6">
              <Phone size={15} className="text-blue" /> {c.phone}
            </div>
            <div className="flex min-h-11 max-w-full items-center gap-2.5 break-all rounded-full bg-[#EDEAE0] px-4 py-2.5 text-[13px] font-semibold text-ink70 sm:px-6">
              <Mail size={15} className="text-blue" /> {c.email}
            </div>
            <div className="flex min-h-11 max-w-full items-center gap-2.5 rounded-full bg-[#EDEAE0] px-4 py-2.5 text-[13px] font-semibold text-ink70 sm:px-6">
              <MapPin size={15} className="text-blue" /> {c.place}
            </div>
          </div>

          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-blue px-6 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-blueDeep sm:mx-0"
          >
            {c.call} <ArrowRight size={15} className="rtl:rotate-180" />
          </a>
        </div>

        <div className="relative flex h-[230px] items-center justify-center sm:h-[320px] md:h-[270px] lg:h-[320px]">
          <div className="absolute h-[220px] w-[220px] rounded-[44%_56%_60%_40%/50%_45%_55%_50%] bg-gradient-to-br from-goldSoft to-peach sm:h-[300px] sm:w-[300px] md:h-[250px] md:w-[250px] lg:h-[300px] lg:w-[300px]" />
          <div className="relative flex h-[160px] w-[210px] -rotate-2 items-center justify-center overflow-hidden rounded-[22px] bg-sage shadow-card sm:h-[200px] sm:w-[260px] md:h-[170px] md:w-[220px] lg:h-[200px] lg:w-[260px]">
            <Image
              src="/images/A.png"
              alt=""
              fill
              sizes="(max-width: 640px) 210px, 260px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
