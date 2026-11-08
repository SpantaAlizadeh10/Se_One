"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getPlacementLevel,
  getPlacementScore,
  placementQuestions,
} from "@/lib/placement-test";

export default function PlacementTestPage() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; level: string } | null>(
    null,
  );
  const question = placementQuestions[questionIndex];

  const continueTest = () => {
    if (selectedAnswer === null) return;
    const nextAnswers = [...answers, selectedAnswer];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);

    if (questionIndex === placementQuestions.length - 1) {
      const score = getPlacementScore(nextAnswers);
      setResult({ score, level: getPlacementLevel(score) });
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
              {fa ? "نتیجه آزمون تعیین سطح" : "Your placement test result"}
            </p>
            <h1 className="mb-3 text-3xl font-bold">
              {fa ? `سطح پیشنهادی شما ${result.level} است` : `Your recommended level is ${result.level}`}
            </h1>
            <p className="mb-7 text-sm text-ink70">
              {fa
                ? `شما ${result.score} پاسخ درست از ${placementQuestions.length} پرسش داشتید. برای دیدن دوره‌های این سطح، فهرست دوره‌ها را ببینید.`
                : `You answered ${result.score} of ${placementQuestions.length} questions correctly. Explore courses at this level.`}
            </p>
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
                {fa ? "آزمون دوباره" : "Retake test"}
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
                    ? "به ۱۰ پرسش کوتاه پاسخ دهید تا سطح پیشنهادی‌تان را ببینید."
                    : "Answer 10 short questions to get a recommended English level."}
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
                    ? "پرسش بعدی"
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
