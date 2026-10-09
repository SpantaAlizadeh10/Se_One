"use client";

import { Award, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";

export default function MilestoneBanner() {
  const { lang, href } = useLanguage();
  const { isChildMode } = useStudentExperience();
  const fa = lang === "fa";
  if (isChildMode) {
    return (
      <div className="mb-7 grid grid-cols-1 items-center gap-4 rounded-2xl border border-[#F2D9A0] bg-gradient-to-br from-[#FFF0C8] via-[#FFF9E9] to-[#E8F6EF] p-5 shadow-card sm:grid-cols-[1fr_auto] sm:p-7">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-goldDeep shadow-sm">
            <BookOpen size={19} />
          </div>
          <h3 className="mb-1 mt-0 text-[22px] font-bold">
            {fa
              ? "یک قدم دیگه تا قهرمانی!"
              : "One more step to a learning win!"}
          </h3>
          <p className="mb-0 mt-2 max-w-lg text-[13px] leading-6 text-ink70">
            {fa
              ? "یک درس یا تمرین کوتاه انتخاب کن؛ هر بار که ادامه می‌دهی، قوی‌تر می‌شوی."
              : "Choose a lesson or a quick practice. Every small step helps you grow."}
          </p>
        </div>
        <Link
          href={href("/dashboard/practice")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#375C9A] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#284778]"
        >
          {fa ? "بزن بریم تمرین!" : "Let’s practice!"}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    );
  }
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.75; // 4 of 5 documents

  return (
    <div className="bg-gradient-to-br from-peach to-[#FCF3E7] rounded-lg px-5 py-6 sm:px-8 sm:py-7 mb-7 shadow-card grid grid-cols-1 md:grid-cols-[1.3fr_auto_1fr] items-center gap-5">
      <div>
        <div className="w-[38px] h-[38px] rounded-full bg-ink flex items-center justify-center text-gold mb-3.5">
          <Award size={18} />
        </div>
        <h3 className="font-serif text-[24px] font-semibold leading-tight mb-2">
          Next milestone
        </h3>
        <p className="text-ink70 text-[14.5px] max-w-[340px] mb-4">
          Upload 1 more document to raise your earnings potential and unlock the
          next tier.
        </p>
        <button className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep hover:-translate-y-px transition-all">
          Continue learning
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="w-[112px] h-[112px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#F3E4C2_70%)] flex items-center justify-center ring-1 ring-inset ring-gold/25 mx-auto">
        <svg
          width="96"
          height="96"
          viewBox="0 0 112 112"
          className="-rotate-90"
        >
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#fff"
            strokeWidth="9"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#A67A1E"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
      </div>

      <div className="bg-white rounded-md p-5 h-full flex flex-col justify-center border border-gold/20">
        <div className="font-serif text-[30px] font-semibold text-ink">
          4 / 5
        </div>
        <div className="text-[12px] text-muted mt-0.5">Documents uploaded</div>
        <div className="mt-3.5 pt-3.5 border-t border-dashed border-line text-[12.5px] font-semibold text-sageDeep flex items-center gap-1.5">
          <ArrowRight size={13} />
          +$49 on next upload
        </div>
      </div>
    </div>
  );
}
