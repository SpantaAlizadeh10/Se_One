"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function SubscribeBanner() {
  const { t } = useLanguage();
  const s = t("contact.subscribe");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex min-w-0 flex-col items-stretch gap-6 rounded-lg bg-blue p-5 text-center sm:p-8 sm:text-start md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <FileText size={30} className="text-white" strokeWidth={1.6} />
          </div>
          <div className="sm:text-start">
            <h3 className="text-white text-[19px] font-semibold mb-1.5">{s.title}</h3>
            <p className="text-white/85 text-[13px] max-w-[360px]">{s.lead}</p>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="flex min-h-11 w-full min-w-0 flex-col gap-1.5 rounded-[24px] bg-white p-1.5 sm:flex-row sm:items-center sm:rounded-full md:w-[min(100%,360px)] md:shrink-0"
        >
          <input
            type="email"
            required
            dir="auto"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.placeholder}
            className="min-h-11 min-w-0 flex-1 rounded-full border-none bg-transparent px-4 py-3 text-start text-[13.5px] text-ink placeholder:text-ink70 placeholder:opacity-100 outline-none sm:w-[200px]"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-full bg-goldDeep px-5 text-[13.5px] font-bold whitespace-nowrap text-white transition-colors hover:bg-[#644400]"
          >
            {subscribed ? s.subscribed : s.cta}
          </button>
        </form>
      </div>
    </section>
  );
}
