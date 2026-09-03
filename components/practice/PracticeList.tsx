import { Mic, BookOpen, PenLine, Clock } from "lucide-react";
import { practiceItems } from "@/lib/data";

const kindStyles = {
  speak: { bg: "bg-[#E4ECFF]", text: "text-blue", Icon: Mic },
  grammar: { bg: "bg-sage", text: "text-sageDeep", Icon: BookOpen },
  write: { bg: "bg-goldSoft", text: "text-goldDeep", Icon: PenLine }
} as const;

export default function PracticeList() {
  return (
    <div className="bg-white border border-line rounded-lg shadow-card px-4">
      {practiceItems.map((item, i) => {
        const { bg, text, Icon } = kindStyles[item.kind];
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-3.5 ${i !== practiceItems.length - 1 ? "border-b border-line" : ""}`}
          >
            <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 ${bg} ${text}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold">{item.title}</div>
              <div className="flex gap-2.5 mt-0.5">
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock size={11} /> {item.minutes} min
                </span>
                <span className="text-[11px] text-muted">
                  {item.skill} · {item.level}
                </span>
              </div>
            </div>
            <button className="bg-cream border border-line text-ink px-4 py-2 rounded-[9px] text-[12.5px] font-semibold hover:bg-ink hover:text-white hover:border-ink transition-colors whitespace-nowrap">
              Start
            </button>
          </div>
        );
      })}
    </div>
  );
}
