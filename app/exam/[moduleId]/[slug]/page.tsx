// app/exam/[moduleId]/[slug]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { module1Exam, module1TotalPoints } from "@/data/exams/module-1";
import { module2Exam, module2TotalPoints } from "@/data/exams/module-2";
import { module3Exam, module3TotalPoints } from "@/data/exams/module-3";
import { module4Exam, module4TotalPoints } from "@/data/exams/module-4";
import { trainees } from "@/data/trainees";
import { Exam, ExamQuestion } from "@/types/exam";
import PasswordGate from "@/components/PasswordGate";

function getExamData(moduleId: string): { exam: Exam; totalPoints: number } | null {
  switch (moduleId) {
    case "module-1":
      return { exam: module1Exam, totalPoints: module1TotalPoints };
    case "module-2":
      return { exam: module2Exam, totalPoints: module2TotalPoints };
    case "module-3":
      return { exam: module3Exam, totalPoints: module3TotalPoints };
    case "module-4":
      return { exam: module4Exam, totalPoints: module4TotalPoints };
    default:
      return null;
  }
}

// Willo Logo SVG Component
function WilloLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="28" fontWeight="700" fill="currentColor" letterSpacing="-0.5">
        willo
      </text>
    </svg>
  );
}

// Willo-Only Exam Page (no MC questions — just video assessment via Willo)
function WilloOnlyExam({ exam, trainee, slug }: { exam: Exam; trainee: { name: string; slug: string }; slug: string }) {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/trainees/${slug}`}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold">{exam.title}</h1>
              <p className="text-slate-400 text-sm">{trainee.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-[#E6017D] to-[#ff4da6]" />

          <div className="p-8 sm:p-10">
            {/* Title & Description */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-[#E6017D] rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Assessment
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {exam.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {exam.description}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-8" />

            {/* What to expect */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">What to Expect</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">6 Questions</div>
                    <div className="text-xs text-gray-500 mt-0.5">Short video responses</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">~15 Minutes</div>
                    <div className="text-xs text-gray-500 mt-0.5">Estimated completion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Reviewed Manually</div>
                    <div className="text-xs text-gray-500 mt-0.5">By your manager</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-8" />

            {/* Willo CTA Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 mb-4">
                <span className="text-xs font-medium uppercase tracking-wider">Powered by</span>
                <WilloLogo className="h-5 w-auto text-gray-700" />
              </div>

              <div className="mt-4">
                <a
                  href={exam.willoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#E6017D] text-white rounded-xl font-semibold text-lg hover:bg-[#c9016b] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Take Exam on Willo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <p className="text-sm text-gray-400 mt-4">
                Opens in a new tab. You&apos;ll need access to your camera and microphone.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Training */}
        <div className="mt-8 text-center">
          <Link
            href={`/trainees/${slug}`}
            className="inline-flex items-center gap-2 text-[#E6017D] hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Training Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onSelect,
  showResults,
}: {
  question: ExamQuestion;
  questionNumber: number;
  selectedAnswer: number | undefined;
  onSelect: (answer: number) => void;
  showResults: boolean;
}) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          <span className="text-gray-400 mr-2">Q{questionNumber}.</span>
          {question.question}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-gray-500">{question.points} pt{question.points > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          
          let optionClass = "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          if (showResults) {
            if (isSelected) {
              optionClass = "border-gray-400 bg-gray-100";
            } else {
              optionClass = "border-gray-200 bg-gray-50 opacity-60";
            }
          } else if (isSelected) {
            optionClass = "border-[#E6017D] bg-pink-50";
          }

          return (
            <button
              key={index}
              onClick={() => !showResults && onSelect(index)}
              disabled={showResults}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionClass} ${
                showResults ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? showResults
                        ? "border-gray-500 bg-gray-500"
                        : "border-[#E6017D] bg-[#E6017D]"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExamContent() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const slug = params.slug as string;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousAttempts, setPreviousAttempts] = useState<Array<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
  }>>([]);
  const [results, setResults] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  const examData = getExamData(moduleId);
  const trainee = trainees.find((t) => t.slug === slug);
  const MAX_ATTEMPTS = 3;

  // Check if this is a Willo-only exam (no MC questions)
  const isWilloOnly = examData?.exam.questions.length === 0;

  // Fetch previous attempts on load (skip for Willo-only exams)
  useEffect(() => {
    if (isWilloOnly) {
      setIsLoading(false);
      return;
    }

    const fetchAttempts = async () => {
      if (!examData || !trainee) return;
      
      try {
        const response = await fetch(
          `/api/exam/results?trainee_slug=${slug}&exam_id=${examData.exam.id}`
        );
        const data = await response.json();
        setPreviousAttempts(data.submissions || []);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [slug, examData, trainee, isWilloOnly]);

  if (!examData || !trainee) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Exam Not Found</h1>
          <p className="text-gray-600 mb-4">This exam or trainee doesn&apos;t exist.</p>
          <Link href="/" className="text-[#E6017D] hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { exam, totalPoints } = examData;

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E6017D] rounded-full animate-spin" />
          Loading exam...
        </div>
      </main>
    );
  }

  // Willo-only exam — render the video assessment page
  if (isWilloOnly) {
    return <WilloOnlyExam exam={exam} trainee={trainee} slug={slug} />;
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === exam.questions.length;
  const attemptNumber = previousAttempts.length + 1;
  const hasPassed = previousAttempts.some((a) => a.passed);
  const attemptsRemaining = MAX_ATTEMPTS - previousAttempts.length;
  const canAttempt = attemptsRemaining > 0 && !hasPassed;

  const handleSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    if (!confirm("Are you sure you want to submit your exam? You cannot change your answers after submission.")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          traineeSlug: slug,
          traineeName: trainee.name,
          answers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.submission);
        setIsSubmitted(true);
      } else {
        alert("Failed to submit exam. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already passed - show success message
  if (hasPassed && !isSubmitted) {
    const passingAttempt = previousAttempts.find((a) => a.passed)!;
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href={`/trainees/${slug}`} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold">{exam.title}</h1>
                <p className="text-slate-400 text-sm">{trainee.name}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">You&apos;ve Already Passed!</h2>
            <p className="text-white/80 mb-4">
              You passed this exam with a score of {passingAttempt.percentage}% on{" "}
              {new Date(passingAttempt.submittedAt).toLocaleDateString("en-AU")}.
            </p>
            <Link
              href={`/trainees/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Back to Training Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // No attempts remaining
  if (!canAttempt && !isSubmitted) {
    const bestAttempt = previousAttempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    , previousAttempts[0]);
    
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href={`/trainees/${slug}`} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold">{exam.title}</h1>
                <p className="text-slate-400 text-sm">{trainee.name}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-8 text-white text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">No Attempts Remaining</h2>
            <p className="text-white/80 mb-4">
              You&apos;ve used all {MAX_ATTEMPTS} attempts. Your best score was {bestAttempt?.percentage || 0}%.
              <br />Please speak with your manager about next steps.
            </p>
            <Link
              href={`/trainees/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Back to Training Dashboard
            </Link>
          </div>
          
          {/* Previous Attempts */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Attempts</h3>
            <div className="space-y-3">
              {previousAttempts.map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Attempt {index + 1}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{attempt.percentage}%</span>
                    <span className="text-sm text-gray-400">
                      {new Date(attempt.submittedAt).toLocaleDateString("en-AU")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/trainees/${slug}`}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold">{exam.title}</h1>
                <p className="text-slate-400 text-sm">{trainee.name} • Attempt {attemptNumber} of {MAX_ATTEMPTS}</p>
              </div>
            </div>
            {!isSubmitted && (
              <div className="text-right">
                <div className="text-sm text-slate-400">Progress</div>
                <div className="text-lg font-bold">
                  {answeredCount}/{exam.questions.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Previous Attempts Banner */}
        {previousAttempts.length > 0 && !isSubmitted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-amber-800">Previous Attempts</h4>
                <div className="text-sm text-amber-700 mt-1">
                  {previousAttempts.map((attempt, index) => (
                    <span key={index} className="mr-4">
                      Attempt {index + 1}: {attempt.percentage}%
                    </span>
                  ))}
                </div>
                <p className="text-sm text-amber-600 mt-1">
                  You have {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Banner */}
        {isSubmitted && results && (
          <div
            className={`rounded-xl p-6 mb-8 ${
              results.passed
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            } text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {results.passed ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <h2 className="text-2xl font-bold">
                    {results.passed ? "Congratulations! You Passed!" : "Keep Studying"}
                  </h2>
                </div>
                <p className="text-white/80">
                  {results.passed
                    ? "Great job! You've demonstrated a solid understanding of the material."
                    : "You didn't quite reach the passing score. Review the material and try again."}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{results.percentage}%</div>
                <div className="text-white/80">
                  {results.score}/{results.totalPoints} points
                </div>
                <div className="text-sm text-white/60 mt-1">Passing: {exam.passingScore}%</div>
              </div>
            </div>

            {exam.willoLink && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-white/80 mb-3">
                  Don&apos;t forget to complete the video questionnaire on Willo:
                </p>
                <a
                  href={exam.willoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Complete Willo Questionnaire
                </a>
              </div>
            )}
          </div>
        )}

        {/* Exam Description */}
        {!isSubmitted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Instructions</h2>
            <p className="text-gray-600 mb-4">{exam.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {exam.questions.length} questions
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {totalPoints} total points
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {exam.passingScore}% to pass
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {exam.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              selectedAnswer={answers[question.id]}
              onSelect={(answer) => handleSelect(question.id, answer)}
              showResults={isSubmitted}
            />
          ))}
        </div>

        {/* Willo Section (before submission) */}
        {!isSubmitted && exam.willoLink && exam.questions.length > 0 && (
          <div className="mt-8 rounded-xl border-2 border-dashed border-[#E6017D]/30 bg-gradient-to-r from-pink-50 to-rose-50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E6017D]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#E6017D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E6017D] mb-1">Video Questionnaire</h3>
                <p className="text-sm text-slate-600 mb-3">{exam.willoDescription}</p>
                <a
                  href={exam.willoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white rounded-lg font-semibold hover:bg-[#c9016b] transition-colors text-sm"
                >
                  Open Willo Questionnaire →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                allAnswered && !isSubmitting
                  ? "bg-[#E6017D] hover:bg-[#c9016b] shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                `Submit Exam (${answeredCount}/${exam.questions.length} answered)`
              )}
            </button>
          </div>
        )}

        {/* Back to Training */}
        {isSubmitted && (
          <div className="mt-8 text-center">
            <Link
              href={`/trainees/${slug}`}
              className="inline-flex items-center gap-2 text-[#E6017D] hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Training Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExamPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <PasswordGate traineeSlug={slug}>
      <ExamContent />
    </PasswordGate>
  );
}
