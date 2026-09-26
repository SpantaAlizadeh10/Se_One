"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { getStudyStatistics } from "@/lib/api/student-dashboard";

export default function StudyChart() {
  const [data, setData] = useState<{ label: string; minutes: number }[]>([]);
  useEffect(() => {
    let active = true;
    getStudyStatistics()
      .then((stats) => {
        if (active) setData(stats.weeklyActivity.map((entry) => ({ label: entry.date, minutes: entry.minutes })));
      })
      .catch(() => { if (active) setData([]); });
    return () => { active = false; };
  }, []);
  const peakIndex = data.length ? data.reduce((peak, item, index) => item.minutes > data[peak].minutes ? index : peak, 0) : -1;
  const maxScale = Math.max(1, ...data.map((item) => item.minutes));

  return (
    <div className="bg-white border border-line rounded-lg p-5 sm:p-6 lg:px-[26px] lg:py-6">
      <div className="flex items-start justify-between gap-3.5 flex-wrap mb-5.5" style={{ marginBottom: 22 }}>
        <div className="flex gap-3 items-start">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-sage flex items-center justify-center text-sageDeep shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold mb-0.5">Weekly Study Time</h3>
            <p className="text-[12.5px] text-muted m-0">Study minutes recorded by your account</p>
          </div>
        </div>
          <span className="text-[12px] text-muted">Minutes</span>
      </div>

      <div className="overflow-x-auto thin-scroll -mx-1 px-1">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-12 items-end h-[200px] gap-2.5 border-t border-dashed border-line pt-2.5">
            {data.map((item, i) => {
              const isPeak = i === peakIndex;
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full relative">
                  {isPeak && (
                    <div className="absolute -top-[46px] left-1/2 -translate-x-1/2 bg-ink text-white text-[10.5px] font-semibold px-2.5 py-1.5 rounded-lg text-center leading-tight whitespace-nowrap">
                      You have
                      <br />
                      {item.minutes} min
                    </div>
                  )}
                  <div
                    className={`w-[60%] rounded-t-[7px] rounded-b-[3px] transition-transform ${
                      isPeak
                        ? "bg-gradient-to-b from-[#6E9BFF] to-blue shadow-[0_8px_18px_-8px_rgba(61,95,224,0.6)]"
                        : "bg-[#EFEAE0]"
                    }`}
                    style={{ height: `${Math.max((item.minutes / maxScale) * 100, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-12 mt-2.5">
            {data.map((item) => (
              <span key={item.label} className="text-center text-[11.5px] text-muted">
                {item.label ? new Date(item.label).toLocaleDateString(undefined, { weekday: "short" }) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
