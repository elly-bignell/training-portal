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
  const [isLoading, setIsLoading] = useState(true);
  
  const totalItems = getTotalChecklistItems();
  const totalModules = trainingProgram.length;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/progress/all");
        const data = await response.json();
        if (data.records) {
          setProgressData(data.records);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const getTraineeProgress = (slug: string): TraineeProgressData | undefined => {
    return progressData.find((p) => p.trainee_slug === slug);
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
        <div className="flex justify-center gap-3 mb-8">
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
        </div>

        {/* Program Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Program Overview
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
              <div className="text-3xl font-bold text-orange-600">4</div>
              <div className="text-sm text-gray-600">Deliverables</div>
            </div>
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

        {/* Performance vs Standards Summary */}
        <div className="mt-8">
          <PerformanceSummary />
        </div>

        {/* Module Preview */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Modules
          </h2>
          <div className="space-y-3">
            {trainingProgram.map((module, index) => (
              <div
                key={module.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{module.title}</h3>
                  <p className="text-sm text-gray-500">
                    {module.checklist.filter(item => !item.isSection).length} tasks
                  </p>
                </div>
              </div>
            ))}
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
