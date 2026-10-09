"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  LoaderCircle,
  Send,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getPractice,
  startAttempt,
  submitAttempt,
  type PracticeAttempt,
  type PracticeContent,
} from "@/lib/api/practice";

export default function PracticeAttemptPage() {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const params = useParams<{ practiceId: string }>();
  const practiceId = Array.isArray(params.practiceId)
    ? params.practiceId[0]
    : params.practiceId;
  const [practice, setPractice] = useState<PracticeContent | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PracticeAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPractice(practiceId)
      .then((data) => {
        if (active) setPractice(data);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : fa
                ? "تمرین پیدا نشد."
                : "Practice not found.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fa, practiceId]);

  const begin = async () => {
    if (!practice) return;
    setStarting(true);
    setError("");
    try {
      const started = await startAttempt({ practiceId: practice.id });
      if (!started.attemptId)
        throw new Error(
          fa
            ? "شناسه تلاش از سرور دریافت نشد."
            : "The server did not return an attempt ID.",
        );
      setAttemptId(started.attemptId);
      setPractice(started.practice || practice);
      setAnswers({});
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "شروع تمرین ناموفق بود."
            : "Could not start this practice.",
      );
    } finally {
      setStarting(false);
    }
  };

  const finish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!practice || !attemptId || submitting) return;
    const unanswered = practice.questions.find(
      (question) => !answers[question.id]?.trim(),
    );
    if (unanswered) {
      setError(
        fa
          ? "لطفاً به همه پرسش‌ها پاسخ بده."
          : "Please answer every question before submitting.",
      );
      document
        .getElementById(`question-${unanswered.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const completed = await submitAttempt(attemptId, {
        answers: practice.questions.map((question) => ({
          questionId: question.id,
          userAnswer: answers[question.id] || "",
        })),
      });
      setResult(completed);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fa
            ? "ثبت پاسخ‌ها ناموفق بود."
            : "Could not submit your answers.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-[13px] text-muted">
        <LoaderCircle size={18} className="animate-spin" />
        {fa ? "در حال آماده‌سازی تمرین…" : "Loading practice…"}
      </div>
    );
  if (!practice)
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 text-center">
        <p role="alert" className="text-[13px] text-danger">
          {error ||
            (fa ? "تمرین بارگذاری نشد." : "Could not load this practice.")}
        </p>
        <Link
          href={href("/dashboard/practice")}
          className="text-[12px] font-semibold text-blue"
        >
          {fa ? "بازگشت به تمرین‌ها" : "Back to practice"}
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={href("/dashboard/practice")}
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-blue"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {fa ? "همه تمرین‌ها" : "All practice"}
      </Link>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
        <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="rounded-full bg-blue/10 px-2.5 py-1 text-blue">
            {practice.level}
          </span>
          <span className="rounded-full bg-sage px-2.5 py-1 text-sageDeep">
            {practice.category}
          </span>
          {practice.timeLimit && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-muted">
              <Clock3 size={12} />
              {Math.ceil(practice.timeLimit / 60)} {fa ? "دقیقه" : "min"}
            </span>
          )}
        </div>
        <h1 className="mb-2 mt-0 text-[22px] font-semibold">
          {practice.title}
        </h1>
        <p className="m-0 text-[13px] leading-6 text-muted">
          {practice.description}
        </p>
        {result ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-sage/60 p-5 text-center">
              <CheckCircle2 size={27} className="mx-auto mb-2 text-sageDeep" />
              <p className="m-0 text-[13px] font-semibold">
                {fa
                  ? "آفرین! تمرینت کامل شد."
                  : "Nice work! Practice completed."}
              </p>
              <strong className="mt-2 block text-3xl">
                {Math.round(result.percentage)}%
              </strong>
              <span className="text-[11px] text-muted">
                {result.score} / {result.maxScore} {fa ? "امتیاز" : "points"}
              </span>
              <p className="mb-0 mt-2 text-[11px]">
                {result.passed
                  ? fa
                    ? "حدنصاب را گرفتی؛ همین‌طور ادامه بده."
                    : "You passed. Keep it up!"
                  : fa
                    ? "یک بار دیگر تمرین کن تا بهتر شوی."
                    : "Try again to improve your score."}
              </p>
            </div>
            <div className="space-y-3">
              {practice.questions.map((question, index) => {
                const response = result.answers.find(
                  (answer) => answer.questionId === question.id,
                );
                return (
                  <article
                    key={question.id}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={
                          response?.isCorrect
                            ? "text-sageDeep"
                            : "text-goldDeep"
                        }
                      >
                        {response?.isCorrect ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Circle size={17} />
                        )}
                      </span>
                      <div>
                        <h3 className="m-0 text-[12px] font-semibold">
                          {index + 1}. {question.question}
                        </h3>
                        <p className="mb-0 mt-1 text-[11px] text-muted">
                          {fa ? "پاسخ تو" : "Your answer"}:{" "}
                          {response?.userAnswer || "—"}
                        </p>
                        {question.explanation && (
                          <p className="mb-0 mt-2 text-[11px] leading-5">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setAttemptId("");
                setAnswers({});
              }}
              className="w-full rounded-xl bg-blue px-4 py-3 text-[12px] font-semibold text-white hover:bg-blueDeep"
            >
              {fa ? "تمرین دوباره" : "Practice again"}
            </button>
          </div>
        ) : !attemptId ? (
          <div className="mt-6 rounded-xl bg-cream/70 p-4">
            <p className="mb-3 mt-0 text-[12px]">
              {fa
                ? `این تمرین ${practice.questions.length} پرسش دارد. پاسخ‌ها پس از ارسال بررسی می‌شوند.`
                : `This practice has ${practice.questions.length} questions. Your answers are checked after submission.`}
            </p>
            <button
              type="button"
              onClick={() => void begin()}
              disabled={starting || practice.questions.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {starting && <LoaderCircle size={15} className="animate-spin" />}
              {fa ? "شروع تمرین" : "Start practice"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => void finish(event)}
            className="mt-5 space-y-4"
          >
            {practice.questions.map((question, index) => (
              <fieldset
                key={question.id}
                id={`question-${question.id}`}
                className="rounded-xl border border-line p-4 sm:p-5"
              >
                <legend className="px-1 text-[12px] font-semibold">
                  {index + 1}. {question.question}
                </legend>
                {question.options?.length ? (
                  <div className="mt-2 space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[12px] transition-colors ${answers[question.id] === option ? "border-blue bg-blue/5" : "border-line hover:bg-cream"}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: option,
                            }))
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    value={answers[question.id] || ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-line px-3 py-2.5 text-[12px] outline-none focus:border-blue"
                    placeholder={fa ? "پاسخت را بنویس…" : "Type your answer…"}
                  />
                )}
              </fieldset>
            ))}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-danger/10 p-3 text-[11px] text-danger"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-[12px] font-semibold text-white hover:bg-blueDeep disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {fa ? "بررسی پاسخ‌ها" : "Check answers"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
