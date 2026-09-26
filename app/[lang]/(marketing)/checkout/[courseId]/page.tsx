"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCourses } from "@/lib/use-courses";
import { enrollInCourse } from "@/lib/api/enrollment";

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const { t, href, lang } = useLanguage();
  const c = t("checkout");
  const { courses, loading: coursesLoading } = useCourses(lang);

  const course = courses.find((cc) => cc.id === params.courseId);
  if (!course && coursesLoading) return <main className="max-w-4xl mx-auto px-5 py-16 text-center">Loading course...</main>;
  if (!course) notFound();

  const basePrice = course.basePrice ?? 0;
  const discountPercent = course.discountPercent ?? 0;
  const total = Math.round(basePrice * (1 - discountPercent / 100));
  const discountAmount = basePrice - total;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await enrollInCourse(course.id);
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start enrollment.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-[480px] mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-sage text-sageDeep flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="font-serif text-[26px] font-semibold mb-3">{c.successTitle}</h1>
        <p className="text-ink70 text-[14px] leading-relaxed mb-8">{c.successLead}</p>
        <Link
          href={href("/dashboard")}
          className="inline-flex items-center gap-2 bg-blue text-white rounded-full px-7 py-3.5 text-[14px] font-semibold hover:bg-blueDeep transition-colors"
        >
          {c.goToDashboard}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <Link href={href(`/courses/${course.id}`)} className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink70 mb-6">
        <ArrowLeft size={14} className="rtl:rotate-180" />
        {course.title}
      </Link>

      <h1 className="font-serif text-[26px] sm:text-[28px] font-semibold mb-7">{c.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        <div className="bg-white border border-line rounded-lg shadow-card p-6 order-2 lg:order-1">
          <h2 className="text-[15px] font-semibold mb-4">{c.orderSummary}</h2>
          <div className="text-[13.5px] font-semibold mb-4">{course.title}</div>

          <div className="flex items-center justify-between text-[13px] text-ink70 py-2 border-t border-line">
            <span>{c.subtotal}</span>
            <span>{course.price}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex items-center justify-between text-[13px] text-danger py-2 border-t border-line">
              <span>
                {c.discount} (-{discountPercent}%)
              </span>
              <span>-{new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { style: "currency", currency: course.currency || (lang === "fa" ? "IRR" : "USD"), maximumFractionDigits: 0 }).format(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[15px] font-bold py-3 border-t border-line mt-1">
            <span>{c.total}</span>
            <span className="text-goldDeep">{new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { style: "currency", currency: course.currency || (lang === "fa" ? "IRR" : "USD"), maximumFractionDigits: 0 }).format(total)}</span>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white border border-line rounded-lg shadow-card p-6 order-1 lg:order-2">
          <h2 className="text-[15px] font-semibold mb-3">{c.paymentDetails}</h2>
          <p className="text-[13px] text-ink70 leading-relaxed mb-5">Your enrollment and payment session will be securely created by the backend.</p>
          {error && <p role="alert" className="text-danger text-[13px] mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-blue text-white rounded-full py-4 text-[14.5px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
          >
            <Lock size={14} />
            {loading ? c.processing : `${c.payButton} — ${course.price}`}
          </button>
        </form>
      </div>
    </main>
  );
}
