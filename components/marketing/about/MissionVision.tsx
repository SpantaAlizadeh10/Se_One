"use client";

import { Shield, User, BookOpen, Users, GraduationCap, ChevronRight, MapPin, Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function MissionVision() {
  const { t } = useLanguage();
  const m = t("about.mission");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <span className="block text-center text-goldDeep font-bold text-[13px] underline underline-offset-4 mb-2.5">
        {m.eyebrow}
      </span>
      <div className="text-center max-w-[620px] mx-auto mb-10">
        <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-3.5">
          {m.prefix && <>{m.prefix} </>}
          <span className="text-goldDeep">{m.part1}</span> {m.mid} <span className="text-goldDeep">{m.part2}</span>
          {m.suffix && <> {m.suffix}</>}
        </h2>
        <p className="text-ink70 text-[14.5px] leading-relaxed">{m.lead}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_64px_1fr] items-stretch">
        <div className="bg-white rounded-lg shadow-card p-7 sm:p-8">
          <div className="flex items-center gap-4 mb-3.5">
            <div className="w-[46px] h-[46px] rounded-full bg-blue text-white flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <h3 className="text-[19px] font-semibold underline underline-offset-4">{m.missionTitle}</h3>
          </div>
          <p className="text-[13.5px] text-ink70 leading-relaxed mb-4.5">{m.missionDesc}</p>
          <div className="border-t border-line mb-4.5" />
          <div className="flex gap-3 mb-4">
            <div className="w-[38px] h-[38px] rounded-full bg-[#E4ECFF] text-blue flex items-center justify-center shrink-0">
              <User size={17} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5">{m.studentCentered.title}</h4>
              <p className="text-[12.5px] text-ink70 leading-snug">{m.studentCentered.desc}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-[#E4ECFF] text-blue flex items-center justify-center shrink-0">
              <BookOpen size={17} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5">{m.practicalLearning.title}</h4>
              <p className="text-[12.5px] text-ink70 leading-snug">{m.practicalLearning.desc}</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center py-5">
          <div className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center shrink-0">
            <MapPin size={14} />
          </div>
          <div className="flex-1 w-0 border-s-2 border-dashed border-line my-3" />
          <div className="w-[30px] h-[30px] rounded-full bg-white border border-line flex items-center justify-center text-ink70 shrink-0">
            <ChevronRight size={14} />
          </div>
          <div className="flex-1 w-0 border-s-2 border-dashed border-line my-3" />
          <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center shrink-0">
            <Leaf size={14} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-7 sm:p-8 mt-5 lg:mt-0">
          <div className="flex items-center gap-4 mb-3.5">
            <div className="w-[46px] h-[46px] rounded-full bg-gold text-white flex items-center justify-center shrink-0">
              <Leaf size={20} />
            </div>
            <h3 className="text-[19px] font-semibold underline underline-offset-4">{m.visionTitle}</h3>
          </div>
          <p className="text-[13.5px] text-ink70 leading-relaxed mb-4.5">{m.visionDesc}</p>
          <div className="border-t border-line mb-4.5" />
          <div className="flex gap-3 mb-4">
            <div className="w-[38px] h-[38px] rounded-full bg-goldSoft text-goldDeep flex items-center justify-center shrink-0">
              <Users size={17} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5">{m.globalCommunity.title}</h4>
              <p className="text-[12.5px] text-ink70 leading-snug">{m.globalCommunity.desc}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-goldSoft text-goldDeep flex items-center justify-center shrink-0">
              <GraduationCap size={17} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold mb-0.5">{m.accessibleEducation.title}</h4>
              <p className="text-[12.5px] text-ink70 leading-snug">{m.accessibleEducation.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
