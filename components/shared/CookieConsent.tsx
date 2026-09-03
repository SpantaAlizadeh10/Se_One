"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const CONSENT_KEY = "se-one-cookie-consent";

export default function CookieConsent() {
  const { t, href } = useLanguage();
  const c = t("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = window.localStorage.getItem(CONSENT_KEY);
    if (!consented) setVisible(true);
  }, []);

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="max-w-3xl mx-auto bg-ink text-white rounded-2xl shadow-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Cookie size={20} className="text-gold shrink-0" />
          <p className="text-[12.5px] sm:text-[13px] leading-relaxed m-0">
            {c.message}{" "}
            <Link href={href("/privacy-policy")} className="underline underline-offset-2 text-gold">
              {c.learnMore}
            </Link>
          </p>
        </div>
        <button
          onClick={accept}
          className="bg-gold text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-goldDeep transition-colors shrink-0 w-full sm:w-auto"
        >
          {c.accept}
        </button>
      </div>
    </div>
  );
}
