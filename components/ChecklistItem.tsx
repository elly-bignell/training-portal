// components/ChecklistItem.tsx

"use client";

import { ChecklistItem as ChecklistItemType } from "@/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
}

// Convert Google Drive share link to embed URL
function getGoogleDriveEmbedUrl(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
}

export default function ChecklistItem({
  item,
  isChecked,
  onToggle,
}: ChecklistItemProps) {
  const embedUrl = item.audioLink ? getGoogleDriveEmbedUrl(item.audioLink) : null;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
        item.audioLink ? "" : "cursor-pointer hover:bg-gray-50"
      } ${
        isChecked
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      }`}
      onClick={() => !item.audioLink && onToggle(item.id)}
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
        {embedUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <iframe
              src={embedUrl}
              width="100%"
              height="80"
              allow="autoplay"
              className="border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
