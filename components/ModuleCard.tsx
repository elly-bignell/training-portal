// components/ModuleCard.tsx

"use client";

import { useState } from "react";
import { Module, Questionnaire } from "@/types";
import ProgressBar from "./ProgressBar";
import ChecklistItem from "./ChecklistItem";

interface ModuleCardProps {
  module: Module;
  checkedItems: Record<string, boolean>;
  notes: Record<string, string>;
  onToggleItem: (itemId: string) => void;
  onUpdateNotes: (moduleId: string, content: string) => void;
  moduleProgress: number;
}

function QuestionnaireBlock({ questionnaire }: { questionnaire: Questionnaire }) {
  const hasLink = !!questionnaire.willoLink;

  return (
    <div className="my-4 rounded-lg border-2 border-dashed border-[#E6017D]/30 bg-gradient-to-r from-pink-50 to-rose-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E6017D]/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#E6017D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-sm font-bold text-[#E6017D]">🎥 {questionnaire.title}</h5>
            {questionnaire.questionCount && (
              <span className="text-[10px] font-semibold bg-[#E6017D]/10 text-[#E6017D] px-2 py-0.5 rounded-full">
                {questionnaire.questionCount} questions
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mb-3">{questionnaire.description}</p>
          {hasLink ? (
            <a
              href={questionnaire.willoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6017D] text-white text-sm font-semibold rounded-lg hover:bg-[#c9016b] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Complete the Willo Questionnaire
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 text-sm font-semibold rounded-lg cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Complete the Willo Questionnaire — link coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

  // Build a map of afterItemId -> questionnaire for inline rendering
  const questionnaireMap = new Map<string, Questionnaire>();
  if (module.questionnaires) {
    for (const q of module.questionnaires) {
      questionnaireMap.set(q.afterItemId, q);
    }
  }

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

          {/* Checklist with inline questionnaires */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              ✅ Tasks to Complete
            </h4>
            <div className="space-y-2">
              {module.checklist.map((item) => (
                <div key={item.id}>
                  {item.isSection ? (
                    <div className="pt-4 pb-2">
                      <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">
                        {item.label}
                      </h5>
                    </div>
                  ) : (
                    <ChecklistItem
                      item={item}
                      isChecked={checkedItems[item.id] || false}
                      onToggle={onToggleItem}
                    />
                  )}
                  {/* Render questionnaire block after this item if mapped */}
                  {questionnaireMap.has(item.id) && (
                    <QuestionnaireBlock questionnaire={questionnaireMap.get(item.id)!} />
                  )}
                </div>
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
        </div>
      )}
    </div>
  );
}
