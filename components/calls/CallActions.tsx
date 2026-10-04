"use client";

import { Phone, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCalls } from "./CallProvider";

export default function CallActions({
  peerId,
  peerName,
  compact = false,
}: {
  peerId?: string;
  peerName: string;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const { startCall } = useCalls();
  const copy = t("calls");
  const disabled = !peerId;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-3"}`}
    >
      <button
        type="button"
        disabled={disabled}
        title={disabled ? copy.profileUnavailable : copy.voiceCall}
        onClick={() => peerId && void startCall(peerId, peerName, "voice")}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-[11.5px] font-semibold text-ink70 transition-colors hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Phone size={14} />
        {copy.voiceCall}
      </button>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? copy.profileUnavailable : copy.videoCall}
        onClick={() => peerId && void startCall(peerId, peerName, "video")}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3 py-2 text-[11.5px] font-semibold text-white transition-colors hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Video size={14} />
        {copy.videoCall}
      </button>
      {disabled && (
        <span className="text-[11px] text-muted">
          {copy.profileUnavailable}
        </span>
      )}
    </div>
  );
}
