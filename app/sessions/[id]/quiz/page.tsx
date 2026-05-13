// app/sessions/[id]/quiz/page.tsx
//
// Quiz interface per the brief:
//   – One question per screen (no other distractions)
//   – Top progress bar "Question 3 of 9"
//   – No backwards navigation once submitted
//   – MC: 4 radio options + Submit answer
//   – Short-answer: textarea with soft 150-char min
//   – No timer
//
// After submission:
//   PASS (≥ passMark): congrats + full review of every question
//   FAIL:              "Not yet — you scored X%". Topic summary of misses
//                      (no correct answers leaked). Retry button.

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RepPicker from "@/components/sessions/RepPicker";
import SessionsHeader from "@/components/sessions/SessionsHeader";
import { getSessionById, getQuiz } from "@/data/sessions";
import { useSessionsProgress } from "@/hooks/useSessionsProgress";
import {
  MultipleChoiceQuestion,
  QuizAttempt,
  QuizQuestion,
  ShortAnswerQuestion,
} from "@/types/sessions";

// ─── Grading ────────────────────────────────────────────────────────────────

function isMCCorrect(q: MultipleChoiceQuestion, answer: number) {
  return answer === q.correctAnswer;
}

function isShortAnswerCorrect(q: ShortAnswerQuestion, answer: string) {
  const text = answer.toLowerCase();
  const hits = q.keywords.filter((k) => text.includes(k.toLowerCase())).length;
  return hits >= q.keywordsRequired;
}

function gradeAttempt(
  questions: QuizQuestion[],
  answers: Record<string, number | string>
) {
  // Pass-mark is calculated on MC questions ONLY. Short-answer responses are
  // recorded and reviewed manually by the trainer — they don't influence
  // pass/fail. We still mark them "correct" for the keyword-hit indicator
  // shown on the review screen, but the score below ignores them.
  let mcCorrect = 0;
  let mcTotal = 0;
  const perQuestion: { id: string; correct: boolean }[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    let correct = false;
    if (q.type === "multiple-choice" && typeof a === "number") {
      correct = isMCCorrect(q, a);
      mcTotal++;
      if (correct) mcCorrect++;
    } else if (q.type === "short-answer" && typeof a === "string") {
      correct = isShortAnswerCorrect(q, a);
    }
    perQuestion.push({ id: q.id, correct });
  }
  const score = mcTotal === 0 ? 0 : Math.round((mcCorrect / mcTotal) * 100);
  return { score, correctCount: mcCorrect, perQuestion };
}

// ─── Component ──────────────────────────────────────────────────────────────

