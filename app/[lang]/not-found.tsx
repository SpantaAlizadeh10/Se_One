"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NotFound() {
  const { t, href } = useLanguage();
  const n = t("notFound");

  return (
    <main className="max-w-[480px] mx-auto px-5 py-24 text-center min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-goldSoft text-goldDeep flex items-center justify-center mx-auto mb-6">
        <Compass size={28} />
      </div>
      <h1 className="font-serif text-[70px] leading-none font-bold text-ink mb-3">404</h1>
      <h2 className="text-[18px] font-semibold mb-2">{n.title}</h2>
      <p className="text-ink70 text-[14px] leading-relaxed mb-8">{n.lead}</p>
      <Link
        href={href("/")}
        className="inline-flex items-center gap-2 bg-blue text-white rounded-full px-7 py-3.5 text-[14px] font-semibold hover:bg-blueDeep transition-colors"
      >
        {n.cta}
      </Link>
    </main>
  );
}
