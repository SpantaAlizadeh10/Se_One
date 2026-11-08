"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/lib/api/settings";
import {
  getPlacementLevel,
  getPlacementScore,
  placementQuestions,
} from "@/lib/placement-test";

const ASSESSMENT_VERSION = "cefr-written-v2";

export default function StudentPlacementTest() {
  const { lang } = useLanguage();
  const fa = lang === "fa";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [open, setOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getUserProfile()
      .then((loaded) => {
        if (active) setProfile(loaded);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "اطلاعات پروفایل بارگذاری نشد."
                : "Could not load your profile.",
          );
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => {
      active = false;
    };
  }, [fa]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, saving]);

  const startTest = () => {
    setAnswers([]);
    setQuestionIndex(0);
    setError("");
    setOpen(true);
  };

  const submitTest = async (nextAnswers: number[]) => {
    const score = getPlacementScore(nextAnswers);
    const level = getPlacementLevel(nextAnswers);
    const placementTestResult = {
      score,
      maxScore: placementQuestions.length,
      completedAt: new Date().toISOString(),
      assessmentVersion: ASSESSMENT_VERSION,
    };
    setSaving(true);
    setError("");
    try {
      const saved = await updateUserProfile({
        level,
        placementTestResult,
      });
      setProfile({
        ...profile,
        ...saved,
        level,
        placementTestResult,
      });
      setOpen(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "نتیجه ذخیره نشد. دوباره تلاش کنید."
            : "Could not save your result. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile || !profile) {
    if (loadingProfile) return null;
    return error ? (
      <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-[12px] text-danger">
        {error}
      </p>
    ) : null;
  }

  return (
    <>
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue/15 bg-gradient-to-r from-[#EEF3FF] via-white to-[#EAF5F1] p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
            {profile.level ? <CheckCircle2 size={19} /> : <Sparkles size={19} />}
          </span>
          <div>
            <h2 className="mb-1 mt-0 text-[14px] font-semibold">
              {profile.placementTestResult
                ? fa
                  ? `سطح پیشنهادی شما: ${profile.level}`
                  : `Your recommended level: ${profile.level}`
                : profile.level
                  ? fa
                    ? `سطح ثبت‌شده شما: ${profile.level}`
                    : `Your recorded level: ${profile.level}`
                  : fa
                    ? "سطح زبان انگلیسی‌ات را پیدا کن"
                    : "Find your English level"}
            </h2>
            <p className="m-0 text-[11px] leading-5 text-muted">
              {profile.placementTestResult
                ? fa
                  ? `نتیجه: ${profile.placementTestResult.score} از ${profile.placementTestResult.maxScore} پاسخ درست · سنجش نوشتاری`
                  : `Result: ${profile.placementTestResult.score}/${profile.placementTestResult.maxScore} correct · written assessment`
                : fa
                  ? "در یک آزمون چندبخشی شرکت کن تا سطح پیشنهادی در پروفایلت ذخیره شود."
                  : "Take a multi-skill test to save your recommended level to your profile."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startTest}
          className="shrink-0 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-blueDeep"
        >
          {profile.level
            ? fa
              ? "انجام دوباره آزمون"
              : "Retake test"
            : fa
              ? "شروع تعیین سطح"
              : "Start placement test"}
        </button>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="placement-test-title"
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
          >
            <header className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="placement-test-title" className="m-0 text-[17px] font-semibold">
                  {fa ? "آزمون تعیین سطح انگلیسی" : "English placement test"}
                </h2>
                <p className="mb-0 mt-1 text-[11px] text-muted">
                  {fa
                    ? `پرسش ${questionIndex + 1} از ${placementQuestions.length}`
                    : `Question ${questionIndex + 1} of ${placementQuestions.length}`}
                </p>
                <p className="mb-0 mt-1 text-[10px] text-muted">
                  {fa
                    ? "حدود ۶ تا ۸ دقیقه · دستور زبان، واژگان و درک مطلب"
                    : "About 6–8 minutes · grammar, vocabulary, and reading"}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpen(false)}
                aria-label={fa ? "بستن" : "Close"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </header>
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-cream">
              <div
                className="h-full rounded-full bg-blue transition-all"
                style={{
                  width: `${((questionIndex + 1) / placementQuestions.length) * 100}%`,
                }}
              />
            </div>
            <p className="mb-4 text-[15px] font-semibold leading-6" dir="ltr">
              {placementQuestions[questionIndex].prompt}
            </p>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-blue">
              {fa
                ? placementQuestions[questionIndex].skill === "grammar"
                  ? "دستور زبان"
                  : placementQuestions[questionIndex].skill === "vocabulary"
                    ? "واژگان"
                    : "درک مطلب"
                : placementQuestions[questionIndex].skill}
            </p>
            <div className="space-y-2">
              {placementQuestions[questionIndex].options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setAnswers((current) => {
                      const next = [...current];
                      next[questionIndex] = index;
                      return next;
                    })
                  }
                  className={`w-full rounded-xl border px-3.5 py-3 text-start text-[13px] transition-colors ${
                    answers[questionIndex] === index
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-line hover:bg-cream"
                  }`}
                  dir="ltr"
                >
                  {option}
                </button>
              ))}
            </div>
            {error && (
              <p role="alert" className="mb-0 mt-4 rounded-lg bg-danger/10 p-2.5 text-[11px] text-danger">
                {error}
              </p>
            )}
            <footer className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={answers[questionIndex] === undefined || saving}
                onClick={() => {
                  if (                  questionIndex < placementQuestions.length - 1) {
                    setQuestionIndex((current) => current + 1);
                    return;
                  }
                  void submitTest(answers);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {saving && <LoaderCircle size={15} className="animate-spin" />}
                {saving
                  ? fa
                    ? "در حال ذخیره…"
                    : "Saving…"
                  : questionIndex === placementQuestions.length - 1
                    ? fa
                      ? "ثبت نتیجه"
                      : "Save result"
                    : fa
                      ? "پرسش بعدی"
                      : "Next question"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
