// components/ModuleCard.tsx

"use client";

import { useState } from "react";
import { Module } from "@/types";
import ProgressBar from "./ProgressBar";
import ChecklistItem from "./ChecklistItem";
import NotesSection from "./NotesSection";

interface ModuleCardProps {
  module: Module;
  checkedItems: Record<string, boolean>;
  notes: Record<string, string>;
  onToggleItem: (itemId: string) => void;
  onUpdateNotes: (moduleId: string, content: string) => void;
  moduleProgress: number;
}

export default function ModuleCard({
  module,
  checkedItems,
  notes,
  onToggleItem,
  onUpdateNotes,
  moduleProgress,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{module.purpose}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-800">
                {moduleProgress}%
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar percentage={moduleProgress} size="sm" showPercentage={false} />
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-gray-100">
          {/* Proficiency Requirements */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              🎯 By the end of this module, you should be able to:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
              {module.proficiency.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Checklist */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              ✅ Tasks to Complete
            </h4>
            <div className="space-y-2">
              {module.checklist.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  isChecked={checkedItems[item.id] || false}
                  onToggle={onToggleItem}
                />
              ))}
            </div>
          </div>

          {/* Resources */}
          {module.resources && module.resources.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                📚 Additional Resources
              </h4>
              <div className="flex flex-wrap gap-2">
                {module.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {resource.label}
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section for Deliverable */}
          <NotesSection
            moduleId={module.id}
            deliverablePrompt={module.deliverable}
            savedContent={notes[module.id] || ""}
            onSave={onUpdateNotes}
          />
        </div>
      )}
    </div>
  );
}
