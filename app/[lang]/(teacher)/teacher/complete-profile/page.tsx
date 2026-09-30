"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { completeTeacherProfile, uploadTeacherAvatar } from "@/lib/api/teacher-profile";
import { getName } from "@/lib/auth-client";
import { isApiConfigured } from "@/lib/is-api-configured";

const SUBJECT_OPTIONS = [
  "Speaking & Conversation",
  "Grammar",
  "Business English",
  "IELTS Preparation",
  "TOEFL Preparation",
  "Academic Writing",
  "Pronunciation",
  "English for Kids",
  "English for Professionals",
  "Exam Preparation",
  "General English",
] as const;

const LEVEL_OPTIONS = [
  "A1 - Beginner",
  "A2 - Elementary",
  "B1 - Intermediate",
  "B2 - Upper Intermediate",
  "C1 - Advanced",
  "C2 - Proficiency",
  "All Levels",
] as const;

export default function TeacherCompleteProfilePage() {
  const { t, href } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    level: "",
    teachingLanguage: "english" as "english" | "german",
    bio: "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);
    try {
      const result = await uploadTeacherAvatar(file);
      setAvatarUrl(result.avatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isApiConfigured()) {
      setError("Backend API is not configured. Please contact support.");
      return;
    }

    setLoading(true);
    try {
      await completeTeacherProfile({
        ...formData,
        avatarUrl: avatarUrl || undefined,
      });
      router.push(href("/teacher"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="mb-6">
        <h2 className="font-serif text-[26px] font-semibold mb-2">
          Complete Your Teacher Profile
        </h2>
        <p className="text-muted text-[14px]">
          Tell us about your teaching expertise so students can find you.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4 text-[13.5px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg shadow-card p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-ink/5">
                {avatarUrl ? (
                  <>
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(null)}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full p-1 shadow-lg"
                    >
                      <X size={14} className="text-danger" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-[12px]">
                    No photo
                  </div>
                )}
              </div>
              <label className="bg-white border border-line text-ink px-3.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold hover:border-ink transition-colors cursor-pointer flex items-center gap-2">
                <Upload size={14} />
                {uploadingAvatar ? "Uploading..." : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Subject / Specialty
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue text-[13.5px]"
              required
            >
              <option value="">Select a subject</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Teaching Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue text-[13.5px]"
              required
            >
              <option value="">Select a level</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Teaching Language
            </label>
            <select
              value={formData.teachingLanguage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teachingLanguage: e.target.value as "english" | "german",
                })
              }
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue text-[13.5px]"
            >
              <option value="english">English</option>
              <option value="german">German</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about your teaching style, experience, and what makes your classes special..."
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue h-32 resize-none text-[13.5px]"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-blueDeep transition-colors disabled:opacity-70"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push(href("/teacher"))}
          className="text-[13px] text-muted hover:text-ink transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
