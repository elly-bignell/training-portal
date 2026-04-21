// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { trainingProgram, getTotalChecklistItems } from "@/data/trainingProgram";
import PasswordGate from "@/components/PasswordGate";
import PerformanceSummary, { getWeekBadge } from "@/components/PerformanceSummary";
import { getCurrentWeekNumber } from "@/hooks/useActivityTracking";

interface TraineeProgressData {
  trainee_slug: string;
  trainee_name: string;
  overall_progress: number;
  checked_items: Record<string, boolean>;
  last_updated: string;
  first_activity?: string;
}

interface ExamSubmission {
  examId: string;
  traineeSlug: string;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

// Circular Progress Component
function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = (pct: number) => {
    if (pct >= 75) return "#22c55e";
    if (pct >= 50) return "#3b82f6";
    if (pct >= 25) return "#f59e0b";
    return "#94a3b8";
  };

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle cx="32" cy="32" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r={radius} stroke={getColor(percentage)} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />
      </svg>
      <span className="absolute text-sm font-bold text-gray-700">{percentage}%</span>
    </div>
  );
}

// Format date to Adelaide timezone
function formatAdelaideDate(dateString: string | undefined, includeTime: boolean = false) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Australia/Adelaide",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime && { hour: "numeric", minute: "2-digit", hour12: true }),
  };
  return date.toLocaleString("en-AU", options);
}

