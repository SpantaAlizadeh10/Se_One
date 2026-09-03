"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { type Role } from "@/lib/auth-client";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import FormField from "@/components/marketing/auth/FormField";
import ArchFigure from "@/components/marketing/auth/ArchFigure";
import Image from "next/image";

export default function SignupPage() {
  const { t, href } = useLanguage();
  const s = t("auth.signup");
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    if (password !== confirmPassword) {
      setError(s.confirm + " — " + s.password);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ fullName, email, password, role });
      router.push(href("/login"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start py-8">
        <div className="max-w-[520px]">
          <h1 className="font-serif text-[36px] sm:text-[44px] font-bold leading-[1.1] mb-4">
            {s.title1}
            <br />
            <span className="text-blue">{s.title2}</span>
          </h1>
          <p className="text-ink70 text-[15px] sm:text-[16px] leading-relaxed mb-7">
            {s.lead}
          </p>

          <h3 className="text-[18px] font-semibold mb-5">{s.heading}</h3>

          {error && (
            <div className="flex items-center gap-2.5 bg-danger/10 text-danger text-[13px] font-semibold rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <FormField
                label={s.fullName}
                icon={<User size={18} />}
                placeholder={s.fullNamePh}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <FormField
                label={s.email}
                icon={<Mail size={18} />}
                type="email"
                placeholder={s.emailPh}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <FormField
                label={s.password}
                icon={<Lock size={18} />}
                isPassword
                placeholder={s.passwordPh}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormField
                label={s.confirm}
                icon={<Lock size={18} />}
                isPassword
                placeholder={s.confirmPh}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <p className="text-[14px] font-bold mb-3">{s.iAm}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-start transition-colors ${
                  role === "student"
                    ? "border-gold bg-goldSoft"
                    : "border-line bg-white"
                }`}
              >
                <span className="w-[38px] h-[38px] rounded-full bg-[#E4ECFF] text-ink70 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </span>
                <span>
                  <span className="block text-[14px] font-bold">
                    {s.student}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {s.studentSub}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-start transition-colors ${
                  role === "teacher"
                    ? "border-blue bg-[#E4ECFF]"
                    : "border-line bg-white"
                }`}
              >
                <span className="w-[38px] h-[38px] rounded-full bg-[#E4ECFF] text-ink70 flex items-center justify-center shrink-0">
                  <Briefcase size={18} />
                </span>
                <span>
                  <span className="block text-[14px] font-bold">
                    {s.teacher}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {s.teacherSub}
                  </span>
                </span>
              </button>
            </div>

            <label className="flex items-start gap-2.5 text-[13px] text-ink70 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="mt-0.5 accent-blue shrink-0"
              />
              <span>
                {s.agree}{" "}
                <a
                  href={href("/terms")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue font-semibold"
                >
                  {s.terms}
                </a>{" "}
                {s.and}{" "}
                <a
                  href={href("/privacy-policy")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue font-semibold"
                >
                  {s.privacy}
                </a>{" "}
                {s.agreeEnd}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-blueDeep transition-colors disabled:opacity-70"
            >
              {loading ? t("common.loading") : s.submit}
            </button>
          </form>

          <div className="flex items-center gap-3.5 my-6 text-muted text-[13px]">
            <span className="flex-1 border-t border-dashed border-line" />
            {s.or}
            <span className="flex-1 border-t border-dashed border-line" />
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 border border-line rounded-2xl py-3.5 bg-white text-[13.5px] font-semibold hover:border-ink transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.7 6.5 2.7 12S6.9 21.7 12 21.7c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.2z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 border border-line rounded-2xl py-3.5 bg-white text-[13.5px] font-semibold hover:border-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                <path d="M16.4 1c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.2 1-3C14.1 1.6 15.3 1 16.4 1zM20.7 17.2c-.5 1.1-.7 1.6-1.4 2.6-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-3.9-1s-2.5 1-4 1c-1.7 0-2.9-1.6-3.9-3-2.7-3.8-3-8.3-1.3-10.7 1.2-1.7 3-2.7 4.7-2.7 1.7 0 2.8 1.1 4.2 1.1 1.4 0 2.2-1.1 4.2-1.1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3 1.2 8.5z" />
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-[13.5px] text-ink70">
            {s.haveAccount}{" "}
            <Link href={href("/login")} className="text-blue font-bold">
              {s.logIn}
            </Link>
          </p>
        </div>

        <ArchFigure tone="warm">
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full overflow-hidden mt-6">
            <Image
              src="/images/ssss.png"
              alt="Signup overlay"
              width={480}
              height={480}
              className="w-full h-full object-contain"
              sizes="(max-width: 640px) 180px, 220px"
              priority
            />
          </div>
        </ArchFigure>
      </div>
    </main>
  );
}
