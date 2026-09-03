import { ChevronLeft, ChevronRight } from "lucide-react";

const dows = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const leadingBlanks = 4; // May 2026 starts on a Friday
const daysInMonth = 31;
const today = 18;

export default function Calendar() {
  return (
    <div className="bg-gradient-to-br from-sage to-[#F1F7EE] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold m-0">May 2026</h3>
        <div className="flex gap-1.5">
          <button className="w-7 h-7 rounded-full border border-sageDeep/25 bg-white flex items-center justify-center text-sageDeep">
            <ChevronLeft size={13} />
          </button>
          <button className="w-7 h-7 rounded-full border border-sageDeep/25 bg-white flex items-center justify-center text-sageDeep">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dows.map((d) => (
          <span key={d} className="text-[11px] font-bold text-sageDeep/75 pb-1.5">
            {d}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`b-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <span
              key={day}
              className={`text-[13px] py-2 rounded-[9px] font-medium ${
                day === today ? "bg-ink text-white font-bold" : "text-ink70"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
