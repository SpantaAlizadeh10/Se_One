"use client";

import { useCallback, useEffect, useState } from "react";
import Toggle from "@/components/settings/Toggle";
import {
  getAdminSettings,
  patchAdminSettings,
  type AdminSiteSettings,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import AdminDataSourceBanner from "@/components/admin/AdminDataSourceBanner";
import { isApiConfigured } from "@/lib/is-api-configured";

const fieldClass =
  "border border-line rounded-[10px] px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold focus:bg-white transition-colors w-full";
const labelClass = "text-[12.5px] font-semibold text-ink70";

export default function AdminSiteSettingsPanel() {
  const [settings, setSettings] = useState<AdminSiteSettings>({
    siteName: "SE ONE",
    supportEmail: "support@seone.example",
    defaultLocale: "fa",
    maintenanceMode: false,
    allowRegistration: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setSettings(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      if (isApiConfigured() && !error) {
        const next = await patchAdminSettings(settings);
        setSettings(next);
      } else {
        window.localStorage.setItem(
          "se-one-admin-settings",
          JSON.stringify(settings),
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading && isApiConfigured()) {
    return (
      <div className="bg-white border border-line rounded-lg shadow-card p-8 text-center text-muted text-[14px]">
        Loading site settings…
      </div>
    );
  }

  return (
    <div>
      <AdminDataSourceBanner apiError={error} onRetry={load} />
      <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
        <h3 className="text-[18px] font-semibold mb-1">Site settings</h3>
        <p className="text-muted text-[13px] mb-6">
          Platform-wide options visible on the public site and registration
          flow.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={labelClass}>Site name</label>
            <input
              className={fieldClass}
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Support email</label>
            <input
              type="email"
              dir="ltr"
              className={fieldClass}
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Default locale</label>
            <select
              className={fieldClass}
              value={settings.defaultLocale}
              onChange={(e) =>
                setSettings({ ...settings, defaultLocale: e.target.value })
              }
            >
              <option value="fa">Persian (fa)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 border-t border-line pt-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13.5px] font-semibold">
                Maintenance mode
              </div>
              <div className="text-[12px] text-muted">
                Show a maintenance page to visitors.
              </div>
            </div>
            <Toggle
              checked={settings.maintenanceMode}
              onChange={(on) =>
                setSettings({ ...settings, maintenanceMode: on })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13.5px] font-semibold">
                Allow registration
              </div>
              <div className="text-[12px] text-muted">
                New users can sign up from the website.
              </div>
            </div>
            <Toggle
              checked={settings.allowRegistration}
              onChange={(on) =>
                setSettings({ ...settings, allowRegistration: on })
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors disabled:opacity-60"
          >
            {saved ? "Saved" : saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
