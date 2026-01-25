import React, { useState, useEffect, useRef } from "react";

interface SpeedometerFilterProps {
  initialThreshold?: number | null;
  snapThresholds?: (number | null)[];
  onChange?: (state: {
    threshold: number | null;
    mode: "filter" | "sort";
    behavior: "hard" | "soft";
  }) => void;
}

export const SpeedometerFilter: React.FC<SpeedometerFilterProps> = ({
  initialThreshold = 80,
  snapThresholds = [null, 60, 70, 80, 95],
  onChange,
}) => {
  const [threshold, setThreshold] = useState<number | null>(initialThreshold);
  const [mode, setMode] = useState<"filter" | "sort">("filter");
  const [behavior, setBehavior] = useState<"hard" | "soft">("hard");
  
  const svgRef = useRef<SVGSVGElement>(null);
  const arcBgRef = useRef<SVGPathElement>(null);
  const arcColorRef = useRef<SVGPathElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  // SVG geometry constants
  const cx = 210;
  const cy = 190;
  const r = 150;
  const startAngle = 225;
  const endAngle = -45;

  // Helper: Convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleDeg: number) => {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(a),
      y: centerY + radius * Math.sin(a),
    };
  };

  // Helper: Create arc path
  const arcPath = (centerX: number, centerY: number, radius: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(centerX, centerY, radius, startAng);
    const end = polarToCartesian(centerX, centerY, radius, endAng);
    const largeArcFlag = 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Convert threshold to angle
  const thresholdToAngle = (thresh: number | null) => {
    const t = thresh == null ? 0 : Math.max(0, Math.min(100, thresh)) / 100;
    return startAngle + (endAngle - startAngle) * t;
  };

  // Initialize SVG elements
  useEffect(() => {
    if (!svgRef.current || !arcBgRef.current || !arcColorRef.current || !ticksRef.current) return;

    // Set background and color arcs
    arcBgRef.current.setAttribute("d", arcPath(cx, cy, r, startAngle, endAngle));
    arcColorRef.current.setAttribute("d", arcPath(cx, cy, r, startAngle, endAngle));

    // Create ticks
    const tickCount = 9;
    ticksRef.current.innerHTML = "";
    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const ang = startAngle + (endAngle - startAngle) * t;
      const p1 = polarToCartesian(cx, cy, r + 2, ang);
      const p2 = polarToCartesian(cx, cy, r - 16, ang);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(p1.x));
      line.setAttribute("y1", String(p1.y));
      line.setAttribute("x2", String(p2.x));
      line.setAttribute("y2", String(p2.y));
      line.setAttribute("class", "spdA-ticks");
      ticksRef.current.appendChild(line);
    }
  }, []);

  // Update needle position
  useEffect(() => {
    if (!needleRef.current) return;
    const ang = thresholdToAngle(threshold);
    const rot = ang - 90;
    needleRef.current.style.transform = `rotate(${rot}deg)`;
  }, [threshold]);

  // Update readout
  useEffect(() => {
    if (!readoutRef.current) return;
    if (threshold == null) {
      readoutRef.current.innerHTML = `Any`;
      readoutRef.current.style.fontSize = "38px";
      readoutRef.current.style.top = "66px";
    } else {
      readoutRef.current.style.fontSize = "";
      readoutRef.current.style.top = "";
      readoutRef.current.innerHTML = `${threshold}<small>%+</small>`;
    }
  }, [threshold]);

  // Emit changes
  useEffect(() => {
    onChange?.({ threshold, mode, behavior });
  }, [threshold, mode, behavior, onChange]);

  // Calculate colored arc based on threshold
  const getColoredArcPath = () => {
    if (threshold == null || threshold === 0) {
      return arcPath(cx, cy, r, startAngle, endAngle);
    }
    const thresholdAngle = thresholdToAngle(threshold);
    return arcPath(cx, cy, r, thresholdAngle, endAngle);
  };

  return (
    <div className="spdA">
      <style>{`
        .spdA { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; }
        .spdA * { box-sizing:border-box; }
        .spdA-card {
          width: 100%; max-width: 420px;
          border: 1px solid rgba(15,23,42,.12);
          border-radius: 16px;
          padding: 16px;
          background: white;
          box-shadow: 0 8px 24px rgba(2,6,23,.06);
        }
        .dark .spdA-card {
          background: #1e293b;
          border-color: rgba(255,255,255,.1);
          color: #f1f5f9;
        }
        .spdA-header { display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap: wrap; }
        .spdA-title { font-weight: 700; font-size: 16px; }
        .spdA-sub { font-size: 12px; color: rgba(15,23,42,.65); }
        .dark .spdA-sub { color: rgba(241,245,249,.65); }

        .spdA-gaugeWrap { position: relative; margin-top: 14px; }
        .spdA-readout {
          position:absolute; left:0; right:0; top: 58px;
          text-align:center;
          font-weight: 800;
          font-size: 44px;
          letter-spacing: -0.02em;
          color: rgba(15,23,42,.9);
          pointer-events:none;
        }
        .dark .spdA-readout { color: rgba(241,245,249,.9); }
        .spdA-readout small { font-size: 18px; font-weight: 700; opacity:.75; margin-left: 2px; }
        .spdA-svg { width: 100%; height: auto; display:block; }
        .spdA-arcBg { stroke: rgba(15,23,42,.08); stroke-width: 18; fill: none; }
        .dark .spdA-arcBg { stroke: rgba(255,255,255,.1); }
        .spdA-arcColor { stroke: url(#spdA_grad); stroke-width: 18; fill:none; stroke-linecap: round; transition: d 220ms cubic-bezier(.2,.8,.2,1); }
        .spdA-ticks { stroke: rgba(15,23,42,.18); stroke-width: 2; }
        .dark .spdA-ticks { stroke: rgba(255,255,255,.2); }
        .spdA-needle {
          transform-origin: 210px 190px;
          transition: transform 220ms cubic-bezier(.2,.8,.2,1);
          filter: drop-shadow(0 6px 10px rgba(2,6,23,.18));
        }
        .spdA-needleLine { stroke: #0f172a; stroke-width: 6; stroke-linecap: round; }
        .dark .spdA-needleLine { stroke: #f1f5f9; }
        .spdA-needleHub { fill: #0f172a; }
        .dark .spdA-needleHub { fill: #f1f5f9; }
        .spdA-needleHubInner { fill: white; opacity: .12; }

        .spdA-row { display:flex; gap:10px; flex-wrap: wrap; margin-top: 12px; }
        .spdA-btn {
          border: 1px solid rgba(15,23,42,.16);
          background: white;
          color: rgba(15,23,42,.9);
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: transform .05s ease, background .15s ease, border-color .15s ease;
          user-select:none;
        }
        .dark .spdA-btn {
          background: #1e293b;
          border-color: rgba(255,255,255,.1);
          color: rgba(241,245,249,.9);
        }
        .spdA-btn:active { transform: scale(.98); }
        .spdA-btn.active {
          background: rgba(37,99,235,.10);
          border-color: rgba(37,99,235,.45);
          color: rgba(30,64,175,1);
        }
        .dark .spdA-btn.active {
          background: rgba(59,130,246,.15);
          border-color: rgba(59,130,246,.5);
          color: rgba(147,197,253,1);
        }

        .spdA-segToggle {
          border: 1px solid rgba(15,23,42,.14);
          background: rgba(2,6,23,.02);
          border-radius: 999px;
          padding: 4px;
          display:flex;
          gap:4px;
        }
        .dark .spdA-segToggle {
          border-color: rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
        }
        .spdA-seg {
          padding: 8px 10px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: 0;
          background: transparent;
          color: rgba(15,23,42,.65);
        }
        .dark .spdA-seg { color: rgba(241,245,249,.65); }
        .spdA-seg.active {
          background: rgba(15,23,42,.92);
          color: white;
        }
        .dark .spdA-seg.active {
          background: rgba(241,245,249,.92);
          color: #0f172a;
        }

        .spdA-foot { margin-top: 12px; display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap: wrap; }
        .spdA-pill {
          border-radius: 999px;
          padding: 8px 10px;
          font-weight: 800;
          font-size: 13px;
          cursor:pointer;
          border: 1px solid rgba(15,23,42,.14);
          background: white;
          color: rgba(15,23,42,.8);
        }
        .dark .spdA-pill {
          background: #1e293b;
          border-color: rgba(255,255,255,.1);
          color: rgba(241,245,249,.8);
        }
        .spdA-pill.active {
          background: rgba(16,185,129,.10);
          border-color: rgba(16,185,129,.40);
          color: rgba(5,150,105,1);
        }
        .dark .spdA-pill.active {
          background: rgba(16,185,129,.15);
          border-color: rgba(16,185,129,.5);
          color: rgba(110,231,183,1);
        }

        .spdA-smallNote { font-size: 12px; color: rgba(15,23,42,.65); }
        .dark .spdA-smallNote { color: rgba(241,245,249,.65); }
      `}</style>

      <div className="spdA-card">
        <div className="spdA-header">
          <div>
            <div className="spdA-title">Match Threshold</div>
            <div className="spdA-sub">Tap a snap point to filter quickly</div>
          </div>
          <div className="spdA-segToggle" role="tablist" aria-label="Mode">
            <button
              className={`spdA-seg ${mode === "filter" ? "active" : ""}`}
              data-mode="filter"
              type="button"
              onClick={() => setMode("filter")}
            >
              Filter
            </button>
            <button
              className={`spdA-seg ${mode === "sort" ? "active" : ""}`}
              data-mode="sort"
              type="button"
              onClick={() => setMode("sort")}
            >
              Sort
            </button>
          </div>
        </div>

        <div className="spdA-gaugeWrap">
          <svg className="spdA-svg" viewBox="0 0 420 220" aria-label="Speedometer" ref={svgRef}>
            <defs>
              <linearGradient id="spdA_grad" x1="60" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ef4444"/>
                <stop offset="0.35" stopColor="#f59e0b"/>
                <stop offset="0.65" stopColor="#22c55e"/>
                <stop offset="1" stopColor="#2563eb"/>
              </linearGradient>
            </defs>

            <path className="spdA-arcBg" d={arcPath(cx, cy, r, startAngle, endAngle)} ref={arcBgRef}></path>
            <path className="spdA-arcColor" d={getColoredArcPath()} ref={arcColorRef}></path>

            <g ref={ticksRef}></g>

            <g className="spdA-needle" ref={needleRef} aria-hidden="true">
              <line className="spdA-needleLine" x1="210" y1="190" x2="345" y2="190"></line>
              <circle className="spdA-needleHub" cx="210" cy="190" r="16"></circle>
              <circle className="spdA-needleHubInner" cx="210" cy="190" r="9"></circle>
            </g>
          </svg>

          <div className="spdA-readout" ref={readoutRef}>80<small>%+</small></div>
        </div>

        <div className="spdA-row">
          {snapThresholds.map((value) => {
            const isActive = value === threshold;
            return (
              <button
                key={value ?? "any"}
                type="button"
                className={`spdA-btn ${isActive ? "active" : ""}`}
                onClick={() => setThreshold(value)}
              >
                {value === null ? "Any" : `${value}+`}
              </button>
            );
          })}
        </div>

        <div className="spdA-foot">
          <button
            className={`spdA-pill ${behavior === "hard" ? "active" : ""}`}
            type="button"
            onClick={() => setBehavior("hard")}
          >
            • Hard Filter
          </button>
          <button
            className={`spdA-pill ${behavior === "soft" ? "active" : ""}`}
            type="button"
            onClick={() => setBehavior("soft")}
          >
            Soft Boost
          </button>
          <div className="spdA-smallNote">
            {mode === "sort"
              ? "Sorting matches by score"
              : behavior === "hard"
              ? "Hiding matches below threshold"
              : "Boosting stronger matches first"}
          </div>
        </div>
      </div>
    </div>
  );
};

