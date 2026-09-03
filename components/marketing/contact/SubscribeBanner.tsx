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
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="bg-blue rounded-lg p-6 sm:p-8 flex items-center gap-6 flex-wrap justify-center sm:justify-between text-center sm:text-start">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <FileText size={30} className="text-white" strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-white text-[19px] font-semibold mb-1.5">{s.title}</h3>
            <p className="text-white/85 text-[13px] max-w-[360px]">{s.lead}</p>
          </div>
        </div>
        <form onSubmit={submit} className="flex bg-white rounded-full overflow-hidden shrink-0 w-full sm:w-auto">
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.placeholder}
            className="flex-1 sm:w-[200px] border-none outline-none px-4.5 py-3 text-[13.5px]"
          />
          <button type="submit" className="bg-gold text-white px-5.5 py-3 text-[13.5px] font-bold whitespace-nowrap hover:bg-goldDeep transition-colors">
            {subscribed ? s.subscribed : s.cta}
          </button>
        </form>
      </div>
    </section>
  );
}
