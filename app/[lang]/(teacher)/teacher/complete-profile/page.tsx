"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { completeTeacherProfile } from "@/lib/api/teacher-profile";
import { getName } from "@/lib/auth-client";
import { isApiConfigured } from "@/lib/is-api-configured";

export default function TeacherCompleteProfilePage() {
  const { t, href } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    level: "",
    teachingLanguage: "english" as "english" | "german",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isApiConfigured()) {
      setError("Backend API is not configured. Please contact support.");
      return;
    }

    setLoading(true);
    try {
      await completeTeacherProfile(formData);
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
              Subject / Specialty
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Speaking & Conversation, Grammar, Business English"
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue text-[13.5px]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Teaching Level
            </label>
            <input
              type="text"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              placeholder="e.g., A1 - C1, Beginner to Advanced"
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue text-[13.5px]"
              required
            />
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
