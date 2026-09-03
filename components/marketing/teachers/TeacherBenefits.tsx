"use client";

import { Calendar, Wallet, Globe2, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Calendar, Wallet, Globe2, BookOpen];
const colors = [
  { bg: "bg-[#E4ECFF]", text: "text-blue" },
  { bg: "bg-goldSoft", text: "text-goldDeep" },
  { bg: "bg-sage", text: "text-sageDeep" },
  { bg: "bg-peach", text: "text-peachDeep" }
];

export default function TeacherBenefits() {
  const { t } = useLanguage();
  const b = t("teachersPage.benefits");
  const items: { title: string; desc: string }[] = b.items;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <h2 className="font-serif text-[26px] sm:text-[30px] font-semibold mb-8">{b.heading}</h2>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        {items.map((item, i) => {
          const Icon = icons[i];
          const c = colors[i];
          return (
            <div key={item.title} className="bg-white border border-line rounded-lg shadow-card p-5">
              <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-3.5`}>
                <Icon size={20} />
              </div>
              <h3 className="text-[14.5px] font-semibold mb-1.5">{item.title}</h3>
              <p className="text-[12.5px] text-ink70 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
