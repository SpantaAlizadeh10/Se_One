"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstallPrompt() {
  const { t } = useLanguage();
  const pwa = t("pwa");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isIosStandalone =
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      isIosStandalone;

    if (isStandalone) {
      setDismissed(true);
      return;
    }

    if (!wasDismissed && isMobile) {
      setShowPrompt(true);
    }

    const handler = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(e);
      if (!wasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for manual install instructions
      setShowInstructions(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const [showInstructions, setShowInstructions] = useState(false);

  if (dismissed || !showPrompt) return null;

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-[20px] font-semibold text-ink">
              {pwa.installTitle}
            </h3>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-muted hover:text-ink transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{pwa.android}</h4>
                <p className="text-xs text-muted leading-relaxed">
                  {pwa.androidInstructions}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{pwa.ios}</h4>
                <p className="text-xs text-muted leading-relaxed">
                  {pwa.iosInstructions}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                <Monitor size={18} className="text-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{pwa.desktop}</h4>
                <p className="text-xs text-muted leading-relaxed">
                  {pwa.desktopInstructions}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-blue text-white py-3 rounded-full text-sm font-semibold hover:bg-blueDeep transition-colors"
          >
            {pwa.understood}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border border-line">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-blueDeep flex items-center justify-center shrink-0">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 text-ink">
              {pwa.installTitle}
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-3">
              {pwa.installMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue text-white py-2 rounded-full text-xs font-semibold hover:bg-blueDeep transition-colors"
              >
                {pwa.install}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs text-muted hover:text-ink transition-colors"
              >
                {pwa.later}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted hover:text-ink transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
