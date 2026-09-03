"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

export default function FormField({
  label,
  icon,
  type = "text",
  placeholder,
  isPassword,
  ...rest
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  isPassword?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative mb-5">
      <span className="absolute -top-2.5 start-4.5 bg-cream px-2 text-[12px] font-bold text-ink z-10" style={{ insetInlineStart: 18 }}>
        {label}
      </span>
      <div className="flex items-center gap-3 border border-line rounded-2xl bg-white px-5 py-4 shadow-card focus-within:border-blue transition-colors">
        <span className="text-ink70 shrink-0">{icon}</span>
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          dir={isPassword || type === "email" ? "ltr" : undefined}
          className="flex-1 min-w-0 outline-none text-[15px] bg-transparent placeholder:text-muted"
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} className="text-ink70 shrink-0" aria-label="Toggle password visibility">
            <Eye size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
