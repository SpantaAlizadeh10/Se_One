"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Mic, BookOpen, PenLine, Clock, LoaderCircle } from "lucide-react";
import { getPracticeContent, type PracticeContent } from "@/lib/api/practice";

const kindStyles = {
  speak: { bg: "bg-[#E4ECFF]", text: "text-blue", Icon: Mic },
  grammar: { bg: "bg-sage", text: "text-sageDeep", Icon: BookOpen },
  write: { bg: "bg-goldSoft", text: "text-goldDeep", Icon: PenLine },
} as const;

export default function PracticeList() {
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
      {practiceItems.map((item, i) => {
        const category = `${item.category} ${item.title}`.toLowerCase();
        const kind =
          category.includes("speak") || category.includes("listen")
            ? "speak"
            : category.includes("grammar")
              ? "grammar"
              : "write";
        const { bg, text, Icon } = kindStyles[kind];
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-3.5 ${i !== practiceItems.length - 1 ? "border-b border-line" : ""}`}
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
      {!loading && !error && practiceItems.length === 0 && (
        <p className="py-7 text-center text-[12px] text-muted">
          {fa
            ? "فعلاً تمرین تازه‌ای در دسترس نیست."
            : "No practice exercises are available yet."}
        </p>
      )}
    </div>
  );
}
