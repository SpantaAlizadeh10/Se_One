"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import FormField from "@/components/marketing/auth/FormField";

export default function ForgotPasswordPage() {
  const { t, href } = useLanguage();
  const f = t("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[480px] mx-auto px-5 sm:px-8 py-14 sm:py-20 min-h-[calc(100vh-76px)] flex flex-col justify-center">
      <h1 className="font-serif text-[30px] sm:text-[34px] font-semibold text-center mb-2">
        {f.title1} <span className="text-blue">{f.title2}</span>
      </h1>
      <div className="w-[70px] h-[3px] bg-gold rounded mx-auto mb-7" />

      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-7">
        {!sent ? (
          <>
            <p className="text-[13.5px] text-ink70 leading-relaxed text-center mb-6">{f.lead}</p>

            {error && (
              <div className="flex items-center gap-2.5 bg-danger/10 text-danger text-[13px] font-semibold rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={submit}>
              <FormField
                label={f.email}
                icon={<Mail size={18} />}
                type="email"
                placeholder={f.emailPh}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
              >
                {loading ? t("common.loading") : f.submit}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-sage text-sageDeep flex items-center justify-center mx-auto mb-4">
              <MailCheck size={24} />
            </div>
            <h2 className="text-[16px] font-semibold mb-2">{f.sentTitle}</h2>
            <p className="text-[13.5px] text-ink70 leading-relaxed">{f.sentLead}</p>
          </div>
        )}
      </div>

      <Link href={href("/login")} className="flex items-center justify-center gap-2 text-[13.5px] font-semibold text-ink70 mt-6">
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {f.backToLogin}
      </Link>
    </main>
  );
}
