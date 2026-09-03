"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { storeAuth, dashboardPathFor, type Role } from "@/lib/auth-client";
import { login, requestOtp, verifyOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import FormField from "@/components/marketing/auth/FormField";
import OtpInput from "@/components/marketing/auth/OtpInput";
import LoginHeroStrip from "@/components/marketing/auth/LoginHeroStrip";

type Mode = "phone" | "email";
type PhoneStep = "input" | "otp";

export default function LoginPage() {
  const { t, href } = useLanguage();
  const l = t("auth.login");
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToDashboard = (role: Role) => {
    router.push(href(dashboardPathFor(role)));
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await login(email, password);
      storeAuth(auth);
      goToDashboard(auth.user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
      setLoading(false);
    }
  };

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestOtp(phone);
      setPhoneStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await verifyOtp(phone, otp);
      storeAuth(auth);
      goToDashboard(auth.user.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setPhoneStep("input");
    setError(null);
  };

  return (
    <main className="max-w-[520px] mx-auto px-5 sm:px-8 py-6 sm:py-10">
      <LoginHeroStrip />

      <h1 className="font-serif text-[28px] sm:text-[32px] font-semibold text-center mb-1.5">
        {l.title1} <span className="text-blue">{l.title2}</span>
      </h1>
      <div className="w-[70px] h-[3px] bg-gold rounded mx-auto mb-7" />

      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-7">
        <p className="text-center text-[15px] font-semibold mb-5">{l.ready}</p>

        {error && (
          <div className="flex items-center gap-2.5 bg-danger/10 text-danger text-[13px] font-semibold rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex bg-cream rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "phone" ? "bg-white shadow-sm text-ink" : "text-muted"
            }`}
          >
            <Phone size={14} /> {l.phoneTab}
          </button>
          <button
            type="button"
            onClick={() => switchMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
              mode === "email" ? "bg-white shadow-sm text-ink" : "text-muted"
            }`}
          >
            <Mail size={14} /> {l.emailTab}
          </button>
        </div>

        {mode === "phone" && phoneStep === "input" && (
          <form onSubmit={submitPhone}>
            <div className="relative mb-6">
              <span
                className="absolute -top-2.5 start-4.5 bg-white px-2 text-[12px] font-bold text-ink z-10"
                style={{ insetInlineStart: 18 }}
              >
                {l.phoneLabel}
              </span>
              <div className="flex items-center gap-2.5 border border-line rounded-2xl bg-cream px-4 py-3.5 focus-within:border-blue transition-colors">
                <span className="text-[13px] font-bold text-ink70 shrink-0 border-e border-line pe-2.5">
                  {l.countryCode}
                </span>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={l.phonePh}
                  className="flex-1 min-w-0 outline-none text-[15px] bg-transparent placeholder:text-muted"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
            >
              {loading ? t("common.loading") : l.continueBtn}
            </button>
          </form>
        )}

        {mode === "phone" && phoneStep === "otp" && (
          <form onSubmit={submitOtp}>
            <p className="text-[13px] font-semibold text-ink70 mb-3.5">
              {l.enterCode}
            </p>
            <div className="mb-6">
              <OtpInput onChange={setOtp} />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-blue text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
            >
              {loading ? t("common.loading") : l.submit}
            </button>
          </form>
        )}

        {mode === "email" && (
          <form onSubmit={submitEmail}>
            <FormField
              label={l.email}
              icon={<Mail size={18} />}
              type="email"
              placeholder={l.emailPh}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label={l.password}
              icon={<Lock size={18} />}
              isPassword
              placeholder={l.passwordPh}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href={href("/forgot-password")}
              className="block text-[13.5px] font-semibold text-ink mb-6"
            >
              {l.forget}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
            >
              {loading ? t("common.loading") : l.submit}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3.5 my-6 text-muted text-[13px]">
          <span className="flex-1 border-t border-dashed border-line" />
          {l.or}
          <span className="flex-1 border-t border-dashed border-line" />
        </div>

        <div className="flex justify-center gap-4 mb-1">
          <button
            type="button"
            className="w-[46px] h-[46px] rounded-full bg-white border border-line shadow-card flex items-center justify-center"
            aria-label="google"
          >
            <svg width="19" height="19" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.7 6.5 2.7 12S6.9 21.7 12 21.7c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.2z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="w-[46px] h-[46px] rounded-full bg-white border border-line shadow-card flex items-center justify-center"
            aria-label="apple"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#000">
              <path d="M16.4 1c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.2 1-3C14.1 1.6 15.3 1 16.4 1zM20.7 17.2c-.5 1.1-.7 1.6-1.4 2.6-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-3.9-1s-2.5 1-4 1c-1.7 0-2.9-1.6-3.9-3-2.7-3.8-3-8.3-1.3-10.7 1.2-1.7 3-2.7 4.7-2.7 1.7 0 2.8 1.1 4.2 1.1 1.4 0 2.2-1.1 4.2-1.1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3 1.2 8.5z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-center text-[13.5px] text-ink70 mt-6">
        {l.noAccount}{" "}
        <Link href={href("/signup")} className="text-blue font-bold">
          {l.signUp}
        </Link>
      </p>
    </main>
  );
}
