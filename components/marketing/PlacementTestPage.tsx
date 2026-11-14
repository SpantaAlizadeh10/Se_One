"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getPlacementLevel,
  getPlacementSkillSummary,
  getPlacementScore,
  placementQuestions,
} from "@/lib/placement-test";

export default function PlacementTestPage() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<{
    score: number;
    level: string;
    skills: ReturnType<typeof getPlacementSkillSummary>;
  } | null>(null);
  const question = placementQuestions[questionIndex];

  const continueTest = () => {
    if (selectedAnswer === null) return;
    const nextAnswers = [...answers, selectedAnswer];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);

    if (questionIndex === placementQuestions.length - 1) {
      const score = getPlacementScore(nextAnswers);
      setResult({
        score,
        level: getPlacementLevel(nextAnswers),
        skills: getPlacementSkillSummary(nextAnswers),
      });
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const restartTest = () => {
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setResult(null);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-9">
        {result ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sageDeep">
              <CheckCircle2 size={28} />
            </span>
            <p className="mb-2 text-sm font-semibold text-blue">
              {fa ? "نتیجهٔ آزمون تعیین سطح" : "Your placement test result"}
            </p>
            <h1 className="mb-3 text-3xl font-bold">
              {fa
                ? `سطح مناسب شما ${result.level} است`
                : `Your recommended level is ${result.level}`}
            </h1>
            <p className="mb-7 text-sm text-ink70">
              {fa
                ? `از ${placementQuestions.length} پرسش، به ${result.score} پرسش پاسخ درست دادید. این نتیجه فقط بر پایهٔ مهارت‌های نوشتاری است و مهارت گفتاری و شنیداری را نمی‌سنجد.`
                : `You answered ${result.score} of ${placementQuestions.length} questions correctly. This is a written estimate and does not assess speaking or listening.`}
            </p>
            <div className="mx-auto mb-7 grid max-w-lg grid-cols-3 gap-2">
              {result.skills.map(({ skill, correct, total }) => (
                <div
                  key={skill}
                  className="rounded-xl bg-cream px-3 py-3 text-center"
                >
                  <p className="mb-1 text-[11px] font-medium text-muted">
                    {fa
                      ? skill === "grammar"
                        ? "گرامر"
                        : skill === "vocabulary"
                          ? "واژگان"
                          : "درک مطلب"
                      : skill === "grammar"
                        ? "Grammar"
                        : skill === "vocabulary"
                          ? "Vocabulary"
                          : "Reading"}
                  </p>
                  <p className="m-0 text-sm font-bold">
                    {correct}/{total}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={href(`/courses?search=${result.level}`)}
                className="inline-flex items-center gap-2 rounded-full bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blueDeep"
              >
                {fa ? "دیدن دوره‌های این سطح" : "Explore courses at this level"}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
              <button
                type="button"
                onClick={restartTest}
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink70 hover:bg-surface"
              >
                <RotateCcw size={15} />
                {fa ? "شرکت دوباره در آزمون" : "Retake test"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <Sparkles size={21} />
              </span>
              <div>
                <h1 className="mb-1 text-xl font-bold">
                  {fa ? "آزمون رایگان تعیین سطح انگلیسی" : "Free English placement test"}
                </h1>
                <p className="m-0 text-sm leading-6 text-ink70">
                  {fa
                    ? "به ۲۵ پرسش گرامر، واژگان و درک مطلب پاسخ دهید. تکمیل آزمون حدود ۶ تا ۸ دقیقه زمان می‌برد."
                    : "Answer 25 grammar, vocabulary, and reading questions. The test takes about 6–8 minutes."}
                </p>
              </div>
            </div>

            <div
              className="mb-6 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={placementQuestions.length}
              aria-valuenow={questionIndex + 1}
            >
              <div
                className="h-full rounded-full bg-blue transition-all"
                style={{
                  width: `${((questionIndex + 1) / placementQuestions.length) * 100}%`,
                }}
              />
            </div>

            <p className="mb-2 text-xs font-semibold text-muted">
              {fa
                ? `پرسش ${questionIndex + 1} از ${placementQuestions.length}`
                : `Question ${questionIndex + 1} of ${placementQuestions.length}`}
            </p>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-blue">
              {fa
                ? question.skill === "grammar"
                  ? "گرامر"
                  : question.skill === "vocabulary"
                    ? "واژگان"
                    : "درک مطلب"
                : question.skill}
            </p>
            <h2 className="mb-5 text-lg font-semibold" dir="ltr">
              {question.prompt}
            </h2>
            <div className="grid gap-3" dir="ltr">
              {question.options.map((option, index) => (
                <button
                  type="button"
                  key={option}
                  aria-pressed={selectedAnswer === index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    selectedAnswer === index
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-line hover:border-blue/40"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                disabled={selectedAnswer === null}
                onClick={continueTest}
                className="inline-flex items-center gap-2 rounded-full bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {questionIndex === placementQuestions.length - 1
                  ? fa
                    ? "دیدن نتیجه"
                    : "See result"
                  : fa
                    ? "پرسش بعد"
                    : "Next question"}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
