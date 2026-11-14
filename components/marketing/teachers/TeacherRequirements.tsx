"use client";

import {
  ArrowUpRight,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Wifi,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const requirementIcons = [Globe2, GraduationCap, Wifi, HeartHandshake];

export default function TeacherRequirements() {
  const { t } = useLanguage();
  const r = t("teachersPage.requirements");
  const items: string[] = r.items;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="relative isolate overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 -top-28 -z-10 h-72 w-72 rounded-full bg-blue/5 blur-3xl"
        />
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden bg-ink px-6 py-8 text-white sm:px-9 sm:py-10 lg:flex lg:flex-col lg:justify-center">
            <div
              aria-hidden="true"
              className="absolute -end-14 -top-16 h-48 w-48 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -start-10 h-52 w-52 rounded-full bg-blue/20 blur-2xl"
            />
            <span className="relative mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
              <GraduationCap size={15} aria-hidden="true" />
              {r.eyebrow}
            </span>
            <h2 className="relative mb-3 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
              {r.heading}
            </h2>
            <p className="relative m-0 max-w-md text-sm leading-7 text-white/85">
              {r.lead}
            </p>
            <div className="relative mt-7 hidden items-center gap-2 text-sm font-semibold text-white/90 lg:flex">
              <span>{r.note}</span>
              <ArrowUpRight size={16} className="rtl:rotate-180" aria-hidden="true" />
            </div>
          </div>

          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:p-8">
            {items.map((item, index) => {
              const Icon = requirementIcons[index] ?? GraduationCap;
              return (
                <li
                  key={item}
                  className="group flex min-h-28 items-start gap-3.5 rounded-2xl border border-line bg-cream/60 p-4 transition-colors hover:border-blue/30 hover:bg-white sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue transition-colors group-hover:bg-blue group-hover:text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="pt-0.5 text-sm font-medium leading-6 text-ink">
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
