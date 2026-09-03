"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCoursesPricing } from "@/lib/use-courses-pricing";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";

export default function AdminCoursesPage() {
  const { t, lang } = useLanguage();
  const s = t("adminCoursesPage");
  const coursesData: { id: string; title: string }[] = t("coursesData");

  const [pricing, updatePricing] = useCoursesPricing();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const setDraft = (id: string, value: string) => setDrafts((prev) => ({ ...prev, [id]: value }));

  const save = (id: string) => {
    const raw = drafts[id];
    if (raw === undefined) return;
    const clamped = Math.max(0, Math.min(100, Number(raw) || 0));
    updatePricing((prev) => prev.map((p) => (p.id === id ? { ...p, discountPercent: clamped } : p)));
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1800);
  };

  return (
    <div>
      <p className="text-muted text-[14px] mb-6 max-w-[560px]">{s.sub}</p>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[s.colCourse, s.colBasePrice, s.colDiscount, s.colFinalPrice, s.colActions].map((h) => (
                <th key={h} className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => {
              const course = coursesData.find((c) => c.id === p.id);
              const draftValue = drafts[p.id] ?? String(p.discountPercent);
              const previewDiscount = Math.max(0, Math.min(100, Number(draftValue) || 0));
              const discounted = getDiscountedPrice(p.basePrice, previewDiscount);

              return (
                <tr key={p.id} className="border-b border-line last:border-none hover:bg-cream/60">
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold">{course?.title ?? p.id}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink70">{formatPrice(p.basePrice, lang)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={draftValue}
                        onChange={(e) => setDraft(p.id, e.target.value)}
                        className="w-16 border border-line rounded-lg px-2.5 py-1.5 text-[13px] text-center outline-none focus:border-blue"
                      />
                      <span className="text-[12px] text-muted">%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {previewDiscount > 0 ? (
                      <span className="text-[13px] font-bold text-goldDeep">{formatPrice(discounted, lang)}</span>
                    ) : (
                      <span className="text-[12px] text-muted">{s.noDiscount}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => save(p.id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue hover:bg-blueDeep px-3.5 py-1.5 rounded-full transition-colors"
                    >
                      {savedId === p.id ? <Check size={13} /> : null}
                      {savedId === p.id ? s.savedMsg : s.saveBtn}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
