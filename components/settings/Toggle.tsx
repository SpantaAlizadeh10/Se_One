"use client";

import { useState } from "react";

export default function Toggle({
  defaultChecked = false,
  checked: controlled,
  onChange,
}: {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const checked = controlled !== undefined ? controlled : internal;
  const toggle = () => {
    const next = !checked;
    onChange?.(next);
    if (controlled === undefined) setInternal(next);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className={`relative w-[42px] h-6 rounded-full shrink-0 transition-colors ${
        checked ? "bg-sageDeep" : "bg-[#DDD6C8]"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-[18px]" : ""
        }`}
      />
    </button>
  );
}
