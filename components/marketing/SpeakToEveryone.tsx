"use client";

import { Check, ArrowRight, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function SpeakToEveryone() {
  const { t } = useLanguage();
  const checklist: string[] = t("home.speak.checklist");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative h-[260px] sm:h-[320px] rounded-[40px] overflow-hidden order-2 lg:order-1">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/Seone.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="font-serif text-[26px] sm:text-[32px] font-semibold mb-4 leading-tight">
            <span className="text-goldDeep">{t("home.speak.titleGold")}</span>{" "}
            {t("home.speak.titleRest")}
          </h2>
          <p className="text-ink70 text-[14.5px] leading-relaxed max-w-[440px] mb-6">
            {t("home.speak.lead")}
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 mb-7 max-w-[380px]">
            {checklist.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[13.5px] font-medium text-ink70"
              >
                <span className="w-5 h-5 rounded-full bg-blue text-white flex items-center justify-center shrink-0">
                  <Check size={12} />
                </span>
                {item}
              </div>
            ))}
          </div>

          <a
            href="#courses"
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {t("common.exploreCourses")}{" "}
            <ArrowRight size={15} className="rtl:rotate-180" />
          </a>
        </div>
      </div>
    </section>
  );
}
