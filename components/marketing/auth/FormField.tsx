"use client";

import { useId, useState } from "react";
import { Eye } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function FormField({
  label,
  icon,
  type = "text",
  placeholder,
  isPassword,
  id: inputId,
  ...rest
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  isPassword?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const id = useId();
  const { lang } = useLanguage();

  return (
    <div className="relative mb-5">
      <label
        htmlFor={inputId ?? id}
        className="absolute -top-2.5 start-4.5 z-10 bg-cream px-2 text-[12px] font-bold text-ink"
        style={{ insetInlineStart: 18 }}
      >
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3.5 shadow-card transition-colors focus-within:border-blue">
        <span className="shrink-0 text-ink70" aria-hidden="true">
          {icon}
        </span>
        <input
          id={inputId ?? id}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          dir={isPassword || type === "email" ? "ltr" : undefined}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted sm:text-[15px]"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink70 hover:bg-cream"
            aria-label={
              show
                ? lang === "fa"
                  ? "پنهان‌کردن گذرواژه"
                  : "Hide password"
                : lang === "fa"
                  ? "نمایش گذرواژه"
                  : "Show password"
            }
            aria-pressed={show}
          >
            <Eye size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
