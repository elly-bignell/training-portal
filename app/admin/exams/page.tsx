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
  { id: "exam-module-1", title: "Module 1: Company & Culture", exam: module1Exam },
];

function ExamResultsContent() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>("all");

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

  const filteredSubmissions =
    selectedExam === "all"
      ? submissions
      : submissions.filter((s) => s.examId === selectedExam);

  // Get latest submission per trainee per exam
  const latestSubmissions = new Map<string, ExamSubmission>();
  for (const sub of filteredSubmissions) {
    const key = `${sub.traineeSlug}-${sub.examId}`;
    if (!latestSubmissions.has(key)) {
      latestSubmissions.set(key, sub);
    }
  }

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
            <div className="text-sm text-gray-500">Total Submissions</div>
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
            <div className="text-sm text-gray-500">Need Review</div>
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

        {/* Trainee Exam Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Trainee Status</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {trainees.map((trainee) => {
              const traineeSubmissions = submissions.filter(
                (s) => s.traineeSlug === trainee.slug
              );
              const latestByExam = new Map<string, ExamSubmission>();
              for (const sub of traineeSubmissions) {
                if (!latestByExam.has(sub.examId)) {
                  latestByExam.set(sub.examId, sub);
                }
              }

              return (
                <div key={trainee.slug} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E6017D] flex items-center justify-center text-white font-bold">
                        {trainee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold text-gray-800">{trainee.name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-13">
                    {exams.map((exam) => {
                      const sub = latestByExam.get(exam.id);
                      return (
                        <div
                          key={exam.id}
                          className={`p-3 rounded-lg border ${
                            sub
                              ? sub.passed
                                ? "bg-green-50 border-green-200"
                                : "bg-amber-50 border-amber-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">{exam.title}</div>
                          {sub ? (
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold ${
                                  sub.passed ? "text-green-700" : "text-amber-700"
                                }`}
                              >
                                {sub.percentage}% {sub.passed ? "✓" : ""}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(sub.submittedAt).toLocaleDateString("en-AU")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Not submitted</span>
                              <Link
                                href={`/exam/${exam.id.replace("exam-", "")}/${trainee.slug}`}
                                className="text-xs text-[#E6017D] hover:underline"
                              >
                                Send link
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 font-medium"
          >
            <option value="all">All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Submissions</h2>
          </div>
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No exam submissions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-4">Trainee</th>
                    <th className="text-left p-4">Exam</th>
                    <th className="text-center p-4">Score</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-left p-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-medium text-gray-800">{sub.traineeName}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {exams.find((e) => e.id === sub.examId)?.title || sub.examId}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-gray-800">
                          {sub.score}/{sub.totalPoints}
                        </span>
                        <span className="text-gray-400 ml-1">({sub.percentage}%)</span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sub.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.passed ? "Passed" : "Needs Review"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(sub.submittedAt).toLocaleString("en-AU", {
                          timeZone: "Australia/Adelaide",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Exam Links */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Exam Links</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share these links with trainees when they&apos;re ready to take their exams:
          </p>
          <div className="space-y-3">
            {trainees.map((trainee) => (
              <div key={trainee.slug} className="flex items-center gap-4">
                <span className="font-medium text-gray-700 w-48">{trainee.name}</span>
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm text-gray-600 overflow-x-auto">
                  https://training-portal-mauve.vercel.app/exam/module-1/{trainee.slug}
                </code>
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
