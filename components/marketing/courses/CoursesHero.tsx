"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CoursesHero({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  const c = t("coursesPage.hero");
  const levels: string[] = t("home.levels");

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <h1 className="font-serif text-[34px] sm:text-[46px] leading-[1.15] font-semibold mb-1">
            {c.title1}
            <br />
            <span className="text-blue">{c.title2}</span>
          </h1>
          <div className="w-[74px] h-[3px] bg-gold rounded my-5" />
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-7">
            {c.lead}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              document
                .getElementById("courses")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-[520px]"
          >
            <div className="flex-1 flex items-center gap-2.5 bg-white border border-line rounded-full px-5 py-3.5 shadow-card">
              <Search size={16} className="text-blue shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={c.searchPlaceholder}
                className="flex-1 min-w-0 outline-none text-[14px] placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="bg-blue text-white rounded-full px-6 py-3.5 text-[14px] font-bold hover:bg-blueDeep transition-colors whitespace-nowrap"
            >
              {c.find}
            </button>
          </form>
        </div>

        <div className="relative h-[280px] sm:h-[320px] flex items-center justify-center">
          <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full bg-gradient-to-br from-goldSoft to-peach" />
          <div className="relative w-[170px] h-[170px] sm:w-[190px] sm:h-[190px] rounded-full bg-white shadow-card flex items-center justify-center">
            <img
              src="/images/Hat.png"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-lg border border-line bg-white shadow-card thin-scroll sm:overflow-visible">
        <div className="flex w-max min-w-full snap-x snap-mandatory gap-1 px-3 py-2 sm:w-full sm:justify-between">
          {levels.map((level) => (
            <div
              key={level}
              className="shrink-0 snap-start whitespace-nowrap rounded-md px-5 py-2.5 text-center text-[13.5px] font-semibold text-ink70 sm:flex-1 sm:px-7"
            >
              {level}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
