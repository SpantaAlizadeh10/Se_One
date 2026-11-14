"use client";

import { useState } from "react";
import { Send, Search, MessageSquare, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Send, Search, MessageSquare];

export default function ResponseProcess() {
  const { t } = useLanguage();
  const proc = t("contact.process");
  const items: { title: string; desc: string }[] = proc.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="text-center mb-8">
        <h2 className="font-serif text-[26px] sm:text-[28px] font-semibold inline-block">{proc.heading}</h2>
        <div className="w-20 h-[3px] bg-gold rounded mx-auto mt-2.5" />
      </div>

      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-[18px] md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div key={item.title}>
              <div className="rounded-2xl border border-line/80 bg-white shadow-card sm:hidden">
                <button
                  type="button"
                  aria-expanded={openIndex === i}
                  onClick={() =>
                    setOpenIndex((current) => (current === i ? null : i))
                  }
                  className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-start"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue text-white">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-start text-[13.5px] font-bold leading-snug text-ink">
                    {item.title}
                  </span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-muted transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-700 ease-in-out motion-reduce:transition-none ${
                    openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="m-0 border-t border-line px-4 py-3 text-[12.5px] leading-relaxed text-ink70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden h-full rounded-2xl border border-line/80 bg-white p-5 shadow-card sm:block">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-blue text-white">
                    <Icon size={17} />
                  </div>
                  <h4 className="text-[14.5px] font-bold">{item.title}</h4>
                </div>
                <p className="ps-[50px] text-[12.5px] leading-relaxed text-ink70">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
