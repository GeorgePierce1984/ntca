import React, { useMemo, useState, useCallback, useEffect } from "react";

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
  initialThreshold = null,
  snapThresholds = [null, 60, 70, 80, 95],
  onChange,
  title = "Match Threshold",
  subtitle = "Tap a snap point to filter quickly",
  width = 420,
}) {
  const [threshold, setThreshold] = useState<number | null>(initialThreshold);
  // Track cumulative rotation to ensure clockwise movement
  const [cumulativeRotation, setCumulativeRotation] = useState(270);
  const prevRotationRef = React.useRef(270);

  // Unique ids so gradients/filters don't collide if you render multiple gauges
  const uid = React.useId();
  const gradId = `spdA_grad_${uid}`;
  const shadowId = `needleShadow_${uid}`;
  // Hard filter only - no mode or behavior toggles needed

  // Gauge geometry - reduced for compact size
  const cx = 210;
  const cy = 150;
  const r = 120;
  // Top semicircle: left (270°) to right (90°)
  const startAngle = 270;
  const endAngle = 90;

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
      // and we want the arc to sweep clockwise (sweepFlag=1).
      const largeArcFlag = 0;
      const sweepFlag = 1;
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
    (t: number | null, currentRotation: number = 270) => {
      // User requirements (absolute angles where 0° = straight up):
      // 0% (Any) = 270° absolute (left)
      // 60% = 18° absolute (18° clockwise from up)
      // 70% = 36° absolute (36° clockwise from up)
      // 80% = 54° absolute (54° clockwise from up)
      // 95% = 81° absolute (81° clockwise from up)
      // 100% = 90° absolute (right)
      // Needle line points up initially (0°), so rotation = absolute angle
      if (t == null || t === 0) {
        return 270; // Any/0% - rotate 270° clockwise from up to point left
      }
      const p = Number(t);
      let absoluteAngle: number;
      
      // Piecewise linear interpolation based on known points
      // These are absolute angles where 0° = up
      if (p <= 60) {
        // 0% → 270°, 60% → 18°
        // To go clockwise from 270° to 18°, we need to wrap: 270° → 360° → 18°
        // Calculate the clockwise rotation: (p/60) * 108 degrees
        const clockwiseRotation = (p / 60) * 108; // 108° clockwise from 270° to 18°
        const result = 270 + clockwiseRotation;
        absoluteAngle = result >= 360 ? result - 360 : result;
      } else if (p <= 70) {
        // 60% → 18°, 70% → 36°
        absoluteAngle = 18 + ((p - 60) / 10) * (36 - 18);
      } else if (p <= 80) {
        // 70% → 36°, 80% → 54°
        absoluteAngle = 36 + ((p - 70) / 10) * (54 - 36);
      } else if (p <= 95) {
        // 80% → 54°, 95% → 81°
        absoluteAngle = 54 + ((p - 80) / 15) * (81 - 54);
      } else {
        // 95% → 81°, 100% → 90°
        absoluteAngle = 81 + ((p - 95) / 5) * (90 - 81);
      }
      
      // Normalize to 0-360 range
      const rot = ((absoluteAngle % 360) + 360) % 360;
      return rot;
    },
    []
  );

  // Calculate target angle
  const targetAngle = useMemo(() => thresholdToNeedleRotation(threshold), [thresholdToNeedleRotation, threshold]);
  
  // Update cumulative rotation to ensure correct direction
  useEffect(() => {
    const currentNormalized = prevRotationRef.current % 360;
    const targetNormalized = targetAngle % 360;
    const currentCumulative = prevRotationRef.current;
    
    if (targetNormalized === currentNormalized) {
      // Same angle, no change needed
      return;
    }
    
    let nextRotation: number;
    
    // Case 1: Going FROM Any (270°) TO a smaller angle (like 18° for 60%)
    // We want CLOCKWISE: 270° → 360° → 18°
    // To force clockwise, cumulative must increase: 270° → 378° (18° + 360°)
    if (currentNormalized === 270 && targetNormalized < 270) {
      // Ensure cumulative increases to force clockwise
      nextRotation = targetAngle + 360;
    }
    // Case 2: Going FROM any angle TO Any (270°)
    // We want COUNTER-CLOCKWISE: smaller angles → 0° → 270°, larger angles → 270°
    // To force counter-clockwise, cumulative must decrease
    else if (targetNormalized === 270) {
      // Current might be 18° (from 60+), 36° (from 70+), 81° (from 95+), etc.
      // We want to go backwards to 270°, so subtract 360° from target
      // This makes cumulative decrease, forcing counter-clockwise
      const targetCumulative = targetAngle - 360;
      // Ensure it's less than current cumulative
      if (targetCumulative >= currentCumulative) {
        nextRotation = targetCumulative - 360;
      } else {
        nextRotation = targetCumulative;
      }
    }
    // Case 3: Normal progression - smaller to larger (clockwise)
    // e.g., 18° → 36° → 54° → 81° → 90°
    // Need to ensure cumulative increases to force clockwise
    else if (targetNormalized > currentNormalized) {
      // If current cumulative is already > 360°, we need to add 360° to target
      // to ensure cumulative continues increasing (clockwise)
      if (currentCumulative >= 360) {
        nextRotation = targetAngle + 360;
      } else {
        nextRotation = targetAngle;
      }
    }
    // Case 4: Larger to smaller (but not the Any case) - should go clockwise through 360°
    else {
      nextRotation = targetAngle + 360;
    }
    
    prevRotationRef.current = nextRotation;
    setCumulativeRotation(nextRotation);
  }, [targetAngle]);
  
  // Use cumulative rotation directly (not normalized) to force correct direction
  // CSS will see the actual cumulative value, ensuring correct transition direction
  const rotation = cumulativeRotation;

  const readout = useMemo(() => {
    if (threshold == null) return { main: "Any", suffix: "" };
    return { main: String(threshold), suffix: "%+" };
  }, [threshold]);

  // Hard filter only - no note needed

  const emit = useCallback(
    (next: { threshold: number | null; mode: "filter"; behavior: "hard" }) => {
      if (typeof onChange === "function") onChange(next);
    },
    [onChange]
  );

  const setAll = useCallback(
    (next: Partial<{ threshold: number | null }>) => {
      // next: partial - only threshold needed for hard filter
      const nextState = {
        threshold: next.threshold !== undefined ? next.threshold : threshold,
        mode: "filter" as const,
        behavior: "hard" as const,
      };
      // Always update state and emit, even if value appears the same (handles null case)
      if (next.threshold !== undefined) {
        setThreshold(next.threshold);
      }
      // Always emit the new state with hard filter mode
      emit(nextState);
    },
    [threshold, emit]
  );

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100">
      <div
        className="rounded-2xl border border-slate-900/10 dark:border-slate-100/10 bg-white dark:bg-slate-800 p-3 shadow-[0_8px_24px_rgba(2,6,23,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        style={{ width, maxWidth: "100%" }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[14px] font-extrabold">{title}</div>
            <div className="text-[11px] text-slate-900/60 dark:text-slate-400">{subtitle}</div>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative mt-2">
          <svg
            viewBox="0 0 420 180"
            className="block h-auto w-full"
            aria-label="Speedometer"
            role="img"
            style={{ maxHeight: "140px" }}
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
              {/* Needle line pointing up initially (towards 0°), will rotate to absolute angles */}
              <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" className="dark:stroke-slate-100" />
              <circle cx={cx} cy={cy} r={16} fill="#0f172a" className="dark:fill-slate-100" />
              <circle cx={cx} cy={cy} r={9} fill="white" opacity="0.12" />
            </g>
          </svg>

          {/* Readout */}
          <div className="pointer-events-none absolute left-0 right-0 top-[45px] text-center">
            {threshold == null ? (
              <div className="text-[28px] font-black tracking-tight text-slate-900/90 dark:text-slate-100/90">Any</div>
            ) : (
              <div className="text-[32px] font-black tracking-tight text-slate-900/90 dark:text-slate-100/90">
                {readout.main}
                <span className="ml-1 text-[14px] font-extrabold text-slate-900/60 dark:text-slate-100/60">{readout.suffix}</span>
              </div>
            )}
          </div>
        </div>

        {/* Snap buttons */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {snapThresholds.map((v, idx) => {
            const label = v == null ? "Any" : `${v}+`;
            const active = v === threshold;
            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                onClick={() => setAll({ threshold: v })}
                className={
                  "select-none rounded-xl border px-2.5 py-1.5 text-[12px] font-extrabold transition active:scale-[0.98] " +
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

      </div>
    </div>
  );
}

/**
 * Usage
 *
 * <SpeedometerOptionA
 *   initialThreshold={null}
 *   snapThresholds={[null, 60, 70, 80, 95]}
 *   onChange={({threshold, mode, behavior}) => {
 *     // threshold is number|null
 *     // mode: always 'filter'
 *     // behavior: always 'hard'
 *   }}
 * */
