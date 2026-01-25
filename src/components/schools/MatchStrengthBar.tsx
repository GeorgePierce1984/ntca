import React from "react";

interface MatchStrengthBarProps {
  strong: number;
  medium: number;
  partial: number;
  total: number;
  onClick?: () => void;
  className?: string;
}

export const MatchStrengthBar: React.FC<MatchStrengthBarProps> = ({
  strong,
  medium,
  partial,
  total,
  onClick,
  className = "",
}) => {
  // Calculate percentages for bar widths
  const strongPercent = total > 0 ? (strong / total) * 100 : 0;
  const mediumPercent = total > 0 ? (medium / total) * 100 : 0;
  const partialPercent = total > 0 ? (partial / total) * 100 : 0;

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`
        flex items-center gap-1 h-8 w-full rounded-md overflow-hidden
        ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}
        ${className}
      `}
      title={onClick ? `Click to view ${total} matches` : undefined}
    >
      {/* Strong matches - Green */}
      {strong > 0 && (
        <div
          className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-semibold min-w-[20px]"
          style={{ width: `${strongPercent}%` }}
          title={`${strong} Strong matches (80-100%)`}
        >
          {strong > 0 && strongPercent > 10 && strong}
        </div>
      )}
      
      {/* Medium matches - Yellow/Orange */}
      {medium > 0 && (
        <div
          className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-semibold min-w-[20px]"
          style={{ width: `${mediumPercent}%` }}
          title={`${medium} Good matches (60-79%)`}
        >
          {medium > 0 && mediumPercent > 10 && medium}
        </div>
      )}
      
      {/* Partial matches - Grey */}
      {partial > 0 && (
        <div
          className="bg-neutral-400 h-full flex items-center justify-center text-white text-xs font-semibold min-w-[20px]"
          style={{ width: `${partialPercent}%` }}
          title={`${partial} Partial matches (40-59%)`}
        >
          {partial > 0 && partialPercent > 10 && partial}
        </div>
      )}
      
      {/* Empty state */}
      {total === 0 && (
        <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 text-xs">
          No matches
        </div>
      )}
    </Component>
  );
};


