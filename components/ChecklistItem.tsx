// components/ChecklistItem.tsx

"use client";

import { ChecklistItem as ChecklistItemType } from "@/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
}

export default function ChecklistItem({
  item,
  isChecked,
  onToggle,
}: ChecklistItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
        isChecked
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      }`}
      onClick={() => onToggle(item.id)}
    >
      <div className="flex-shrink-0 pt-0.5">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(item.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm ${
              isChecked ? "text-gray-500 line-through" : "text-gray-800"
            }`}
          >
            {item.label}
          </span>
          {item.estimatedTime && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              ⏱ {item.estimatedTime}
            </span>
          )}
        </div>
        {item.link && item.link !== "#" && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Open resource →
          </a>
        )}
      </div>
    </div>
  );
}
