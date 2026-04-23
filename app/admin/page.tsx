// app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import { trainingProgram } from "@/data/trainingProgram";
import ProgressBar from "@/components/ProgressBar";
import PasswordGate from "@/components/PasswordGate";

interface TraineeProgressData {
  trainee_slug: string;
  trainee_name: string;
  checked_items: Record<string, boolean>;
  notes: Record<string, string>;
  overall_progress: number;
  last_updated: string;
}

function AdminDashboardContent() {
  const [progressData, setProgressData] = useState<TraineeProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/progress/all");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setProgressData(data.records || []);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
      setError("Failed to load progress data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTraineeProgress = (slug: string): TraineeProgressData | undefined => {
    return progressData.find((p) => p.trainee_slug === slug);
  };

  const totalChecklistItems = trainingProgram.reduce(
    (total, module) => total + module.checklist.filter(item => !item.isSection).length,
    0
  );

  const getModuleProgress = (
    checkedItems: Record<string, boolean>,
    moduleId: string
  ): number => {
    const trainingModule = trainingProgram.find((m) => m.id === moduleId);
    if (!trainingModule) return 0;
    const moduleChecklistIds = trainingModule.checklist.filter((item) => !item.isSection).map((item) => item.id);
    const checkedCount = moduleChecklistIds.filter(
      (id) => checkedItems[id]
    ).length;
    return Math.round((checkedCount / moduleChecklistIds.length) * 100);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Monitor trainee progress in real-time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={fetchProgress}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Quick access — Lead Genner Daily Checklist + Question Box + Promo Ideas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/checklist"
            className="block rounded-xl p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Lead Genner Daily Checklists</h3>
                  <p className="text-sm text-white/85">
                    Review each booker&apos;s morning / midday / EOD routines. Flick between tabs.
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/question-box"
            className="block rounded-xl p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Team Question Box</h3>
                  <p className="text-sm text-white/85">
                    Review open questions, write answers, and mark resolved.
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/promos"
            className="block rounded-xl p-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Promotional Ideas</h3>
                  <p className="text-sm text-white/85">
                    Submit promo pitches, work through them, ship the winners.
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">
              {trainees.length}
            </div>
            <div className="text-sm text-gray-600">Total Trainees</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600">
              {progressData.filter((p) => p.overall_progress === 100).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-purple-600">
              {progressData.length > 0
                ? Math.round(
                    progressData.reduce((sum, p) => sum + p.overall_progress, 0) /
                      progressData.length
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Average Progress</div>
          </div>
        </div>

        {/* Trainee Progress Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Trainee Progress
            </h2>
          </div>

          {isLoading && progressData.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading progress data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Progress
                    </th>
                    {trainingProgram.map((module, index) => (
                      <th
                        key={module.id}
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        M{index + 1}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trainees.map((trainee) => {
                    const progress = getTraineeProgress(trainee.slug);
                    const hasStarted = progress && progress.overall_progress > 0;

                    return (
                      <tr key={trainee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/trainees/${trainee.slug}`}
                            className="flex items-center gap-3 hover:text-blue-600"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {trainee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {trainee.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {trainee.slug}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <ProgressBar
                              percentage={progress?.overall_progress || 0}
                              size="sm"
                            />
                          </div>
                        </td>
                        {trainingProgram.map((module) => {
                          const moduleProg = progress
                            ? getModuleProgress(progress.checked_items, module.id)
                            : 0;
                          return (
                            <td
                              key={module.id}
                              className="px-6 py-4 text-center whitespace-nowrap"
                            >
                              <span
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                                  moduleProg === 100
                                    ? "bg-green-100 text-green-700"
                                    : moduleProg > 0
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {moduleProg === 100 ? "✓" : `${moduleProg}%`}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress?.last_updated
                            ? new Date(progress.last_updated).toLocaleString()
                            : "Not started"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Module Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Module Legend
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingProgram.map((module, index) => (
              <div key={module.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">M{index + 1}:</span>
                <span className="text-gray-800 truncate">{module.title.replace(`MODULE ${index + 1} — `, "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedules Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span> Weekly Schedules
          </h3>
          <div className="space-y-4">
            {[
              { name: "Sydney Arnold", dir: "sydney" },
              { name: "Cindy Rose Rondez Manrique", dir: "cindy" },
              { name: "Krishna Patel", dir: "krishna" },
            ].map((t) => (
              <div key={t.dir}>
                <div className="text-sm font-medium text-gray-700 mb-2">{t.name}</div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <Link
                      key={w}
                      href={`/schedule/${t.dir}/week-${w}`}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:shadow-sm ${
                        w <= 4
                          ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                          : w <= 6
                          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                          : w === 7
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                      }`}
                    >
                      Wk {w}
                    </Link>
                  ))}
                  <Link
                    href={`/schedule/${t.dir}`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-all hover:shadow-sm"
                  >
                    All →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Link */}
        <Link
          href="/roadmap"
          className="block bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">⭐ Our Standards</h3>
              <p className="text-amber-100 text-sm mt-1">The Roadmap to Achieving 1 Deal Per Day</p>
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
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <PasswordGate requireMaster>
      <AdminDashboardContent />
    </PasswordGate>
  );
}
