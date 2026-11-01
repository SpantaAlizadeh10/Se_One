"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  createPaymentRequest,
  getPaymentSettings,
  uploadPaymentReceipt,
  type PaymentRequest,
  type PaymentSettings,
} from "@/lib/api/payments";
import { enrollInDemoClass } from "@/lib/demo-class-scheduling";
import { isApiConfigured } from "@/lib/is-api-configured";

type PaymentMethod = "card-transfer" | "payment-link";
const DEMO_CARD_NUMBER = "6037-0000-0000-0000";

export default function ClassPaymentPage() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId") ?? "";
  const demoAssignmentId = searchParams.get("demoAssignmentId") ?? "";
  const isDemo = Boolean(demoAssignmentId);
  const classTitle = searchParams.get("title") ?? (fa ? "کلاس" : "Class");
  const teacherName = searchParams.get("teacher") ?? "";
  const demoAmount = Number(searchParams.get("amount") ?? 0);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card-transfer");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingPaymentMethod, setUpdatingPaymentMethod] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    if (isDemo) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    if (!enrollmentId || !isApiConfigured()) {
      setError(
        fa
          ? "شناسه رزرو یا اتصال به درگاه پرداخت معتبر نیست."
          : "The booking or payment API is unavailable.",
      );
      setLoading(false);
      return () => {
        active = false;
      };
    }

    Promise.all([
      createPaymentRequest(enrollmentId, "card-transfer"),
      getPaymentSettings(),
    ])
      .then(([paymentResult, paymentSettings]) => {
        if (!active) return;
        setPayment(paymentResult);
        setSettings(paymentSettings);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "اطلاعات پرداخت بارگذاری نشد."
                : "Could not load payment details.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enrollmentId, isDemo, fa]);

  const formatPrice = (amount: number, currency = "IRR") =>
    new Intl.NumberFormat(fa ? "fa-IR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const selectPaymentMethod = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError("");
    if (isDemo || !enrollmentId) return;
    setUpdatingPaymentMethod(true);
    try {
      const updatedPayment = await createPaymentRequest(enrollmentId, method);
      setPayment(updatedPayment);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "روش پرداخت آماده نشد."
            : "Could not prepare this payment method.",
      );
    } finally {
      setUpdatingPaymentMethod(false);
    }
  };

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (isDemo) {
      setSubmitting(true);
      try {
        enrollInDemoClass(demoAssignmentId);
        setSuccess(true);
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : fa
              ? "رزرو آزمایشی انجام نشد."
              : "Demo booking could not be completed.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!payment?.id) {
      setError(
        fa ? "درخواست پرداخت آماده نیست." : "Payment request is not ready.",
      );
      return;
    }

    if (paymentMethod === "payment-link") {
      if (!payment.paymentUrl) {
        setError(
          fa
            ? "لینک درگاه هنوز به سامانه متصل نشده است. فعلاً از کارت‌به‌کارت استفاده کنید."
            : "The bank gateway is not connected yet. Use card transfer for now.",
        );
        return;
      }
      try {
        const gatewayUrl = new URL(payment.paymentUrl);
        if (gatewayUrl.protocol !== "https:") {
          throw new Error("Payment gateway must use a secure HTTPS link.");
        }
        window.location.assign(gatewayUrl.toString());
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : fa
              ? "لینک پرداخت معتبر نیست."
              : "The payment link is invalid.",
        );
      }
      return;
    }

    if (!receipt) {
      setError(
        fa
          ? "لطفاً تصویر فیش پرداخت را انتخاب کنید."
          : "Choose your payment receipt first.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await uploadPaymentReceipt(payment.id, receipt);
      setSuccess(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ارسال فیش پرداخت انجام نشد."
            : "Could not submit the payment receipt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage text-sageDeep">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="mb-3 font-serif text-[25px] font-semibold">
          {isDemo
            ? fa
              ? "رزرو آزمایشی ثبت شد"
              : "Demo booking saved"
            : fa
              ? "فیش برای بررسی ارسال شد"
              : "Receipt submitted for review"}
        </h1>
        <p className="mb-8 text-[14px] leading-relaxed text-ink70">
          {isDemo
            ? fa
              ? "این رزرو آزمایشی است و پرداخت واقعی انجام نشده است."
              : "This is a demo booking. No real payment was processed."
            : fa
              ? "پس از تأیید پرداخت توسط ادمین، رزرو شما نهایی می‌شود."
              : "Your booking will be confirmed after the admin verifies your payment."}
        </p>
        <button
          type="button"
          onClick={() => router.push(href("/dashboard/classes"))}
          className="rounded-full bg-blue px-6 py-3 text-[13px] font-semibold text-white hover:bg-blueDeep"
        >
          {fa ? "بازگشت به کلاس‌ها" : "Back to classes"}
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <Link
        href={href("/dashboard/classes")}
        className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-ink70 hover:text-blue"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {fa ? "بازگشت به فهرست کلاس‌ها" : "Back to classes"}
      </Link>
      <h1 className="mb-2 font-serif text-[26px] font-semibold">
        {fa ? "پرداخت و نهایی‌کردن رزرو" : "Payment and booking"}
      </h1>
      <p className="mb-6 text-[13px] text-muted">
        {classTitle}
        {teacherName ? ` · ${teacherName}` : ""}
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger/10 p-3 text-[13px] text-danger"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center text-[13px] text-muted">
          {fa ? "در حال آماده‌سازی پرداخت…" : "Preparing payment…"}
        </div>
      ) : (
        <form
          onSubmit={submitPayment}
          className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"
        >
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="text-[13px] text-muted">
              {fa ? "مبلغ قابل پرداخت" : "Amount due"}
            </span>
            <strong className="text-[19px] text-blue">
              {isDemo
                ? formatPrice(demoAmount)
                : payment
                  ? formatPrice(payment.amount, payment.currency)
                  : "—"}
            </strong>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-2 text-[13px] font-semibold text-ink">
              {fa ? "روش پرداخت را انتخاب کنید" : "Choose a payment method"}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${paymentMethod === "card-transfer" ? "border-blue bg-blue/5" : "border-line hover:border-blue/40"}`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="card-transfer"
                  checked={paymentMethod === "card-transfer"}
                  onChange={() => void selectPaymentMethod("card-transfer")}
                  className="mt-1 accent-blue"
                />
                <span>
                  <span className="block text-[13px] font-semibold">
                    {fa ? "کارت‌به‌کارت" : "Card transfer"}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {fa
                      ? "واریز و ارسال تصویر فیش"
                      : "Transfer and upload receipt"}
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${paymentMethod === "payment-link" ? "border-blue bg-blue/5" : "border-line hover:border-blue/40"}`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="payment-link"
                  checked={paymentMethod === "payment-link"}
                  onChange={() => void selectPaymentMethod("payment-link")}
                  className="mt-1 accent-blue"
                />
                <span>
                  <span className="block text-[13px] font-semibold">
                    {fa ? "پرداخت از طریق لینک" : "Pay by link"}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {fa ? "درگاه بانکی امن" : "Secure bank gateway"}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {paymentMethod === "card-transfer" ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-cream p-4">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                  <CreditCard size={16} />
                  {fa ? "اطلاعات کارت مقصد" : "Destination card"}
                </div>
                {isDemo ? (
                  <div className="space-y-1 text-[12px] text-ink70">
                    <p className="font-mono font-semibold">
                      {DEMO_CARD_NUMBER}
                    </p>
                    <p className="text-[11px] text-muted">
                      {fa
                        ? "شماره کارت نمایشی؛ کارت واقعی نیست."
                        : "Demo card number — not a real card."}
                    </p>
                  </div>
                ) : settings ? (
                  <div className="space-y-1 text-[12px] text-ink70">
                    <p className="font-mono font-semibold">
                      {settings.cardNumber}
                    </p>
                    {settings.accountNumber && (
                      <p className="font-mono">
                        {fa ? "شماره حساب:" : "Account number:"}{" "}
                        {settings.accountNumber}
                      </p>
                    )}
                    {settings.cardHolderName && (
                      <p>
                        {fa ? "به نام:" : "Account holder:"}{" "}
                        {settings.cardHolderName}
                      </p>
                    )}
                    {settings.bankName && <p>{settings.bankName}</p>}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted">
                    {fa
                      ? "اطلاعات کارت در دسترس نیست."
                      : "Card details unavailable."}
                  </p>
                )}
              </div>
              {isDemo ? (
                <p className="rounded-xl border border-blue/20 bg-blue/5 p-3 text-[12px] text-blue">
                  {fa
                    ? "پرداخت کارت‌به‌کارت در این نسخه فقط نمایشی است و فیش واقعی لازم نیست."
                    : "Card transfer is simulated in this demo; no real receipt is needed."}
                </p>
              ) : (
                <>
                  <label className="block space-y-2 text-[12px] font-semibold text-ink70">
                    <span>{fa ? "تصویر فیش پرداخت" : "Payment receipt"}</span>
                    <span className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-5 text-center hover:border-blue">
                      <Upload size={20} className="text-muted" />
                      <span className="text-[12px] text-muted">
                        {receipt?.name ??
                          (fa ? "انتخاب فایل تصویر" : "Choose receipt image")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setReceipt(event.target.files?.[0] ?? null)
                        }
                        className="sr-only"
                      />
                    </span>
                  </label>
                  {settings?.whatsappNumber && (
                    <p className="text-[11px] text-muted">
                      {fa
                        ? "پس از ارسال، فیش برای بررسی پرداخت ثبت می‌شود."
                        : `Receipt will be submitted for verification. Support: ${settings.whatsappNumber}`}
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-cream p-4 text-[12px] text-ink70">
              {isDemo ? (
                <p>
                  {fa
                    ? "اتصال آزمایشی درگاه بانکی فعال نیست؛ با دکمه زیر فقط روند رزرو را شبیه‌سازی می‌کنید."
                    : "The demo bank gateway is not connected. The button below only simulates the booking."}
                </p>
              ) : payment?.paymentUrl ? (
                <p>
                  {fa
                    ? "با ادامه، به درگاه بانکی امن منتقل می‌شوید."
                    : "Continue to the secure bank gateway to complete payment."}
                </p>
              ) : (
                <p>
                  {fa
                    ? "درگاه پرداخت هنوز متصل نشده است. این گزینه پس از دریافت لینک امن از بک‌اند فعال می‌شود؛ فعلاً کارت‌به‌کارت را انتخاب کنید."
                    : "The gateway is not connected yet. This option activates when the backend returns a secure payment URL; use card transfer for now."}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              updatingPaymentMethod ||
              loading ||
              (!isDemo && !payment?.id) ||
              (!isDemo && paymentMethod === "card-transfer" && !receipt) ||
              (!isDemo &&
                paymentMethod === "payment-link" &&
                !payment?.paymentUrl)
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={16} className="animate-spin" />}
            {paymentMethod === "payment-link"
              ? isDemo
                ? fa
                  ? "شبیه‌سازی پرداخت لینک"
                  : "Simulate link payment"
                : fa
                  ? "رفتن به درگاه پرداخت"
                  : "Continue to bank gateway"
              : isDemo
                ? fa
                  ? "شبیه‌سازی کارت‌به‌کارت"
                  : "Simulate card transfer"
                : fa
                  ? "ارسال فیش کارت‌به‌کارت"
                  : "Submit card transfer receipt"}
          </button>
        </form>
      )}
    </main>
  );
}
