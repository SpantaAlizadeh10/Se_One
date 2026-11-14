"use client";

import { GraduationCap, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [GraduationCap, Calendar, MessageSquare, ShieldCheck];
const colors = [
  { bg: "bg-[#E4ECFF]", text: "text-blue" },
  { bg: "bg-goldSoft", text: "text-goldDeep" },
  { bg: "bg-[#F3E0DE]", text: "text-[#843B32]" },
  { bg: "bg-[#E9E1F5]", text: "text-[#63439B]" }
];

export default function WhyLearn() {
  const { t } = useLanguage();
  const why = t("coursesPage.why");
  const items: { title: string; desc: string }[] = why.items;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <span className="block text-goldDeep font-bold text-[13px] underline underline-offset-4 mb-4">SE ONE</span>
      <div className="bg-white rounded-lg shadow-card p-6 sm:p-9">
        <div className="text-center mb-8">
          <h2 className="font-serif text-[24px] sm:text-[26px] font-semibold">{why.heading}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 md:grid-cols-4">
          {items.map((item, i) => {
            const Icon = icons[i];
            const c = colors[i];
            return (
              <div key={item.title}>
                <div className={`w-14 h-14 rounded-full ${c.bg} ${c.text} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={24} />
                </div>
                <h4 className="text-[14.5px] font-bold mb-2">{item.title}</h4>
                <p className="text-[12.5px] text-ink70 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