function HomeContent() {
  const [progressData, setProgressData] = useState<TraineeProgressData[]>([]);
  const [examResults, setExamResults] = useState<ExamSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalItems = getTotalChecklistItems();
  const totalModules = trainingProgram.length;
  const currentWeek = getCurrentWeekNumber();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progressResponse = await fetch("/api/progress/all");
        const progressData = await progressResponse.json();
        if (progressData.records) {
          setProgressData(progressData.records);
        }
        const examResponse = await fetch("/api/exam/results");
        const examData = await examResponse.json();
        if (examData.submissions) {
          setExamResults(examData.submissions);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTraineeProgress = (slug: string): TraineeProgressData | undefined => {
    return progressData.find((p) => p.trainee_slug === slug);
  };

  const getTraineeExamAttempts = (traineeSlug: string, examId: string) => {
    return examResults
      .filter((s) => s.traineeSlug === traineeSlug && s.examId === examId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Sales Training Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your onboarding program. Complete all modules to become
            fully equipped for success in your new role.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Link
            href="/admin/performance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white rounded-lg hover:bg-[#c4016a] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Tracker
          </Link>
          <Link
            href="/admin/snapshot"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Trainee Summary
          </Link>
          <Link
            href="/projections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Forecasts & Projections
          </Link>
          <Link
            href="/validation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booking Validation
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Admin Dashboard
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Training Week Schedule & Notes
          </Link>
          <Link
            href="/call-flowchart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Call Flowchart
          </Link>
          <Link href="/timezones" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">🕐 Time Zones</Link>
        </div>

        {/* Training Program Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Program Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{totalModules}</div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{totalItems}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Trainees</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Deliverables</div>
            </div>
          </div>
        </div>

        {/* Performance vs Standards Summary */}
        <div className="mb-8">
          <PerformanceSummary />
        </div>

        {/* Trainee Admin Panel removed — quick-access tiles live elsewhere on the site. */}

        {/* Trainee Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Your Dashboard
          </h2>
          {(() => {
            const SALES_SLUGS = ["dylan-munro", "thomas-rennie", "lucas-tirri", "felipe-garcia", "connie-matthews", "cindy-rose-rondez-manrique", "krishna-patel", "sydney-arnold", "riley-kerrison", "caia-cuggy", "emma-ward", "jj-chatrawee", "sushant-maharjan", "maddison-bruce", "kateryna-bakumenko", "shahmir-saajad"];
            const CS_SLUGS = ["jeremy-valiente", "dasha-axenova", "khushi-patel", "lauren-kim", "kristy-lee-busk", "yashika-sood", "ella-smith"];
            const ARCHIVED_SLUGS = ["connie-matthews", "reegan-james", "rachel-astachnowicz", "aston-marsh", "shani-thomas"];
            const HIDDEN_FROM_HOME_SLUGS = ["khushi-patel", "kristy-lee-busk", "jj-chatrawee", "ella-smith"];

            return trainees
              .filter((t) => !ARCHIVED_SLUGS.includes(t.slug) && !HIDDEN_FROM_HOME_SLUGS.includes(t.slug))
              .map((trainee) => {
              const progress = getTraineeProgress(trainee.slug);
              const hasStarted = progress && progress.overall_progress > 0;
              const isSalesTag = SALES_SLUGS.includes(trainee.slug);
              const isCSTag = CS_SLUGS.includes(trainee.slug);
              const weekBadge = getWeekBadge(trainee.slug, currentWeek);

              return (
                <Link
                  key={trainee.id}
                  href={`/trainees/${trainee.slug}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {trainee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{trainee.name}</h3>
                          {isSalesTag && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E6017D]/10 text-[#E6017D] border border-[#E6017D]/20">
                              💼 Sales
                            </span>
                          )}
                          {isCSTag && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              🎧 Customer Service
                            </span>
                          )}
                          {weekBadge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ color: weekBadge.color, background: weekBadge.bg }}>
                              {weekBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          {hasStarted ? (
                            <>
                              <p>Started: {formatAdelaideDate(progress.last_updated, false)}</p>
                              <p>Last updated: {formatAdelaideDate(progress.last_updated, true)}</p>
                            </>
                          ) : (
                            <p className="text-gray-400 italic">Not started yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isLoading ? (
                        <div className="w-16 h-16 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <CircularProgress percentage={progress?.checked_items ? Math.round(Object.values(progress.checked_items).filter(Boolean).length / totalItems * 100) : 0} />
                      )}
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
        </div>

        {/* Sales Knowledge Framework */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            🧠 Sales Knowledge Framework
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            The 7 core competencies that make up the ultimate salesperson
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 w-12">#</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Segment</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 w-24">Weight</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 hidden md:table-cell">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-emerald-50">
                  <td className="py-3 px-3 font-bold text-emerald-700">1</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Product Knowledge</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">35%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Foundation of everything — can&apos;t sell what you don&apos;t understand</td>
                </tr>
                <tr className="border-b border-gray-100 bg-emerald-50/50">
                  <td className="py-3 px-3 font-bold text-emerald-600">2</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Company & Culture</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">30%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Builds trust, authenticity, and conviction in conversations</td>
                </tr>
                <tr className="border-b border-gray-100 bg-blue-50">
                  <td className="py-3 px-3 font-bold text-blue-700">3</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Objection Handling</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">10%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Critical for conversion, but relies on 1 & 2 being solid</td>
                </tr>
                <tr className="border-b border-gray-100 bg-blue-50/50">
                  <td className="py-3 px-3 font-bold text-blue-600">4</td>
                  <td className="py-3 px-3 font-medium text-gray-800">End to End Sales Process</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">9%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Execution framework — knowing the steps to close</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-600">5</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Customer Service & Quodo Production Teams</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">6%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Enhances conviction — knowing clients are in the best hands post-sale gives confidence to sell</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="py-3 px-3 font-bold text-gray-500">6</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Softwares</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">5%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Tools to enhance credibility, learnable on the job</td>
                </tr>
                <tr className="bg-gray-50/30">
                  <td className="py-3 px-3 font-bold text-gray-400">7</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Booking & Deal Admin</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">5%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Procedural competency — important but trainable quickly</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <span className="font-bold text-emerald-700">65%</span>
              <span className="text-gray-600">Foundation — Product & Culture</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="font-bold text-blue-700">19%</span>
              <span className="text-gray-600">Execution — Objections & Process</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <span className="font-bold text-gray-700">16%</span>
              <span className="text-gray-600">Support — Service, Tools & Admin</span>
            </div>
          </div>
        </div>

        {/* Training Modules with Exam Links */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Modules
          </h2>
          <div className="space-y-3">
            {trainingProgram.map((module, index) => {
              // Map modules to knowledge segments
              const segmentMap: Record<number, { name: string; color: string }> = {
                0: { name: "Company & Culture", color: "bg-emerald-100 text-emerald-700" },
                1: { name: "Product Knowledge", color: "bg-emerald-100 text-emerald-700" },
                2: { name: "Product Knowledge", color: "bg-emerald-100 text-emerald-700" },
              };
              const segment = segmentMap[index];

              // Exam details per module
              const examInfo: Record<number, { questions: number; pass: string }> = {
                0: { questions: 5, pass: "80%" },
                1: { questions: 15, pass: "80%" },
                2: { questions: 12, pass: "80%" },
                3: { questions: 8, pass: "80%" },
              };
              const exam = examInfo[index];

              return (
              <div
                key={module.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-800">{module.title}</h3>
                      {segment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${segment.color}`}>
                          {segment.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {module.checklist.filter(item => !item.isSection).length} tasks
                    </p>
                  </div>
                </div>
                {/* Exam link */}
                {exam && (
                  <div className="ml-11 mt-2">
                    <Link
                      href={`/exam/module-${index + 1}/trainee-test`}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-[#E6017D] hover:text-[#E6017D] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Module {index + 1} Exam — {exam.questions} questions, {exam.pass} to pass
                    </Link>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap Link */}
        <Link
          href="/roadmap"
          className="mt-8 block rounded-xl p-6 transition-all shadow-md hover:shadow-lg group"
          style={{ background: "linear-gradient(135deg, #E6017D 0%, #ff4da6 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">🎯 Our Standards</h3>
              <p className="text-pink-100 text-sm mt-1">The Roadmap to Achieving 1 Deal Per Day</p>
            </div>
            <svg
              className="w-6 h-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Progress is automatically saved and synced across devices.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <PasswordGate requireMaster>
      <HomeContent />
    </PasswordGate>
  );
}
