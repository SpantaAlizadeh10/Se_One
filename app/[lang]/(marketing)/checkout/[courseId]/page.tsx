"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Lock, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCoursesPricing } from "@/lib/use-courses-pricing";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { mockCharge } from "@/lib/api/payments";

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const { t, href, lang } = useLanguage();
  const c = t("checkout");
  const courses: { id: string; title: string; price: string }[] = t("coursesData");
  const [pricing] = useCoursesPricing();

  const course = courses.find((cc) => cc.id === params.courseId);
  if (!course) notFound();

  const p = pricing.find((cp) => cp.id === course.id);
  const basePrice = p?.basePrice ?? 0;
  const discountPercent = p?.discountPercent ?? 0;
  const total = p ? getDiscountedPrice(basePrice, discountPercent) : 0;
  const discountAmount = basePrice - total;

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await mockCharge({ courseId: course.id, amount: total, cardholderName });
    setLoading(false);
    if (result.success) setSuccess(true);
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
            <span>{formatPrice(basePrice, lang)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex items-center justify-between text-[13px] text-danger py-2 border-t border-line">
              <span>
                {c.discount} (-{discountPercent}%)
              </span>
              <span>-{formatPrice(discountAmount, lang)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[15px] font-bold py-3 border-t border-line mt-1">
            <span>{c.total}</span>
            <span className="text-goldDeep">{formatPrice(total, lang)}</span>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white border border-line rounded-lg shadow-card p-6 order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={17} className="text-blue" />
            <h2 className="text-[15px] font-semibold m-0">{c.paymentDetails}</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-ink70 mb-1.5">{c.cardholderName}</label>
              <input
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder={c.cardholderPh}
                className="w-full border border-line rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink70 mb-1.5">{c.cardNumber}</label>
              <input
                type="text"
                required
                dir="ltr"
                inputMode="numeric"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="w-full border border-line rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink70 mb-1.5">{c.expiry}</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full border border-line rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink70 mb-1.5">{c.cvv}</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full border border-line rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-blue text-white rounded-full py-4 text-[14.5px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
          >
            <Lock size={14} />
            {loading ? c.processing : `${c.payButton} — ${formatPrice(total, lang)}`}
          </button>

          <div className="flex items-start gap-2 mt-4 text-[11.5px] text-muted">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            {c.securityNote}
          </div>
        </form>
      </div>
    </main>
  );
}
