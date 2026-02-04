// components/NotesSection.tsx

"use client";

import { useState, useEffect, useCallback } from "react";

interface NotesSectionProps {
  moduleId: string;
  deliverablePrompt: string;
  savedContent: string;
  onSave: (moduleId: string, content: string) => void;
}

export default function NotesSection({
  moduleId,
  deliverablePrompt,
  savedContent,
  onSave,
}: NotesSectionProps) {
  const [content, setContent] = useState(savedContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update local state when savedContent changes (e.g., on initial load)
  useEffect(() => {
    setContent(savedContent);
  }, [savedContent]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== savedContent) {
        setIsSaving(true);
        onSave(moduleId, content);
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, savedContent, moduleId, onSave]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
  );

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">
          📝 Deliverable Notes
        </h4>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-blue-600 animate-pulse">
              Saving...
            </span>
          )}
          {lastSaved && !isSaving && (
            <span className="text-xs text-gray-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <strong>Task:</strong> {deliverablePrompt}
      </p>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Write your response here..."
        className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
      />
    </div>
  );
}
