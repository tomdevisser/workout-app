"use client";

import { useState } from "react";
import { WeekCount } from "@/lib/analytics";

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 6;
const PAD_BOTTOM = 18;
const PAD_TOP = 18;

export function WeekBarChart({ data }: { data: WeekCount[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = plotWidth / data.length;
  const barWidth = Math.min(22, slot * 0.55);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full touch-manipulation"
      role="img"
      aria-label="Workouts per week"
    >
      <line
        x1={PAD_X}
        y1={HEIGHT - PAD_BOTTOM}
        x2={WIDTH - PAD_X}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--border)"
        strokeWidth="1"
      />
      {data.map((d, i) => {
        const x = PAD_X + i * slot + (slot - barWidth) / 2;
        const barHeight = d.count > 0 ? Math.max((d.count / max) * plotHeight, 3) : 0;
        const y = HEIGHT - PAD_BOTTOM - barHeight;
        const isActive = active === i;
        const isLast = i === data.length - 1;
        return (
          <g
            key={d.weekStart}
            onClick={() => setActive(isActive ? null : i)}
            className="cursor-pointer"
          >
            <rect x={x} y={PAD_TOP} width={barWidth} height={plotHeight} fill="transparent" />
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              className={isActive || isLast ? "fill-orange-500" : "fill-orange-500/40"}
            />
            {isActive && (
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-foreground text-[9px] font-medium"
              >
                {d.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={HEIGHT - 5}
              textAnchor="middle"
              className="fill-muted-foreground text-[7.5px]"
            >
              {data.length <= 6 || i % 2 === 0 ? d.label : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
