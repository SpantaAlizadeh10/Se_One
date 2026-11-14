"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  Mic,
  BookOpen,
  PenLine,
  Clock,
  LoaderCircle,
  Headphones,
  BookOpenCheck,
  SpellCheck,
  Volume2,
} from "lucide-react";
import { getPracticeContent, type PracticeContent } from "@/lib/api/practice";
import type { PracticeSkill } from "./SkillGrid";

const kindStyles = {
  speak: { bg: "bg-[#E4ECFF]", text: "text-blue", Icon: Mic },
  listen: { bg: "bg-sage", text: "text-sageDeep", Icon: Headphones },
  read: { bg: "bg-[#F1EAFE]", text: "text-[#7653B5]", Icon: BookOpenCheck },
  grammar: { bg: "bg-sage", text: "text-sageDeep", Icon: BookOpen },
  vocabulary: { bg: "bg-[#FFF4D9]", text: "text-goldDeep", Icon: Volume2 },
  write: { bg: "bg-goldSoft", text: "text-goldDeep", Icon: PenLine },
} as const;

function getPracticeSkill(item: PracticeContent): Exclude<PracticeSkill, "all"> | null {
  const text = `${item.category} ${item.title} ${item.description}`.toLowerCase();
  if (/vocab|word bank|flashcard|واژگان|لغت/.test(text)) return "vocabulary";
  if (/grammar|tense|sentence structure|گرامر|دستور زبان/.test(text))
    return "grammar";
  if (
    item.questions.some((question) => question.type === "listening") ||
    /listen|audio|listening|شنیداری|شنیدن/.test(text)
  )
    return "listening";
  if (
    /speak|speaking|pronunciation|conversation|مکالمه|گفتار/.test(text)
  )
    return "speaking";
  if (/read|reading|comprehension|درک مطلب|خواندن/.test(text))
    return "reading";
  if (/write|writing|written|essay|paragraph|نوشتن/.test(text))
    return "writing";
  return null;
}

export default function PracticeList({ skill }: { skill: PracticeSkill }) {
  const { href, lang } = useLanguage();
  const fa = lang === "fa";
  const [practiceItems, setPracticeItems] = useState<PracticeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getPracticeContent()
      .then((items) => {
        if (active) setPracticeItems(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleItems =
    skill === "all"
      ? practiceItems
      : practiceItems.filter((item) => getPracticeSkill(item) === skill);

  return (
    <div
      id="recommended-exercises"
      className="bg-white border border-line rounded-lg shadow-card px-4"
    >
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-muted">
          <LoaderCircle size={16} className="animate-spin" />
          {fa ? "در حال بارگذاری تمرین‌ها…" : "Loading exercises…"}
        </div>
      )}
      {!loading && error && (
        <p role="alert" className="py-6 text-center text-[12px] text-danger">
          {fa
            ? "تمرین‌ها بارگذاری نشدند. لطفاً دوباره تلاش کنید."
            : "Could not load exercises. Please try again."}
        </p>
      )}
      {visibleItems.map((item, i) => {
        const skill = getPracticeSkill(item);
        const kind =
          skill === "speaking"
            ? "speak"
            : skill === "listening"
              ? "listen"
              : skill === "reading"
                ? "read"
                : skill === "grammar"
                  ? "grammar"
                  : skill === "vocabulary"
                    ? "vocabulary"
                    : "write";
        const { bg, text, Icon } = kindStyles[kind];
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-3.5 ${i !== visibleItems.length - 1 ? "border-b border-line" : ""}`}
          >
            <div
              className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 ${bg} ${text}`}
            >
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold">{item.title}</div>
              <div className="flex gap-2.5 mt-0.5">
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock size={11} />{" "}
                  {item.timeLimit ? Math.ceil(item.timeLimit / 60) : "—"} min
                </span>
                <span className="text-[11px] text-muted">
                  {item.category} · {item.level}
                </span>
              </div>
            </div>
            <Link
              href={href(`/dashboard/practice/${item.id}`)}
              className="bg-cream border border-line text-ink px-4 py-2 rounded-[9px] text-[12.5px] font-semibold hover:bg-ink hover:text-white hover:border-ink transition-colors whitespace-nowrap"
            >
              {fa ? "شروع" : "Start"}
            </Link>
          </div>
        );
      })}
      {!loading && !error && visibleItems.length === 0 && (
        <p className="py-7 text-center text-[12px] text-muted">
          {skill !== "all"
            ? fa
              ? "فعلاً تمرینی در این مهارت ثبت نشده است."
              : "No exercises are available for this skill yet."
            : fa
              ? "فعلاً تمرین تازه‌ای در دسترس نیست."
              : "No practice exercises are available yet."}
        </p>
      )}
    </div>
  );
}
