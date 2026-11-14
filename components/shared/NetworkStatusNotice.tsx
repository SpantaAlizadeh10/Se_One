"use client";

import { useEffect, useState } from "react";

type NetworkConnection = EventTarget & {
  effectiveType?: string;
};

type NetworkStatusNoticeProps = {
  lang: string;
};

export default function NetworkStatusNotice({
  lang,
}: NetworkStatusNoticeProps) {
  const [message, setMessage] = useState<"offline" | "slow" | null>(null);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: NetworkConnection }
    ).connection;

    const updateStatus = () => {
      if (!navigator.onLine) {
        setMessage("offline");
        return;
      }

      const effectiveType = connection?.effectiveType;
      setMessage(
        effectiveType === "slow-2g" || effectiveType === "2g" ? "slow" : null,
      );
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    connection?.addEventListener("change", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      connection?.removeEventListener("change", updateStatus);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="network-status" role="status" aria-live="polite">
      {message === "offline"
        ? lang === "fa"
          ? "اتصال اینترنت قطع است. پس از اتصال دوباره تلاش کنید."
          : "You are offline. Reconnect to the internet and try again."
        : lang === "fa"
          ? "اتصال اینترنت ضعیف است؛ ممکن است درخواست‌ها بیشتر طول بکشند."
          : "Your connection is slow. Requests may take longer than usual."}
    </div>
  );
}
