"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function BlogHero() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-goldDeep">
          {t("blog.hero.eyebrow")}
        </p>
        <h1 className="mb-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          {t("blog.hero.title1")}{" "}
          <span className="text-blue">{t("blog.hero.title2")}</span>
        </h1>
        <div className="mx-auto my-4 h-[3px] w-[74px] rounded bg-gold" />
        <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-ink70 sm:text-base">
          {t("blog.hero.lead")}
        </p>
      </div>
    </section>
  );
}