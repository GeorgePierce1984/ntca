import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/*
        Modern flat logo inspired by 2024 trends:
        - Bold, filled shapes
        - Vibrant multi-color gradient
        - Minimal details for crisp rendering at any size
      */}
      <svg
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        role="img"
        aria-label="NexTeach Central Asia logo"
      >
        <defs>
          {/* Diagonal multi-color gradient for background */}
          <linearGradient id="ntcaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />  {/* blue */}
            <stop offset="50%" stopColor="#9333ea" /> {/* purple */}
            <stop offset="100%" stopColor="#f59e0b" />{/* amber */}
          </linearGradient>
        </defs>

        {/* Rounded square background filled with gradient */}
        <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#ntcaGrad)" />

        {/* Bold graduation cap symbol */}
        <g fill="#ffffff" opacity="0.96">
          {/* Cap top */}
          <path d="M8 20 L24 11 L40 20 L24 29 Z" />
          {/* Cap tassel */}
          <rect x="23" y="29" width="2" height="13" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-display font-bold gradient-text">
            NTCA
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">
            NexTeach Central Asia
          </span>
        </div>
      )}
    </div>
  );
};

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => {
  return <Logo className={className} showText={false} />;
};
