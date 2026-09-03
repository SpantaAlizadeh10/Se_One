"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, href } = useLanguage();
  const e = t("errorPage");

  useEffect(() => {
    // In production, send this to an error-tracking service (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-[480px] mx-auto px-5 py-24 text-center min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6">
        <AlertOctagon size={28} />
      </div>
      <h1 className="text-[22px] font-semibold mb-2">{e.title}</h1>
      <p className="text-ink70 text-[14px] leading-relaxed mb-8">{e.lead}</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-blue text-white rounded-full px-6 py-3 text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
        >
          <RotateCcw size={14} />
          {e.retry}
        </button>
        <Link
          href={href("/")}
          className="inline-flex items-center gap-2 bg-white border border-line text-ink70 rounded-full px-6 py-3 text-[13.5px] font-semibold hover:border-ink transition-colors"
        >
          {e.cta}
        </Link>
      </div>
    </main>
  );
}
