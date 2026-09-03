"use client";

import { useState } from "react";
import { Mic, BookOpen, PenLine, ChevronRight } from "lucide-react";
import type { ClassItem } from "@/lib/data";

const kindStyles: Record<ClassItem["kind"], { bg: string; text: string; Icon: React.ElementType }> = {
  speak: { bg: "bg-[#E4ECFF]", text: "text-blue", Icon: Mic },
  grammar: { bg: "bg-sage", text: "text-sageDeep", Icon: BookOpen },
  write: { bg: "bg-goldSoft", text: "text-goldDeep", Icon: PenLine }
};

export default function ClassPanel({
  title,
  icon: HeaderIcon,
  items,
  withTabs
}: {
  title: string;
  icon: React.ElementType;
  items: ClassItem[];
  withTabs?: boolean;
}) {
  const [tab, setTab] = useState("Today");

  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-goldSoft flex items-center justify-center text-goldDeep">
            <HeaderIcon size={16} />
          </div>
          <h3 className="text-[15.5px] font-semibold m-0">{title}</h3>
        </div>
        <a href="#" className="text-[12px] font-semibold text-blue flex items-center gap-0.5">
          See all <ChevronRight size={12} />
        </a>
      </div>

      {withTabs && (
        <div className="flex gap-1.5 bg-cream rounded-[10px] p-[3px] my-3.5">
          {["Today", "Yesterday", "This Week"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold ${
                tab === t ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className={withTabs ? "" : "mt-1"}>
        {items.map((item, i) => {
          const { bg, text, Icon } = kindStyles[item.kind];
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-3 ${i !== items.length - 1 ? "border-b border-line" : ""}`}
            >
              <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 ${bg} ${text}`}>
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
      </div>
    </div>
  );
}
