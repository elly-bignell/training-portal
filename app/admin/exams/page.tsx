// app/admin/exams/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { module1Exam } from "@/data/exams/module-1";
import PasswordGate from "@/components/PasswordGate";

interface ExamSubmission {
  id: string;
  examId: string;
  traineeSlug: string;
  traineeName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

const exams = [
  { id: "exam-module-1", title: "Module 1: Company & Culture", passingScore: 100 },
];

const MAX_ATTEMPTS = 3;

function ExamResultsContent() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/exam/results");
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Group submissions by trainee and exam
  const getTraineeExamAttempts = (traineeSlug: string, examId: string) => {
    return submissions
      .filter((s) => s.traineeSlug === traineeSlug && s.examId === examId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-gray-500 py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E6017D] rounded-full animate-spin" />
            Loading exam results...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Exam Results</h1>
                <p className="text-slate-400 text-sm">Review trainee exam submissions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-800">{submissions.length}</div>
            <div className="text-sm text-gray-500">Total Attempts</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">
              {submissions.filter((s) => s.passed).length}
            </div>
            <div className="text-sm text-gray-500">Passed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-amber-600">
              {submissions.filter((s) => !s.passed).length}
            </div>
            <div className="text-sm text-gray-500">Not Passed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-800">
              {submissions.length > 0
                ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>

        {/* Trainee Results by Exam */}
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800">{exam.title}</h2>
              <p className="text-sm text-gray-500">Pass mark: {exam.passingScore}% • Max attempts: {MAX_ATTEMPTS}</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {trainees.map((trainee) => {
                const attempts = getTraineeExamAttempts(trainee.slug, exam.id);
                const hasPassed = attempts.some((a) => a.passed);
                const bestScore = attempts.length > 0 
                  ? Math.max(...attempts.map((a) => a.percentage))
                  : null;
                const attemptsRemaining = MAX_ATTEMPTS - attempts.length;

                return (
                  <div key={trainee.slug} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E6017D] flex items-center justify-center text-white font-bold text-sm">
                          {trainee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">{trainee.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {hasPassed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Passed
                              </span>
                            ) : attempts.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Best: {bestScore}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Not attempted
                              </span>
                            )}
                            {!hasPassed && (
                              <span className="text-xs text-gray-400">
                                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/exam/module-1/${trainee.slug}`}
                        className="text-sm text-[#E6017D] hover:underline"
                      >
                        Exam link →
                      </Link>
                    </div>

                    {/* Attempts */}
                    {attempts.length > 0 && (
                      <div className="ml-13 grid grid-cols-3 gap-2">
                        {attempts.map((attempt, index) => (
                          <div
                            key={attempt.id}
                            className={`p-3 rounded-lg border ${
                              attempt.passed
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">
                                Attempt {index + 1}
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  attempt.passed ? "text-green-600" : "text-gray-700"
                                }`}
                              >
                                {attempt.percentage}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(attempt.submittedAt).toLocaleString("en-AU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {attempt.score}/{attempt.totalPoints} pts
                            </div>
                          </div>
                        ))}
                        {/* Empty slots for remaining attempts */}
                        {!hasPassed && Array.from({ length: attemptsRemaining }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50"
                          >
                            <div className="text-xs text-gray-400 text-center">
                              Attempt {attempts.length + i + 1}
                              <br />
                              <span className="text-gray-300">—</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {attempts.length === 0 && (
                      <div className="ml-13 text-sm text-gray-400 italic">
                        No attempts yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Exam Links Reference */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📎 Shareable Exam Links</h2>
          <p className="text-sm text-gray-600 mb-4">
            Copy these links to share with trainees when they&apos;re ready:
          </p>
          <div className="space-y-3">
            {trainees.map((trainee) => (
              <div key={trainee.slug} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 w-48">{trainee.name}</span>
                <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 overflow-x-auto">
                  https://training-portal-mauve.vercel.app/exam/module-1/{trainee.slug}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://training-portal-mauve.vercel.app/exam/module-1/${trainee.slug}`
                    );
                  }}
                  className="px-3 py-1 text-sm text-[#E6017D] hover:bg-pink-50 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ExamResultsPage() {
  return (
    <PasswordGate requireMaster>
      <ExamResultsContent />
    </PasswordGate>
  );
}
