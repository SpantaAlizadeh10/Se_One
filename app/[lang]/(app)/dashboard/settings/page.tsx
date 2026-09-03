import SettingsView from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">
        Manage your profile, notifications, and account security.
      </p>
      <SettingsView />
    </div>
  );
}
