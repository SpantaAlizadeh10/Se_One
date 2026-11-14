"use client";

import {
  BookOpenCheck,
  Brain,
  Headphones,
  Mic2,
  PenLine,
  SpellCheck,
  Volume2,
} from "lucide-react";

export type PracticeSkill =
  | "all"
  | "speaking"
  | "listening"
  | "reading"
  | "writing"
  | "grammar"
  | "vocabulary";

const skills = [
  {
    id: "speaking",
    en: "Speaking",
    fa: "مکالمه",
    descriptionEn: "Practice expressing ideas and speaking with confidence.",
    descriptionFa: "بیان ایده‌ها و صحبت‌کردن با اعتمادبه‌نفس را تمرین کن.",
    Icon: Mic2,
    tone: "bg-[#E8EEFF] text-blue",
    glow: "group-hover:border-blue/40",
  },
  {
    id: "listening",
    en: "Listening",
    fa: "شنیداری",
    descriptionEn: "Build listening comprehension with focused exercises.",
    descriptionFa: "درک شنیداری را با تمرین‌های هدفمند تقویت کن.",
    Icon: Headphones,
    tone: "bg-[#E5F4ED] text-sageDeep",
    glow: "group-hover:border-sageDeep/35",
  },
  {
    id: "reading",
    en: "Reading",
    fa: "خواندن",
    descriptionEn: "Improve comprehension, context, and reading fluency.",
    descriptionFa: "درک مطلب، فهم بافت و روان‌خوانی را بهتر کن.",
    Icon: BookOpenCheck,
    tone: "bg-[#F1EAFE] text-[#7653B5]",
    glow: "group-hover:border-[#7653B5]/35",
  },
  {
    id: "writing",
    en: "Writing",
    fa: "نوشتن",
    descriptionEn: "Develop clearer sentences and stronger written ideas.",
    descriptionFa: "جمله‌های روشن‌تر و ایده‌های نوشتاری قوی‌تر بساز.",
    Icon: PenLine,
    tone: "bg-[#FFF0E6] text-peachDeep",
    glow: "group-hover:border-peachDeep/35",
  },
  {
    id: "grammar",
    en: "Grammar",
    fa: "گرامر",
    descriptionEn: "Practice grammar patterns and use them in context.",
    descriptionFa: "ساختارهای گرامری را در جمله و بافت واقعی تمرین کن.",
    Icon: SpellCheck,
    tone: "bg-[#E8F4F7] text-[#28788B]",
    glow: "group-hover:border-[#28788B]/35",
  },
  {
    id: "vocabulary",
    en: "Vocabulary",
    fa: "واژگان",
    descriptionEn: "Grow your vocabulary and use new words naturally.",
    descriptionFa: "دایره واژگان را گسترش بده و واژه‌های تازه را به‌کار ببر.",
    Icon: Volume2,
    tone: "bg-[#FFF4D9] text-goldDeep",
    glow: "group-hover:border-goldDeep/35",
  },
] as const;

export default function SkillGrid({
  lang,
  activeSkill,
  onSelect,
}: {
  lang: string;
  activeSkill: PracticeSkill;
  onSelect: (skill: PracticeSkill) => void;
}) {
  const fa = lang === "fa";
  return (
    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button
        type="button"
        aria-pressed={activeSkill === "all"}
        onClick={() => onSelect("all")}
        className={`group flex min-h-40 flex-col rounded-2xl border bg-white p-4 text-start shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover ${
          activeSkill === "all"
            ? "border-blue ring-2 ring-blue/10"
            : "border-line"
        }`}
      >
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EEFF] text-blue">
          <Brain size={21} />
        </span>
        <span className="text-[15px] font-semibold">
          {fa ? "همه مهارت‌ها" : "All skills"}
        </span>
        <span className="mt-1 text-[12px] leading-5 text-muted">
          {fa
            ? "تمام تمرین‌های در دسترس را ببین و انتخاب کن."
            : "Browse and choose from all available exercises."}
        </span>
        <span className="mt-auto pt-3 text-[11px] font-semibold text-blue">
          {fa ? "همه باز هستند" : "All areas open"}
        </span>
      </button>

      {skills.map((skill) => {
        const selected = activeSkill === skill.id;
        return (
          <button
            type="button"
            key={skill.id}
            aria-pressed={selected}
            onClick={() => onSelect(skill.id)}
            className={`group flex min-h-40 flex-col rounded-2xl border bg-white p-4 text-start shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover ${skill.glow} ${
              selected ? "border-blue ring-2 ring-blue/10" : "border-line"
            }`}
          >
            <span
              className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${skill.tone}`}
            >
              <skill.Icon size={21} />
            </span>
            <span className="text-[15px] font-semibold">
              {fa ? skill.fa : skill.en}
            </span>
            <span className="mt-1 text-[12px] leading-5 text-muted">
              {fa ? skill.descriptionFa : skill.descriptionEn}
            </span>
            <span className="mt-auto pt-3 text-[11px] font-semibold text-blue">
              {fa ? "باز · مشاهده تمرین‌ها" : "Open · View exercises"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
