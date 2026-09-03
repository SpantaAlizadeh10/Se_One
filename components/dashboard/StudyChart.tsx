"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { monthlyEarnings, monthlyDownloads, months } from "@/lib/data";

export default function StudyChart() {
  const [view, setView] = useState<"earnings" | "downloads">("earnings");
  const data = view === "earnings" ? monthlyEarnings : monthlyDownloads;
  const peakIndex = data.indexOf(Math.max(...data));
  const maxScale = 120;

  return (
    <div className="bg-white border border-line rounded-lg p-5 sm:p-6 lg:px-[26px] lg:py-6">
      <div className="flex items-start justify-between gap-3.5 flex-wrap mb-5.5" style={{ marginBottom: 22 }}>
        <div className="flex gap-3 items-start">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-sage flex items-center justify-center text-sageDeep shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold mb-0.5">Monthly Study Time</h3>
            <p className="text-[12.5px] text-muted m-0">Your academic work is now a digital asset</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex bg-cream rounded-[10px] p-[3px] border border-line">
            <button
              onClick={() => setView("earnings")}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold ${
                view === "earnings" ? "bg-ink text-white" : "text-muted"
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setView("downloads")}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold ${
                view === "downloads" ? "bg-ink text-white" : "text-muted"
              }`}
            >
              Downloads
            </button>
          </div>
          <div className="flex items-center gap-1.5 border border-line rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-ink70">
            This Year <ChevronDown size={12} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto thin-scroll -mx-1 px-1">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-12 items-end h-[200px] gap-2.5 border-t border-dashed border-line pt-2.5">
            {data.map((value, i) => {
              const isPeak = i === peakIndex;
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full relative">
                  {isPeak && (
                    <div className="absolute -top-[46px] left-1/2 -translate-x-1/2 bg-ink text-white text-[10.5px] font-semibold px-2.5 py-1.5 rounded-lg text-center leading-tight whitespace-nowrap">
                      You have
                      <br />
                      {value}k
                    </div>
                  )}
                  <div
                    className={`w-[60%] rounded-t-[7px] rounded-b-[3px] transition-transform ${
                      isPeak
                        ? "bg-gradient-to-b from-[#6E9BFF] to-blue shadow-[0_8px_18px_-8px_rgba(61,95,224,0.6)]"
                        : "bg-[#EFEAE0]"
                    }`}
                    style={{ height: `${Math.max((value / maxScale) * 100, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-12 mt-2.5">
            {months.map((m) => (
              <span key={m} className="text-center text-[11.5px] text-muted">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
