"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CoursesHero({
  query,
  onQueryChange,
  selectedLevel,
  onLevelChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}) {
  const { t } = useLanguage();
  const c = t("coursesPage.hero");
  const levels: string[] = t("home.levels");
  const [queryMissing, setQueryMissing] = useState(false);
  const queryInput = useRef<HTMLInputElement>(null);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-12 items-center">
        <div>
          <h1 className="font-serif text-[34px] sm:text-[46px] leading-[1.15] font-semibold">
            {c.title1}
            <br />
            <span className="text-blue">{c.title2}</span>
          </h1>
          <div className="my-4 h-[3px] w-[74px] rounded bg-gold" />
          <p className="mb-6 max-w-[460px] text-[15px] leading-relaxed text-ink70 sm:text-[16px]">
            {c.lead}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!query.trim()) {
                setQueryMissing(true);
                queryInput.current?.focus();
                return;
              }
              setQueryMissing(false);
              document
                .getElementById("courses")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-[520px]"
          >
            <label
              className={`flex-1 flex items-center gap-2.5 bg-white border rounded-full px-5 py-3.5 shadow-card transition-colors ${
                queryMissing ? "border-amber-600 ring-2 ring-amber-500/20" : "border-line"
              }`}
            >
              <Search size={16} className="text-blue shrink-0" />
              <input
                ref={queryInput}
                type="text"
                value={query}
                onChange={(e) => {
                  onQueryChange(e.target.value);
                  if (e.target.value.trim()) setQueryMissing(false);
                }}
                aria-invalid={queryMissing}
                placeholder={c.searchPlaceholder}
                className="flex-1 min-w-0 outline-none text-[14px] placeholder:text-muted"
              />
            </label>
            <button
              type="submit"
              className="bg-blue text-white rounded-full px-6 py-3.5 text-[14px] font-bold hover:bg-blueDeep transition-colors whitespace-nowrap"
            >
              {c.find}
            </button>
          </form>
        </div>

        <div className="relative flex h-[240px] items-center justify-center sm:h-[320px] md:h-[280px] lg:h-[320px]">
          <div className="absolute h-[220px] w-[220px] rounded-full bg-gradient-to-br from-goldSoft to-peach sm:h-[300px] sm:w-[300px] md:h-[250px] md:w-[250px] lg:h-[300px] lg:w-[300px]" />
          <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full bg-white shadow-card sm:h-[190px] sm:w-[190px] md:h-[160px] md:w-[160px] lg:h-[190px] lg:w-[190px]">
            <Image
              src="/images/Hat.png"
              alt=""
              fill
              sizes="(max-width: 640px) 150px, 190px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[13px] font-bold text-ink">
            {t("coursesPage.filterByLevel")}
          </h2>
          {selectedLevel && (
            <button
              type="button"
              onClick={() => onLevelChange("")}
              className="min-h-9 rounded-full px-3 text-[12px] font-semibold text-blue transition-colors hover:bg-blue/5"
            >
              {t("coursesPage.clearFilter")}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: t("coursesPage.popular.heading"), value: "" },
            ...levels.map((level) => ({ label: level, value: level })),
          ].map(({ label, value }) => {
            const active = selectedLevel === value;
            return (
              <button
                key={value || "all"}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onLevelChange(value);
                  document
                    .getElementById("courses")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`min-h-10 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors sm:text-[13px] ${
                  active
                    ? "border-blue bg-blue text-white shadow-sm"
                    : "border-line bg-[#FAFAF8] text-ink70 hover:border-blue/40 hover:bg-blue/5 hover:text-blue"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
