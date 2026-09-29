"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Bell, Lock, Video, Upload, X } from "lucide-react";
import Toggle from "@/components/settings/Toggle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getTeacherProfile,
  updateTeacherProfile,
  uploadTeacherAvatar,
  uploadTeacherVideo,
  type TeacherProfileResponse,
} from "@/lib/api/teacher-profile";
import { isApiConfigured } from "@/lib/is-api-configured";

const tabs = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "teacher", label: "Teacher Profile", Icon: Video },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "security", label: "Security", Icon: Lock },
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass =
  "border border-line rounded-[10px] px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold focus:bg-white transition-colors w-full";
const labelClass = "text-[12.5px] font-semibold text-ink70";

export default function TeacherSettingsView() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Teacher profile form state
  const [teacherFormData, setTeacherFormData] = useState({
    subject: "",
    level: "",
    teachingLanguage: "english" as "english" | "german",
    bio: "",
    videoUrl: "",
  });

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }

    getTeacherProfile()
      .then((data) => {
        setProfile(data);
        setTeacherFormData({
          subject: data.subject,
          level: data.level,
          teachingLanguage: data.teachingLanguage,
          bio: data.bio,
          videoUrl: data.videoUrl || "",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setError(null);
    try {
      const result = await uploadTeacherVideo(file);
      setTeacherFormData({ ...teacherFormData, videoUrl: result.videoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);
    try {
      const result = await uploadTeacherAvatar(file);
      if (profile) {
        setProfile({ ...profile, avatarUrl: result.avatarUrl });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleTeacherProfileSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTeacherProfile({
        subject: teacherFormData.subject,
        level: teacherFormData.level,
        teachingLanguage: teacherFormData.teachingLanguage,
        bio: teacherFormData.bio,
        videoUrl: teacherFormData.videoUrl,
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted text-[13.5px]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4 text-[13.5px]">
          {error}
        </div>
      )}

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
                This information is visible to your students and colleagues.
              </p>

              <div className="flex items-center gap-4 mb-6.5 pb-6.5 border-b border-line" style={{ marginBottom: 26, paddingBottom: 26 }}>
                <Image
                  src={profile?.avatarUrl || "https://i.pravatar.cc/120?img=13"}
                  alt={profile?.fullName || "Teacher"}
                  width={66}
                  height={66}
                  className="rounded-full object-cover"
                />
                <div className="flex gap-2.5">
                  <label className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold hover:border-ink transition-colors cursor-pointer flex items-center gap-2">
                    <Upload size={14} />
                    Upload new photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  <button className="bg-white border border-danger/30 text-danger px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold">
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-4.5" style={{ gap: 18 }}>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Full name</label>
                  <input defaultValue={profile?.fullName || ""} className={fieldClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email address</label>
                  <input type="email" dir="ltr" defaultValue={profile?.email || ""} className={fieldClass} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelClass}>Time zone</label>
                  <select className={fieldClass} defaultValue="CET">
                    <option value="CET">Central European Time (CET)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="ET">Eastern Time (ET)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold">
                  Cancel
                </button>
                <button className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors">
                  Save changes
                </button>
              </div>
            </div>
          )}

          {tab === "teacher" && (
            <div className="bg-white border border-line rounded-lg shadow-card p-5 sm:p-7">
              <h3 className="text-[18px] font-semibold mb-1">Teacher Profile</h3>
              <p className="text-muted text-[13px] mb-6">
                Information about your teaching expertise and style.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Subject / Specialty</label>
                  <input
                    type="text"
                    value={teacherFormData.subject}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, subject: e.target.value })}
                    className={fieldClass}
                    placeholder="e.g., Speaking & Conversation, Grammar"
                  />
                </div>

                <div>
                  <label className={labelClass}>Teaching Level</label>
                  <input
                    type="text"
                    value={teacherFormData.level}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, level: e.target.value })}
                    className={fieldClass}
                    placeholder="e.g., A1 - C1, Beginner to Advanced"
                  />
                </div>

                <div>
                  <label className={labelClass}>Teaching Language</label>
                  <select
                    value={teacherFormData.teachingLanguage}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        teachingLanguage: e.target.value as "english" | "german",
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="english">English</option>
                    <option value="german">German</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Teacher Bio</label>
                  <textarea
                    value={teacherFormData.bio}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, bio: e.target.value })}
                    className={fieldClass}
                    rows={4}
                    placeholder="Tell students about your teaching style, experience, and what makes your classes special..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Introduction Video</label>
                  <div className="space-y-3">
                    {teacherFormData.videoUrl && (
                      <div className="relative rounded-lg overflow-hidden bg-ink/5">
                        <video
                          src={teacherFormData.videoUrl}
                          controls
                          className="w-full max-h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setTeacherFormData({ ...teacherFormData, videoUrl: "" })}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                        >
                          <X size={16} className="text-danger" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center gap-2.5 bg-white border border-line px-4 py-3 rounded-xl text-[13.5px] font-semibold hover:border-ink transition-colors cursor-pointer">
                      <Video size={16} />
                      {teacherFormData.videoUrl ? "Change video" : "Upload introduction video"}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="hidden"
                      />
                    </label>
                    {uploadingVideo && (
                      <div className="text-[12.5px] text-muted">Uploading video...</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold">
                  Cancel
                </button>
                <button
                  onClick={handleTeacherProfileSave}
                  disabled={saving}
                  className="bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep transition-colors disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
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
                { title: "New student bookings", desc: "Notify me when a student books a class.", on: true },
                { title: "Student messages", desc: "Notify me when a student sends a message.", on: true },
                { title: "Assignment submissions", desc: "Notify me when students submit assignments.", on: true },
                { title: "Product news & tips", desc: "Occasional emails about new features.", on: false }
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
                    This permanently removes your profile, classes, and students.
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
    </div>
  );
}
