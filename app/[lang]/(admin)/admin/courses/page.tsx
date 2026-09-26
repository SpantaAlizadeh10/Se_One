"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  listAdminCourses,
  patchAdminCoursePricing,
  updateAdminCourse,
  type AdminCourse,
} from "@/lib/api/admin";

export default function AdminCoursesPage() {
  const { t, lang } = useLanguage();
  const s = t("adminCoursesPage");
  const coursesData: { id: string; title: string }[] = t("coursesData");

  const [apiCourses, setApiCourses] = useState<AdminCourse[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setApiError("Backend API URL is not configured. Course pricing is unavailable.");
      return;
    }
    listAdminCourses()
      .then(setApiCourses)
      .catch((error) =>
        setApiError(
          error instanceof Error ? error.message : "Could not load courses",
        ),
      );
  }, []);

  const setDraft = (id: string, value: string) =>
    setDrafts((prev) => ({ ...prev, [id]: value }));

  const save = async (id: string) => {
    const raw = drafts[id];
    if (raw === undefined) return;
    const clamped = Math.max(0, Math.min(100, Number(raw) || 0));
    if (apiCourses) {
      try {
        const updated = await patchAdminCoursePricing(id, {
          discountPercent: clamped,
        });
        setApiCourses(
          (prev) => prev.map((course) => (course.id === id ? updated : course)),
        );
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Could not save discount",
        );
        return;
      }
    }
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1800);
  };

  const togglePublished = async (course: AdminCourse) => {
    try {
      const updated = await updateAdminCourse(course.id, {
        isPublished: !course.isPublished,
      });
      setApiCourses(
          (prev) => prev.map((item) => (item.id === course.id ? updated : item)),
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not update course publication",
      );
    }
  };

  return (
    <div>
      <p className="text-muted text-[14px] mb-6 max-w-[560px]">{s.sub}</p>
      {apiError && <p className="text-danger text-[13px] mb-4">{apiError}</p>}

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[
                s.colCourse,
                s.colBasePrice,
                s.colDiscount,
                s.colFinalPrice,
                s.colActions,
              ].map((h) => (
                <th
                  key={h}
                  className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiCourses.map((course) => ({
                  id: course.id,
                  basePrice: course.basePrice,
                  discountPercent: course.discountPercent,
                  title: course.title,
                  isPublished: course.isPublished,
                })).map((p) => {
              const course = coursesData.find((c) => c.id === p.id);
              const courseTitle =
                "title" in p && typeof p.title === "string"
                  ? p.title
                  : (course?.title ?? p.id);
              const isPublished =
                "isPublished" in p && typeof p.isPublished === "boolean"
                  ? p.isPublished
                  : false;
              const draftValue = drafts[p.id] ?? String(p.discountPercent);
              const previewDiscount = Math.max(
                0,
                Math.min(100, Number(draftValue) || 0),
              );
              const discounted = getDiscountedPrice(
                p.basePrice,
                previewDiscount,
              );

              return (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-none hover:bg-cream/60"
                >
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold">
                    {courseTitle}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink70">
                    {formatPrice(p.basePrice, lang)}
                  </td>
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
                      <span className="text-[13px] font-bold text-goldDeep">
                        {formatPrice(discounted, lang)}
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted">
                        {s.noDiscount}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => save(p.id)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue hover:bg-blueDeep px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        {savedId === p.id ? <Check size={13} /> : null}
                        {savedId === p.id ? s.savedMsg : s.saveBtn}
                      </button>
                          {"isPublished" in p && (
                        <button
                          onClick={() =>
                            togglePublished(
                              apiCourses.find((course) => course.id === p.id)!,
                            )
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sageDeep bg-sage hover:bg-sage/80"
                          title={
                            isPublished ? "Unpublish course" : "Publish course"
                          }
                        >
                          {isPublished ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>
                      )}
                    </div>
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
