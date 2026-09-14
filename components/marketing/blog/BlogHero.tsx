"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function BlogHero() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-serif text-[36px] sm:text-[48px] leading-[1.15] font-semibold mb-5">
          {t("blog.hero.title1")} <span className="text-blue">{t("blog.hero.title2")}</span>
        </h1>
        <div className="w-[74px] h-[3px] bg-gold rounded mx-auto my-5" />
        <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed mb-7">
          {t("blog.hero.lead")}
        </p>
      </div>
    </section>
  );
}