function QuizInner() {
  const params = useParams<{ id: string }>();

  const session = getSessionById(params.id);
  const quiz = session ? getQuiz(session) : undefined;

  const [repSlug, setRepSlug] = useState<string | null>(null);
  const [repName, setRepName] = useState<string>("");
  const { data, recordQuizAttempt, hydrated } = useSessionsProgress(repSlug);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [pendingMC, setPendingMC] = useState<number | null>(null);
  const [pendingSA, setPendingSA] = useState<string>("");
  const [submittedAttempt, setSubmittedAttempt] =
    useState<QuizAttempt | null>(null);

  if (!session || !quiz || quiz.kind !== "quiz") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 font-semibold">Quiz not found.</p>
          <Link href="/sessions" className="text-[#1F3A5F] underline mt-2 inline-block">
            Back to sessions
          </Link>
        </div>
      </main>
    );
  }

  if (!repSlug) {
    return (
      <RepPicker
        onSelected={(slug, name) => {
          setRepSlug(slug);
          setRepName(name);
        }}
      />
    );
  }

  const questions = quiz.questions;
  const total = questions.length;
  const cur = questions[currentIdx];
  const isLast = currentIdx === total - 1;

  // ─── Already passed: show review of best attempt instead of restarting ──
  const progress = data.sessions[session.id];
  const passedAttempt = progress?.quizAttempts.find((a) => a.passed);

  if (passedAttempt && !submittedAttempt) {
    return (
      <ResultScreen
        session={session}
        quiz={quiz}
        attempt={passedAttempt}
        repName={repName}
      />
    );
  }

  // ─── Submitting current question and advancing ─────────────────────────
  const submitCurrent = () => {
    let value: number | string | null = null;
    if (cur.type === "multiple-choice") {
      if (pendingMC === null) return;
      value = pendingMC;
    } else {
      if (!pendingSA.trim()) return;
      value = pendingSA;
    }
    const nextAnswers = { ...answers, [cur.id]: value };
    setAnswers(nextAnswers);
    setPendingMC(null);
    setPendingSA("");

    if (isLast) {
      // Final submit — grade and persist
      const { score } = gradeAttempt(questions, nextAnswers);
      const attempt: QuizAttempt = {
        attemptedAt: new Date().toISOString(),
        score,
        passed: score >= quiz.passMark,
        answers: nextAnswers,
      };
      recordQuizAttempt(session.id, attempt);
      setSubmittedAttempt(attempt);

      // Mirror to Airtable so trainers can see attempts. We don't block
      // the UI on this — if the request fails the localStorage record is
      // still authoritative for the rep's pass/fail experience.
      const attemptNumber = (progress?.quizAttempts.length ?? 0) + 1;

      // Format short answers as a readable text block. This populates the
      // dedicated `short_answers` Airtable column so trainers can read
      // responses at a glance without expanding the answers_json blob.
      const shortAnswersText = questions
        .filter((q) => q.type === "short-answer")
        .map((q, i) => {
          const ans = nextAnswers[q.id];
          return `Q${i + 1} — ${q.prompt}\n\n${
            typeof ans === "string" ? ans : "(no answer)"
          }`;
        })
        .join("\n\n———\n\n");

      fetch("/api/sessions/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repSlug,
          repName,
          sessionId: session.id,
          sessionNumber: session.number,
          sessionTitle: session.title,
          score,
          passed: attempt.passed,
          attemptNumber,
          submittedAt: attempt.attemptedAt,
          answers: nextAnswers,
          shortAnswers: shortAnswersText,
        }),
      }).catch((err) => {
        // Network errors silently logged — see /api logs for server errors.
        console.error("Quiz submission failed", err);
      });
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  // ─── Result screen ─────────────────────────────────────────────────────
  const handleTryAgain = () => {
    setSubmittedAttempt(null);
    setAnswers({});
    setCurrentIdx(0);
    setPendingMC(null);
    setPendingSA("");
  };

  if (submittedAttempt) {
    return (
      <ResultScreen
        session={session}
        quiz={quiz}
        attempt={submittedAttempt}
        repName={repName}
        onTryAgain={handleTryAgain}
      />
    );
  }

  // ─── Question screen ───────────────────────────────────────────────────
  if (!hydrated) return null;

  const pct = Math.round(((currentIdx + 1) / total) * 100);
  const canSubmit =
    cur.type === "multiple-choice"
      ? pendingMC !== null
      : pendingSA.trim().length > 0;
  const softMin = cur.type === "short-answer" ? cur.softMinChars ?? 150 : 0;
  const charsTyped = pendingSA.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <SessionsHeader
        repName={repName}
        breadcrumb={`Session ${session.number} · Quiz`}
      />

      {/* Top progress bar */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold">
            Question {currentIdx + 1} of {total}
          </span>
          <span>{quiz.passMark}% to pass</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1F3A5F] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-xs font-bold tracking-wider text-slate-400 mb-3">
            {cur.topic.toUpperCase()}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-6">
            {cur.prompt}
          </h2>

          {cur.type === "multiple-choice" ? (
            <fieldset className="space-y-3">
              <legend className="sr-only">Choose one</legend>
              {cur.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    pendingMC === i
                      ? "border-[#1F3A5F] bg-[#1F3A5F]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={pendingMC === i}
                    onChange={() => setPendingMC(i)}
                    className="mt-1 accent-[#1F3A5F]"
                  />
                  <span className="text-slate-800">{opt}</span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div>
              <textarea
                value={pendingSA}
                onChange={(e) => setPendingSA(e.target.value)}
                rows={6}
                placeholder="Write your answer..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] outline-none resize-y"
              />
              <div
                className={`text-xs mt-2 ${
                  charsTyped < softMin ? "text-slate-400" : "text-[#3C8055]"
                }`}
              >
                {charsTyped < softMin
                  ? `${charsTyped} / ~${softMin} characters`
                  : `${charsTyped} characters · plenty to work with`}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {isLast
                ? "This is your final answer — once you submit, the quiz is graded."
                : "You can't go back to change earlier answers."}
            </p>
            <button
              onClick={submitCurrent}
              disabled={!canSubmit}
              className="px-5 py-2.5 text-sm font-bold bg-[#1F3A5F] text-white rounded-lg hover:bg-[#172d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLast ? "Submit quiz →" : "Submit answer →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Result screen ──────────────────────────────────────────────────────────

function ResultScreen({
  session,
  quiz,
  attempt,
  repName,
  onTryAgain,
}: {
  session: ReturnType<typeof getSessionById> & {};
  quiz: ReturnType<typeof getQuiz> & {};
  attempt: QuizAttempt;
  repName: string;
  onTryAgain?: () => void;
}) {
  if (!session || !quiz || quiz.kind !== "quiz") return null;

  const { perQuestion } = gradeAttempt(quiz.questions, attempt.answers);
  const passed = attempt.passed;
  const score = attempt.score;

  const missedTopics = perQuestion
    .filter((p) => !p.correct)
    .map((p) => quiz.questions.find((q) => q.id === p.id)!.topic);
  const missedTopicCounts = missedTopics.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <SessionsHeader
        repName={repName}
        breadcrumb={`Session ${session.number} · Quiz`}
      />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Headline */}
        <div
          className={`rounded-2xl p-8 text-white shadow-sm mb-6 ${
            passed
              ? "bg-gradient-to-br from-[#3C8055] to-[#2d6342]"
              : "bg-gradient-to-br from-[#1F3A5F] to-[#172d4a]"
          }`}
        >
          <div className="text-xs font-bold tracking-wider text-white/70 mb-2">
            {passed ? "QUIZ COMPLETE" : "NOT YET"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {passed
              ? `Smashed it, ${repName.split(" ")[0]}.`
              : `You scored ${score}%.`}
          </h1>
          <p className="text-white/90">
            {passed
              ? `You scored ${score}% on this attempt. Session ${session.number} is now marked complete.`
              : `You need ${quiz.passMark}% to pass. Review the topics below, then take it again — unlimited retries.`}
          </p>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap gap-2 mb-8">
          {passed ? (
            <>
              <Link
                href={`/sessions/${session.id}`}
                className="px-4 py-2 text-sm font-semibold bg-[#1F3A5F] text-white rounded-lg hover:bg-[#172d4a]"
              >
                Back to session
              </Link>
              <Link
                href="/sessions"
                className="px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400"
              >
                All sessions
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={onTryAgain}
                disabled={!onTryAgain}
                className="px-4 py-2 text-sm font-semibold bg-[#D49A30] text-white rounded-lg hover:bg-[#bb8527] disabled:opacity-50"
              >
                Try again →
              </button>
              <Link
                href={`/sessions/${session.id}`}
                className="px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400"
              >
                Back to assets
              </Link>
            </>
          )}
        </div>

        {/* Pass: full review. Fail: topic summary only. */}
        {passed ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Full answer review</h2>
            <div className="space-y-6">
              {quiz.questions.map((q, i) => {
                const yours = attempt.answers[q.id];
                const correct = perQuestion.find((p) => p.id === q.id)!.correct;
                return (
                  <div key={q.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                    <div className="text-xs font-bold tracking-wider text-slate-400 mb-1">
                      Q{i + 1} · {q.topic}
                    </div>
                    <p className="font-medium text-slate-900 mb-3">
                      {q.prompt}
                    </p>
                    {q.type === "multiple-choice" ? (
                      <div className="space-y-1.5 mb-3">
                        {q.options.map((opt, idx) => {
                          const isYours = yours === idx;
                          const isCorrect = q.correctAnswer === idx;
                          return (
                            <div
                              key={idx}
                              className={`text-sm px-3 py-1.5 rounded-md ${
                                isCorrect
                                  ? "bg-[#3C8055]/10 text-[#3C8055] font-medium"
                                  : isYours
                                  ? "bg-[#B14545]/10 text-[#B14545]"
                                  : "text-slate-600"
                              }`}
                            >
                              {isCorrect ? "✓ " : isYours ? "✗ " : ""}
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2 mb-3 text-sm">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                            Your answer
                          </div>
                          <div
                            className={`px-3 py-2 rounded-md ${
                              correct
                                ? "bg-[#3C8055]/10 text-[#3C8055]"
                                : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {String(yours)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                            Reference answer
                          </div>
                          <div className="px-3 py-2 rounded-md bg-slate-50 text-slate-700">
                            {q.modelAnswer}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-slate-600 italic">
                      {q.rationale}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Where to focus</h2>
            {Object.keys(missedTopicCounts).length === 0 ? (
              <p className="text-slate-600">
                You answered every question correctly that you attempted — give
                it another go.
              </p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(missedTopicCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([topic, count]) => (
                    <li
                      key={topic}
                      className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 py-2"
                    >
                      <span className="font-medium text-slate-800">
                        {topic}
                      </span>
                      <span className="text-slate-500">
                        {count} miss{count > 1 ? "es" : ""}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
            <div className="mt-5 px-4 py-3 bg-[#D49A30]/10 border border-[#D49A30]/30 rounded-lg text-sm text-slate-700">
              Tip: revisit the toolkit and debrief on the topics above before
              retrying. The cheapest gains come from re-reading, not re-guessing.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Per-rep auth is enforced by RepPicker (validates password against the
// picked slug). No outer PasswordGate needed.
export default function QuizPage() {
  return <QuizInner />;
}
