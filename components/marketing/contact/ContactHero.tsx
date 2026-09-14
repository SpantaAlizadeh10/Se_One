"use client";

import { Phone, Mail, MapPin, ArrowRight, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ContactHero() {
  const { t } = useLanguage();
  const c = t("contact.hero");
  const levels: string[] = t("home.levels");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[34px] sm:text-[46px] leading-[1.15] font-semibold mb-1">
            {c.title1}
            <br />
            <span className="text-blue">{c.title2}</span>
          </h1>
          <div className="w-[74px] h-[3px] bg-gold rounded my-5" />
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-6">{c.lead}</p>

          <div className="flex flex-wrap gap-3 mb-7">
            <div className="flex items-center gap-2.5 bg-[#EDEAE0] rounded-full px-6 py-2.5 text-[13px] font-semibold text-ink70">
              <Phone size={15} className="text-blue" /> {c.phone}
            </div>
            <div className="flex items-center gap-2.5 bg-[#EDEAE0] rounded-full px-6 py-2.5 text-[13px] font-semibold text-ink70">
              <Mail size={15} className="text-blue" /> {c.email}
            </div>
            <div className="flex items-center gap-2.5 bg-[#EDEAE0] rounded-full px-6 py-2.5 text-[13px] font-semibold text-ink70">
              <MapPin size={15} className="text-blue" /> {c.place}
            </div>
          </div>

          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {c.call} <ArrowRight size={15} className="rtl:rotate-180" />
          </a>
        </div>

        <div className="relative h-[280px] sm:h-[320px] flex items-center justify-center">
          <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-[44%_56%_60%_40%/50%_45%_55%_50%] bg-gradient-to-br from-goldSoft to-peach" />
          <div className="relative w-[220px] h-[170px] bg-sage rounded-[22px] shadow-card flex items-center justify-center -rotate-2 overflow-hidden">
            <img src="/images/A.png" alt="Contact" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white border border-line rounded-full shadow-card flex flex-wrap justify-center sm:justify-between px-3 py-2 gap-1">
        {levels.map((level) => (
          <div key={level} className="px-5 sm:px-7 py-2.5 text-[13.5px] font-semibold rounded-full text-center flex-1 text-ink70">
            {level}
          </div>
        ))}
      </div>
    </section>
  );
}
