"use client";

import { useRef, useState } from "react";

export default function OtpInput({ length = 6, onChange }: { length?: number; onChange?: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const update = (next: string[]) => {
    setValues(next);
    onChange?.(next.join(""));
  };

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[i] = digit;
    update(next);
    if (digit && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-[15%] max-w-[46px] aspect-square rounded-xl border border-line bg-white text-center text-[18px] font-bold outline-none focus:border-blue transition-colors"
        />
      ))}
    </div>
  );
}
