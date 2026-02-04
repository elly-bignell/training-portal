// components/ProgressBar.tsx

"use client";

interface ProgressBarProps {
  percentage: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
}

export default function ProgressBar({
  percentage,
  label,
  size = "md",
  showPercentage = true,
}: ProgressBarProps) {
  const heights = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6",
  };

  const getColor = (pct: number) => {
    if (pct === 100) return "bg-green-500";
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 50) return "bg-yellow-500";
    if (pct >= 25) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-600">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`${heights[size]} ${getColor(percentage)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
