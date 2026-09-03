import { Flame } from "lucide-react";

const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakBanner() {
  return (
    <div className="bg-gradient-to-r from-ink to-[#2A3F63] rounded-lg px-7.5 py-6.5 text-white flex items-center justify-between gap-6 mb-7 flex-wrap" style={{ padding: "26px 30px" }}>
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
          <Flame size={24} />
        </div>
        <div>
          <h3 className="text-[19px] font-semibold mb-1">7-day streak</h3>
          <p className="text-[13px] text-[#C7CEDD] m-0">
            Keep it going — one practice session today keeps your streak alive.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const done = !isToday;
          return (
            <div
              key={i}
              className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[11.5px] font-bold ${
                done
                  ? "bg-gold text-ink"
                  : isToday
                  ? "bg-white/10 text-white ring-2 ring-gold ring-offset-2 ring-offset-ink"
                  : "bg-white/10 text-[#9AA5BE]"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
