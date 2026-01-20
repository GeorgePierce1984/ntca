import React from "react";

interface MatchScoreRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  percentage,
  size = 64,
  strokeWidth = 4,
  className = "",
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Determine color based on match strength
  const getColor = (percent: number): string => {
    if (percent >= 80) return "#22c55e"; // Green for Strong
    if (percent >= 60) return "#eab308"; // Yellow for Good
    return "#9ca3af"; // Grey for Partial
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercentage / 100) * circumference;
  const color = getColor(clampedPercentage);

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-neutral-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Percentage text */}
      <div
        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color }}
      >
        {Math.round(clampedPercentage)}%
      </div>
    </div>
  );
};

