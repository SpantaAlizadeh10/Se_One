"use client";

import { useState } from "react";
import { Mic, BookOpen, PenLine, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { parseApiDate } from "@/lib/date-utils";

type ClassItem = {
  id: string;
  title: string;
  level: string;
  day: string;
  date: string;
  time: string;
  kind: "speak" | "grammar" | "write";
};

const kindStyles: Record<
  ClassItem["kind"],
  { bg: string; text: string; Icon: React.ElementType }
> = {
  speak: { bg: "bg-[#E4ECFF]", text: "text-blue", Icon: Mic },
  grammar: { bg: "bg-sage", text: "text-sageDeep", Icon: BookOpen },
  write: { bg: "bg-goldSoft", text: "text-goldDeep", Icon: PenLine },
};

export default function ClassPanel({
  title,
  icon: HeaderIcon,
  items,
  withTabs,
}: {
  title: string;
  icon: React.ElementType;
  items: ClassItem[];
  withTabs?: boolean;
}) {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<"today" | "yesterday" | "week">("today");
  const visibleItems = withTabs
    ? items.filter((item) => {
        const date = parseApiDate(item.date);
        if (!date) return false;
        const now = new Date();
        const candidate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const current = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const difference = Math.round(
          (candidate.getTime() - current.getTime()) / 86_400_000,
        );
        if (tab === "today") return difference === 0;
        if (tab === "yesterday") return difference === -1;
        const weekStartOffset =
          lang === "fa"
            ? (current.getDay() + 1) % 7
            : (current.getDay() + 6) % 7;
        const weekStart = new Date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate() - weekStartOffset,
        );
        const weekEnd = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + 7,
        );
        return candidate >= weekStart && candidate < weekEnd;
      })
    : items;

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-goldSoft flex items-center justify-center text-goldDeep">
            <HeaderIcon size={16} />
          </div>
          <h3 className="text-[15.5px] font-semibold m-0">{title}</h3>
        </div>
        <a
          href="#"
          className="text-[12px] font-semibold text-blue flex items-center gap-0.5"
        >
          See all <ChevronRight size={12} />
        </a>
      </div>

      {withTabs && (
        <div className="flex gap-1.5 bg-cream rounded-[10px] p-[3px] my-3.5">
          {(
            [
              ["today", lang === "fa" ? "امروز" : "Today"],
              ["yesterday", lang === "fa" ? "دیروز" : "Yesterday"],
              ["week", lang === "fa" ? "این هفته" : "This Week"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold ${
                tab === key ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className={withTabs ? "" : "mt-1"}>
        {visibleItems.map((item, i) => {
          const { bg, text, Icon } = kindStyles[item.kind];
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-3 ${i !== items.length - 1 ? "border-b border-line" : ""}`}
            >
              <div
                className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 ${bg} ${text}`}
              >
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold">{item.title}</div>
                <div className="text-[11.5px] text-muted">{item.level}</div>
              </div>
              <div className="text-[11.5px] font-semibold text-muted text-end whitespace-nowrap">
                <span className="block text-ink70 font-bold">{item.day}</span>
                {item.time}
              </div>
            </div>
          );
        })}
        {withTabs && visibleItems.length === 0 && (
          <p className="py-5 text-center text-[12px] text-muted">
            {lang === "fa"
              ? "برای این بازه کلاسی ندارید."
              : "No classes in this time range."}
          </p>
        )}
      </div>
    </div>
  );
}
