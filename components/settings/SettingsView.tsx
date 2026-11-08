"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, Bell, Lock, Upload, LoaderCircle } from "lucide-react";
import Toggle from "@/components/settings/Toggle";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  type UserProfile,
} from "@/lib/api/settings";

const tabs = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "security", label: "Security", Icon: Lock }
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass =
  "border border-line rounded-[10px] px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold focus:bg-white transition-colors w-full";
const labelClass = "text-[12.5px] font-semibold text-ink70";

export default function SettingsView() {
  const [tab, setTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getUserProfile()
      .then((loaded) => {
        if (!active) return;
        setProfile(loaded);
        setFullName(loaded.fullName);
        setBio(loaded.bio ?? "");
      })
      .catch((error) => {
        if (active)
          setProfileError(
            error instanceof Error ? error.message : "Could not load profile.",
          );
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const age = (() => {
    if (!profile?.dateOfBirth) return null;
    const [year, month, day] = profile.dateOfBirth
      .slice(0, 10)
      .split("-")
      .map(Number);
    if (!year || !month || !day) return null;
    const today = new Date();
    return (
      today.getFullYear() -
      year -
      (today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day)
        ? 1
        : 0)
    );
  })();

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const saved = await updateUserProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
      });
      setProfile(saved);
      setFullName(saved.fullName);
      setBio(saved.bio ?? "");
      setProfileNotice("Profile changes saved.");
      window.dispatchEvent(new Event("se-one-profile-updated"));
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Could not save profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changeAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("The image must be 5 MB or smaller.");
      return;
    }
    setUploadingAvatar(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const uploaded = await uploadAvatar(file);
      setProfile((current) =>
        current ? { ...current, avatarUrl: uploaded.avatarUrl } : current,
      );
      setProfileNotice("Profile photo updated.");
      window.dispatchEvent(new Event("se-one-profile-updated"));
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Could not upload photo.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 lg:gap-6 items-start">
      <div className="bg-white border border-line rounded-md p-2.5 shadow-card flex lg:flex-col gap-1.5 lg:gap-0 overflow-x-auto thin-scroll">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2.5 shrink-0 lg:w-full text-start px-3 py-2.5 rounded-[10px] text-[13.5px] mb-0 lg:mb-0.5 whitespace-nowrap ${
              tab === id ? "bg-ink text-white font-semibold" : "text-ink70 font-medium hover:bg-cream"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === "profile" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Profile</h3>
            <p className="text-muted text-[13px] mb-6">
              Your profile details and learning level.
            </p>

            {profileError && (
              <p role="alert" className="mb-4 rounded-lg bg-danger/10 p-3 text-[12px] text-danger">
                {profileError}
              </p>
            )}
            {profileNotice && (
              <p role="status" className="mb-4 rounded-lg bg-sage/30 p-3 text-[12px] text-sageDeep">
                {profileNotice}
              </p>
            )}

            {profileLoading ? (
              <p className="text-[13px] text-muted">Loading profile…</p>
            ) : profile ? (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-line pb-6">
                  <Image
                    src={profile.avatarUrl || "/images/Teacher.jpeg"}
                    alt={profile.fullName || "Profile photo"}
                    width={72}
                    height={72}
                    unoptimized
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => void changeAvatar(event)}
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2.5 text-[12px] font-semibold hover:border-ink disabled:opacity-60"
                    >
                      {uploadingAvatar ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Upload size={15} />
                      )}
                      {uploadingAvatar ? "Uploading…" : "Change photo"}
                    </button>
                    <p className="mb-0 mt-1.5 text-[10px] text-muted">
                      PNG, JPG or WebP · up to 5 MB
                    </p>
                  </div>
                </div>

                <form onSubmit={(event) => void saveProfile(event)}>
                  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Full name</span>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className={fieldClass}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Email address</span>
                      <input
                        type="email"
                        dir="ltr"
                        value={profile.email}
                        readOnly
                        className={`${fieldClass} opacity-70`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Age</span>
                      <input
                        value={age === null ? "Not provided" : `${age}`}
                        readOnly
                        className={`${fieldClass} opacity-70`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Current English level</span>
                      <input
                        value={profile.level || "Not assessed"}
                        readOnly
                        className={`${fieldClass} opacity-70`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Placement test result</span>
                      <input
                        value={
                          profile.placementTestResult
                            ? `${profile.placementTestResult.score}/${profile.placementTestResult.maxScore}`
                            : "Not completed"
                        }
                        readOnly
                        className={`${fieldClass} opacity-70`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className={labelClass}>Bio</span>
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        className={fieldClass}
                        rows={4}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-[11px] bg-ink px-5 py-3 text-[13px] font-semibold text-white hover:bg-blueDeep disabled:opacity-60"
                    >
                      {savingProfile ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        )}

        {tab === "notifications" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Notifications</h3>
            <p className="text-muted text-[13px] mb-6">
              Choose what you&apos;d like to be notified about, and how.
            </p>

            {[
              { title: "Upcoming class reminders", desc: "Get a reminder 30 minutes before class starts.", on: true },
              { title: "Assignment due dates", desc: "Alerts when an assignment is due within 24 hours.", on: true },
              { title: "New messages", desc: "Notify me when a teacher or coach messages me.", on: true },
              { title: "Grades & feedback", desc: "Notify me as soon as an assignment is graded.", on: true },
              { title: "Product news & tips", desc: "Occasional emails about new courses and features.", on: false }
            ].map((row, i, arr) => (
              <div
                key={row.title}
                className={`flex items-center justify-between py-4 ${i !== arr.length - 1 ? "border-b border-line" : ""}`}
              >
                <div>
                  <div className="text-[13.5px] font-semibold">{row.title}</div>
                  <div className="text-[12px] text-muted mt-0.5">{row.desc}</div>
                </div>
                <Toggle defaultChecked={row.on} />
              </div>
            ))}

            <div className="flex justify-end mt-4">
              <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                Save preferences
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
            <h3 className="text-[18px] font-semibold mb-1">Security</h3>
            <p className="text-muted text-[13px] mb-6">
              Keep your account safe with a strong password and extra verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-6" style={{ gap: 18 }}>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className={labelClass}>Current password</label>
                <input type="password" dir="ltr" defaultValue="••••••••••" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>New password</label>
                <input type="password" dir="ltr" placeholder="Enter new password" className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Confirm new password</label>
                <input type="password" dir="ltr" placeholder="Re-enter new password" className={fieldClass} />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                Update password
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-line mb-2">
              <div>
                <div className="text-[13.5px] font-semibold">Two-factor authentication</div>
                <div className="text-[12px] text-muted mt-0.5">
                  Add an extra step when signing in from a new device.
                </div>
              </div>
              <Toggle defaultChecked />
            </div>

            <div className="border border-danger/30 bg-danger/5 rounded-md px-5 py-4.5 mt-4 flex items-center justify-between gap-4 flex-wrap" style={{ padding: "18px 20px" }}>
              <div>
                <div className="text-[13.5px] font-bold text-danger">Delete your account</div>
                <div className="text-[12px] text-ink70 mt-0.5">
                  This permanently removes your courses, progress, and messages.
                </div>
              </div>
              <button className="bg-white border border-danger/30 text-danger px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold whitespace-nowrap">
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
