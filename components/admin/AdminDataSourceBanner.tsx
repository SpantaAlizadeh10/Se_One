"use client";

import { AlertCircle, Cloud } from "lucide-react";
import { isApiConfigured } from "@/lib/is-api-configured";

export default function AdminDataSourceBanner({
  apiError,
  onRetry,
}: {
  apiError?: string | null;
  onRetry?: () => void;
}) {
  const api = isApiConfigured();

  if (apiError) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 bg-danger/10 text-danger text-[13px] font-semibold rounded-xl px-4 py-3">
        <AlertCircle size={16} className="shrink-0" />
        <span className="flex-1 min-w-0">{apiError}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-[12px] font-bold underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (api) {
    return (
      <div className="mb-4 flex items-center gap-2 text-[12px] text-sageDeep bg-sage/40 rounded-xl px-4 py-2.5">
        <Cloud size={14} />
        Connected to backend API
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2 text-[12px] text-[#B8792E] bg-[#FDEFE0] rounded-xl px-4 py-2.5">
      <AlertCircle size={14} />
      Demo mode — set NEXT_PUBLIC_API_BASE_URL in .env.local to persist changes on the server.
    </div>
  );
}
