// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { trainingProgram, getTotalChecklistItems } from "@/data/trainingProgram";
import PasswordGate from "@/components/PasswordGate";
import PerformanceSummary from "@/components/PerformanceSummary";

interface TraineeProgressData {
  trainee_slug: string;
  trainee_name: string;
  overall_progress: number;
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
  
  // Color based on progress
  const getColor = (pct: number) => {
    if (pct >= 75) return "#22c55e"; // green
    if (pct >= 50) return "#3b82f6"; // blue
    if (pct >= 25) return "#f59e0b"; // amber
    return "#94a3b8"; // gray
  };

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-gray-700">
        {percentage}%
      </span>
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
    ...(includeTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
  
  return date.toLocaleString("en-AU", options);
}

function HomeContent() {
  const [progressData, setProgressData] = useState<TraineeProgressData[]>([]);
  const [examResults, setExamResults] = useState<ExamSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalItems = getTotalChecklistItems();
  const totalModules = trainingProgram.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch progress data
        const progressResponse = await fetch("/api/progress/all");
        const progressData = await progressResponse.json();
        if (progressData.records) {
          setProgressData(progressData.records);
        }

        // Fetch exam results
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

  // Get exam attempts for a trainee
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

        {/* Admin Links */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Admin Dashboard
          </Link>
          <Link
            href="/admin/performance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white rounded-lg hover:bg-[#c4016a] transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Performance Tracker
          </Link>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Exam Results
          </Link>
        </div>

        {/* Training Program Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Program Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {totalModules}
              </div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {totalItems}
              </div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {trainees.length}
              </div>
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

        {/* Trainee Admin Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Trainee Quick Access
          </h2>
          <div className="space-y-4">
            {trainees.map((trainee) => {
              const module1Attempts = getTraineeExamAttempts(trainee.slug, "exam-module-1");
              const module1Passed = module1Attempts.some((a) => a.passed);
              const module1BestScore = module1Attempts.length > 0
                ? Math.max(...module1Attempts.map((a) => a.percentage))
                : null;

              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E6017D] flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {/* Dashboard Link */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link
                      href={`/trainees/${trainee.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      Open →
                    </Link>
                  </div>
                  
                  {/* Scorecard Link */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link
                      href={`/scorecard/${trainee.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      Open →
                    </Link>
                  </div>
                  
                  {/* Module 1 Exam */}
                  <div className={`flex items-center justify-between p-2 rounded ${
                    module1Passed 
                      ? "bg-green-50" 
                      : module1Attempts.length > 0 
                        ? "bg-amber-50" 
                        : "bg-emerald-50"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Module 1 Exam</span>
                      {module1BestScore !== null && (
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          module1Passed 
                            ? "bg-green-100 text-green-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {module1Passed ? "✓" : ""} {module1BestScore}%
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/exam/module-1/${trainee.slug}`}
                      className={`hover:underline ${
                        module1Passed 
                          ? "text-green-600" 
                          : module1Attempts.length > 0 
                            ? "text-amber-600" 
                            : "text-emerald-600"
                      }`}
                    >
                      {module1Passed ? "View →" : module1Attempts.length > 0 ? `Retry (${3 - module1Attempts.length} left) →` : "Open →"}
                    </Link>
                  </div>
                  
                  {/* Placeholder for future exams */}
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded opacity-50">
                    <span className="text-gray-500">Module 2 & 3 Exams</span>
                    <span className="text-gray-400 text-xs">Coming soon</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Trainee Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Your Dashboard
          </h2>
          {trainees.map((trainee) => {
            const progress = getTraineeProgress(trainee.slug);
            const hasStarted = progress && progress.overall_progress > 0;
            
            return (
              <Link
                key={trainee.id}
                href={`/trainees/${trainee.slug}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {trainee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trainee.name}
                      </h3>
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
                      <CircularProgress percentage={progress?.overall_progress || 0} />
                    )}
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sales Knowledge Framework */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            🧠 Sales Knowledge Framework
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The 7 core competencies that make up the ultimate salesperson
          </p>
          
          {/* Brain Illustration */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 400 320" className="w-full max-w-md">
              {/* Brain outline */}
              <ellipse cx="200" cy="160" rx="180" ry="140" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
              
              {/* Segment 1 - Product Knowledge (25%) - Top center */}
              <path d="M200,30 Q280,30 280,100 Q280,140 200,140 Q120,140 120,100 Q120,30 200,30" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
              <text x="200" y="75" textAnchor="middle" className="text-xs font-bold" fill="#059669">Product Knowledge</text>
              <text x="200" y="95" textAnchor="middle" className="text-sm font-bold" fill="#047857">25%</text>
              
              {/* Segment 2 - Company & Culture (20%) - Top left */}
              <path d="M40,100 Q40,50 100,50 Q140,50 140,100 Q140,160 100,180 Q40,180 40,100" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
              <text x="90" y="105" textAnchor="middle" className="text-xs font-bold" fill="#059669">Company</text>
              <text x="90" y="120" textAnchor="middle" className="text-xs font-bold" fill="#059669">& Culture</text>
              <text x="90" y="145" textAnchor="middle" className="text-sm font-bold" fill="#047857">20%</text>
              
              {/* Segment 3 - Objection Handling (15%) - Top right */}
              <path d="M260,50 Q320,50 360,100 Q360,180 300,180 Q260,160 260,100 Q260,50 260,50" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"/>
              <text x="310" y="105" textAnchor="middle" className="text-xs font-bold" fill="#2563eb">Objection</text>
              <text x="310" y="120" textAnchor="middle" className="text-xs font-bold" fill="#2563eb">Handling</text>
              <text x="310" y="145" textAnchor="middle" className="text-sm font-bold" fill="#1d4ed8">15%</text>
              
              {/* Segment 4 - End to End Sales Process (15%) - Middle right */}
              <path d="M280,160 Q340,160 350,210 Q350,260 280,270 Q240,260 240,210 Q240,160 280,160" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"/>
              <text x="295" y="200" textAnchor="middle" className="text-xs font-bold" fill="#2563eb">Sales</text>
              <text x="295" y="215" textAnchor="middle" className="text-xs font-bold" fill="#2563eb">Process</text>
              <text x="295" y="240" textAnchor="middle" className="text-sm font-bold" fill="#1d4ed8">15%</text>
              
              {/* Segment 5 - Customer Service Team (10%) - Bottom center */}
              <path d="M140,220 Q140,280 200,290 Q260,280 260,220 Q260,190 200,190 Q140,190 140,220" fill="#f9fafb" stroke="#6b7280" strokeWidth="2"/>
              <text x="200" y="225" textAnchor="middle" className="text-xs font-bold" fill="#4b5563">Customer</text>
              <text x="200" y="240" textAnchor="middle" className="text-xs font-bold" fill="#4b5563">Service</text>
              <text x="200" y="265" textAnchor="middle" className="text-sm font-bold" fill="#374151">10%</text>
              
              {/* Segment 6 - Softwares (8%) - Middle left */}
              <path d="M50,160 Q50,210 80,240 Q120,260 140,210 Q150,160 100,150 Q50,150 50,160" fill="#f9fafb" stroke="#6b7280" strokeWidth="2"/>
              <text x="95" y="195" textAnchor="middle" className="text-xs font-bold" fill="#4b5563">Softwares</text>
              <text x="95" y="220" textAnchor="middle" className="text-sm font-bold" fill="#374151">8%</text>
              
              {/* Segment 7 - Booking & Deal Admin (7%) - Bottom left */}
              <path d="M60,240 Q40,270 70,290 Q120,300 140,270 Q150,240 100,230 Q60,230 60,240" fill="#f9fafb" stroke="#6b7280" strokeWidth="2"/>
              <text x="100" y="260" textAnchor="middle" className="text-xs font-bold" fill="#4b5563">Admin</text>
              <text x="100" y="280" textAnchor="middle" className="text-sm font-bold" fill="#374151">7%</text>
            </svg>
          </div>

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
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">25%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Foundation of everything — can&apos;t sell what you don&apos;t understand</td>
                </tr>
                <tr className="border-b border-gray-100 bg-emerald-50/50">
                  <td className="py-3 px-3 font-bold text-emerald-600">2</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Company & Culture</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">20%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Builds trust, authenticity, and conviction in conversations</td>
                </tr>
                <tr className="border-b border-gray-100 bg-blue-50">
                  <td className="py-3 px-3 font-bold text-blue-700">3</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Objection Handling</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">15%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Critical for conversion, but relies on 1 & 2 being solid</td>
                </tr>
                <tr className="border-b border-gray-100 bg-blue-50/50">
                  <td className="py-3 px-3 font-bold text-blue-600">4</td>
                  <td className="py-3 px-3 font-medium text-gray-800">End to End Sales Process</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">15%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Execution framework — knowing the steps to close</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-600">5</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Customer Service Team</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">10%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Enhances conviction — knowing clients are in the best hands post-sale gives confidence to sell</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="py-3 px-3 font-bold text-gray-500">6</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Softwares</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">8%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Tools to enhance credibility, learnable on the job</td>
                </tr>
                <tr className="bg-gray-50/30">
                  <td className="py-3 px-3 font-bold text-gray-400">7</td>
                  <td className="py-3 px-3 font-medium text-gray-800">Booking & Deal Admin</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-xs">7%</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 hidden md:table-cell">Procedural competency — important but trainable quickly</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <span className="font-bold text-emerald-700">45%</span>
              <span className="text-gray-600">Foundation — Product & Culture</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="font-bold text-blue-700">30%</span>
              <span className="text-gray-600">Execution — Objections & Process</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <span className="font-bold text-gray-700">25%</span>
              <span className="text-gray-600">Support — Service, Tools & Admin</span>
            </div>
          </div>
        </div>

        {/* Module Preview */}
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

              return (
              <div
                key={module.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
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
