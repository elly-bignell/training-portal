// app/trainees/[slug]/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trainees, getTraineeBySlug } from "@/data/trainees";
import { trainingProgram } from "@/data/trainingProgram";
import { useTraineeProgress } from "@/hooks/useLocalStorage";
import ProgressBar from "@/components/ProgressBar";
import ModuleCard from "@/components/ModuleCard";
import PasswordGate from "@/components/PasswordGate";

function TraineeDashboardContent() {
  const params = useParams();
  const slug = params.slug as string;
  const trainee = getTraineeBySlug(slug);

  // Get all checklist item IDs for overall progress calculation (excluding section headers)
  const allChecklistIds = trainingProgram.flatMap((module) =>
    module.checklist.filter((item) => !item.isSection).map((item) => item.id)
  );

  const {
    progress,
    isLoaded,
    isSyncing,
    toggleItem,
    updateNotes,
    resetProgress,
    getModuleProgress,
    getOverallProgress,
  } = useTraineeProgress(slug, trainee?.name || slug);

  const overallProgress = getOverallProgress(allChecklistIds);

  // Handle toggle with all checklist IDs for sync
  const handleToggleItem = (itemId: string) => {
    toggleItem(itemId, allChecklistIds);
  };

  // Handle notes update with all checklist IDs for sync
  const handleUpdateNotes = (moduleId: string, content: string) => {
    updateNotes(moduleId, content, allChecklistIds);
  };

  // Handle reset with confirmation
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      resetProgress(allChecklistIds);
    }
  };

  // 404 state
  if (!trainee) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Trainee Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a trainee with that URL.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to Home"
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
                  {trainee.name}
                </h1>
                <p className="text-sm text-gray-500">Training Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSyncing && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Syncing...
                </span>
              )}
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Overall Progress Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Training Progress
            </h2>
            <span className="text-3xl font-bold text-blue-600">
              {overallProgress}%
            </span>
          </div>
          <ProgressBar percentage={overallProgress} size="lg" showPercentage={false} />
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              ✅{" "}
              {
                allChecklistIds.filter((id) => progress.checkedItems[id])
                  .length
              }{" "}
              of {allChecklistIds.length} tasks completed
            </span>
            <span>
              📚 {trainingProgram.length} modules
            </span>
            {progress.lastUpdated && (
              <span className="text-gray-400">
                Last updated:{" "}
                {new Date(progress.lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Jump
          </h3>
          <div className="flex flex-wrap gap-2">
            {trainingProgram.map((module, index) => {
              const moduleIds = module.checklist.filter((item) => !item.isSection).map((item) => item.id);
              const moduleProg = getModuleProgress(moduleIds);
              return (
                <a
                  key={module.id}
                  href={`#${module.id}`}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    moduleProg === 100
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="font-medium">M{index + 1}</span>
                  {moduleProg === 100 && <span>✓</span>}
                </a>
              );
            })}
          </div>
        </div>

        {/* Module Cards */}
        <div className="space-y-6">
          {trainingProgram.map((module) => {
            const moduleIds = module.checklist.filter((item) => !item.isSection).map((item) => item.id);
            const moduleProgress = getModuleProgress(moduleIds);

            return (
              <div key={module.id} id={module.id}>
                <ModuleCard
                  module={module}
                  checkedItems={progress.checkedItems}
                  notes={progress.notes}
                  onToggleItem={handleToggleItem}
                  onUpdateNotes={handleUpdateNotes}
                  moduleProgress={moduleProgress}
                />
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {overallProgress === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-center text-white">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              Congratulations, {trainee.name.split(" ")[0]}!
            </h2>
            <p className="text-green-100">
              You&apos;ve completed all training modules. You&apos;re ready for
              success!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>
            Your progress is automatically saved and synced.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function TraineeDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  
  return (
    <PasswordGate traineeSlug={slug}>
      <TraineeDashboardContent />
    </PasswordGate>
  );
}
