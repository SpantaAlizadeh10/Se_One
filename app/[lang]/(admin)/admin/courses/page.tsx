"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Plus, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  listAdminCourses,
  patchAdminCoursePricing,
  updateAdminCourse,
  createAdminCourse,
  type AdminCourse,
  type CreateCourseInput,
} from "@/lib/api/admin";

export default function AdminCoursesPage() {
  const { t, lang } = useLanguage();
  const s = t("adminCoursesPage");
  const coursesData: { id: string; title: string }[] = t("coursesData");

  const [apiCourses, setApiCourses] = useState<AdminCourse[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState<CreateCourseInput>({
    title: "",
    description: "",
    level: "",
    basePrice: 0,
    currency: "IRR",
    duration: "",
    category: "",
    language: "",
    isFeatured: false,
  });

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setApiError(null);

    try {
      const created = await createAdminCourse(newCourse);
      setApiCourses((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewCourse({
        title: "",
        description: "",
        level: "",
        basePrice: 0,
        currency: "IRR",
        duration: "",
        category: "",
        language: "",
        isFeatured: false,
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not create course",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-[14px] max-w-[560px]">{s.sub}</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-blue text-white px-4 py-2.5 rounded-full text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
        >
          <Plus size={14} />
          Create Course
        </button>
      </div>
      {apiError && <p className="text-danger text-[13px] mb-4">{apiError}</p>}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white border border-line rounded-lg shadow-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="text-[18px] font-semibold">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink70 hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-5 space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Description *
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue h-24 resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Level *
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCourse.basePrice}
                    onChange={(e) => setNewCourse({ ...newCourse, basePrice: Number(e.target.value) })}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Currency
                  </label>
                  <select
                    value={newCourse.currency}
                    onChange={(e) => setNewCourse({ ...newCourse, currency: e.target.value })}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="IRR">IRR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="e.g., 8 weeks"
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={newCourse.language}
                    onChange={(e) => setNewCourse({ ...newCourse, language: e.target.value })}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={newCourse.isFeatured}
                  onChange={(e) => setNewCourse({ ...newCourse, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-line text-blue focus:ring-blue"
                />
                <label htmlFor="isFeatured" className="text-[13px] text-ink70">
                  Featured Course
                </label>
              </div>
              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold border border-line text-ink70 hover:border-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold bg-blue text-white hover:bg-blueDeep transition-colors disabled:opacity-70"
                >
                  {creating ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
