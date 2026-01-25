import React, { useMemo, useState, useCallback } from "react";

/**
 * Option A: Tap-to-Snap Speedometer (React)
 *
 * Props
 * - initialThreshold: number | null (default 80)
 * - snapThresholds: (number | null)[] (default [null,60,70,80,95])  // null = Any
 * - onChange: (state) => void
 * - title / subtitle: strings
 * - width: number (px) (default 420)  // container width; scales SVG
 */
export default function SpeedometerOptionA({
  initialThreshold = 80,
  snapThresholds = [null, 60, 70, 80, 95],
  onChange,
  title = "Match Threshold",
  subtitle = "Tap a snap point to filter quickly",
  width = 420,
}) {
  const [threshold, setThreshold] = useState(initialThreshold);

  // Unique ids so gradients/filters don't collide if you render multiple gauges
  const uid = React.useId();
  const gradId = `spdA_grad_${uid}`;
  const shadowId = `needleShadow_${uid}`;
  const [mode, setMode] = useState<"filter" | "sort">("filter"); // 'filter' | 'sort'
  const [behavior, setBehavior] = useState<"hard" | "soft">("hard"); // 'hard' | 'soft'

  // Gauge geometry
  const cx = 210;
  const cy = 190;
  const r = 150;
  // Top semicircle: left (90°) to right (270°) - flipped to correct orientation
  const startAngle = 90;
  const endAngle = 270;

  const polarToCartesian = useCallback((centerX: number, centerY: number, radius: number, angleDeg: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(a),
      y: centerY + radius * Math.sin(a),
    };
  }, []);

  const arcPath = useCallback(
    (centerX: number, centerY: number, radius: number, startAng: number, endAng: number) => {
      const start = polarToCartesian(centerX, centerY, radius, startAng);
      const end = polarToCartesian(centerX, centerY, radius, endAng);
      // For our top semicircle (270 -> 90), we want the shorter arc (largeArcFlag=0)
      // and we want the arc to sweep counterclockwise (sweepFlag=0).
      const largeArcFlag = 0;
      const sweepFlag = 0;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
    },
    [polarToCartesian]
  );

  const arcD = useMemo(() => arcPath(cx, cy, r, startAngle, endAngle), [arcPath]);

  const ticks = useMemo(() => {
    const tickCount = 9;
    const out = [];
    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const ang = startAngle + (endAngle - startAngle) * t;
      const p1 = polarToCartesian(cx, cy, r + 2, ang);
      const p2 = polarToCartesian(cx, cy, r - 16, ang);
      out.push({ p1, p2, key: `tick-${i}` });
    }
    return out;
  }, [polarToCartesian]);

  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

  const thresholdToNeedleRotation = useCallback(
    (t: number | null) => {
      // Needle points to the right when rotation = 0deg.
      // Convert threshold -> angle on arc, then to SVG rotation.
      const norm = t == null ? 0 : clamp01(Number(t) / 100);
      const ang = startAngle + (endAngle - startAngle) * norm;
      const rot = ang - 90;
      return rot;
    },
    [startAngle, endAngle]
  );

  const rotation = useMemo(() => thresholdToNeedleRotation(threshold), [thresholdToNeedleRotation, threshold]);

  const readout = useMemo(() => {
    if (threshold == null) return { main: "Any", suffix: "" };
    return { main: String(threshold), suffix: "%+" };
  }, [threshold]);

  const note = useMemo(() => {
    if (mode === "sort") return "Sorting matches by score";
    return behavior === "hard" ? "Hiding matches below threshold" : "Boosting stronger matches first";
  }, [mode, behavior]);

  const emit = useCallback(
    (next: { threshold: number | null; mode: "filter" | "sort"; behavior: "hard" | "soft" }) => {
      if (typeof onChange === "function") onChange(next);
    },
    [onChange]
  );

  const setAll = useCallback(
    (next: Partial<{ threshold: number | null; mode: "filter" | "sort"; behavior: "hard" | "soft" }>) => {
      // next: partial
      const nextState = {
        threshold: next.threshold ?? threshold,
        mode: next.mode ?? mode,
        behavior: next.behavior ?? behavior,
      };
      if (next.threshold !== undefined) setThreshold(next.threshold);
      if (next.mode !== undefined) setMode(next.mode);
      if (next.behavior !== undefined) setBehavior(next.behavior);
      emit(nextState);
    },
    [threshold, mode, behavior, emit]
  );

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100">
      <div
        className="rounded-2xl border border-slate-900/10 dark:border-slate-100/10 bg-white dark:bg-slate-800 p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        style={{ width, maxWidth: "100%" }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[16px] font-extrabold">{title}</div>
            <div className="text-[12px] text-slate-900/60 dark:text-slate-400">{subtitle}</div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-full border border-slate-900/10 dark:border-slate-100/10 bg-slate-900/[0.02] dark:bg-slate-100/[0.02] p-1">
            <button
              type="button"
              onClick={() => setAll({ mode: "filter" })}
              className={
                "rounded-full px-3 py-2 text-[13px] font-extrabold transition " +
                (mode === "filter"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-transparent text-slate-900/60 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")
              }
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => setAll({ mode: "sort" })}
              className={
                "rounded-full px-3 py-2 text-[13px] font-extrabold transition " +
                (mode === "sort"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-transparent text-slate-900/60 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")
              }
            >
              Sort
            </button>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative mt-4">
          <svg
            viewBox="0 0 420 220"
            className="block h-auto w-full"
            aria-label="Speedometer"
            role="img"
          >
            <defs>
              <linearGradient id={gradId} x1="60" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ef4444" />
                <stop offset="0.35" stopColor="#f59e0b" />
                <stop offset="0.65" stopColor="#22c55e" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
              <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="rgba(2,6,23,0.18)" />
              </filter>
            </defs>

            <path d={arcD} stroke="rgba(15,23,42,0.08)" strokeWidth="18" fill="none" className="dark:stroke-slate-100/10" />
            <path d={arcD} stroke={`url(#${gradId})`} strokeWidth="18" fill="none" strokeLinecap="round" />

            {/* ticks */}
            <g>
              {ticks.map(({ p1, p2, key }) => (
                <line
                  key={key}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(15,23,42,0.18)"
                  strokeWidth="2"
                  className="dark:stroke-slate-100/20"
                />
              ))}
            </g>

            {/* needle */}
            <g
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${rotation}deg)`,
                transition: "transform 220ms cubic-bezier(.2,.8,.2,1)",
                filter: `url(#${shadowId})`,
              }}
              aria-hidden="true"
            >
              <line x1={cx} y1={cy} x2={345} y2={cy} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-100" />
              <circle cx={cx} cy={cy} r={16} fill="#0f172a" className="dark:fill-slate-100" />
              <circle cx={cx} cy={cy} r={9} fill="white" opacity="0.12" />
            </g>
          </svg>

          {/* Readout */}
          <div className="pointer-events-none absolute left-0 right-0 top-[58px] text-center">
            {threshold == null ? (
              <div className="text-[38px] font-black tracking-tight text-slate-900/90 dark:text-slate-100/90">Any</div>
            ) : (
              <div className="text-[44px] font-black tracking-tight text-slate-900/90 dark:text-slate-100/90">
                {readout.main}
                <span className="ml-1 text-[18px] font-extrabold text-slate-900/60 dark:text-slate-100/60">{readout.suffix}</span>
              </div>
            )}
          </div>
        </div>

        {/* Snap buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {snapThresholds.map((v, idx) => {
            const label = v == null ? "Any" : `${v}+`;
            const active = v === threshold;
            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                onClick={() => setAll({ threshold: v })}
                className={
                  "select-none rounded-xl border px-3 py-2 text-[13px] font-extrabold transition active:scale-[0.98] " +
                  (active
                    ? "border-blue-600/40 dark:border-blue-400/40 bg-blue-600/10 dark:bg-blue-400/10 text-blue-800 dark:text-blue-300"
                    : "border-slate-900/15 dark:border-slate-100/15 bg-white dark:bg-slate-700 text-slate-900/90 dark:text-slate-100/90 hover:border-slate-900/25 dark:hover:border-slate-100/25")
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Hard vs Soft */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setAll({ behavior: "hard" })}
            className={
              "rounded-full border px-3 py-2 text-[13px] font-extrabold transition " +
              (behavior === "hard"
                ? "border-emerald-600/40 dark:border-emerald-400/40 bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                : "border-slate-900/10 dark:border-slate-100/10 bg-white dark:bg-slate-700 text-slate-900/80 dark:text-slate-100/80 hover:border-slate-900/20 dark:hover:border-slate-100/20")
            }
          >
            • Hard Filter
          </button>
          <button
            type="button"
            onClick={() => setAll({ behavior: "soft" })}
            className={
              "rounded-full border px-3 py-2 text-[13px] font-extrabold transition " +
              (behavior === "soft"
                ? "border-emerald-600/40 dark:border-emerald-400/40 bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                : "border-slate-900/10 dark:border-slate-100/10 bg-white dark:bg-slate-700 text-slate-900/80 dark:text-slate-100/80 hover:border-slate-900/20 dark:hover:border-slate-100/20")
            }
          >
            Soft Boost
          </button>

          <div className="text-[12px] text-slate-900/60 dark:text-slate-400">{note}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage
 *
 * <SpeedometerOptionA
 *   initialThreshold={80}
 *   snapThresholds={[null, 60, 70, 80, 90, 95]}
 *   onChange={({threshold, mode, behavior}) => {
 *     // threshold is number|null
 *     // mode: 'filter' | 'sort'
 *     // behavior: 'hard' | 'soft'
 *   }}
 * */
