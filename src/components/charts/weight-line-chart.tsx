"use client";

import { useState } from "react";
import { WeightPoint } from "@/lib/analytics";

const WIDTH = 320;
const HEIGHT = 160;
const PAD = 26;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function WeightLineChart({ points }: { points: WeightPoint[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nog niet genoeg data — log dit gewicht nog een paar keer om je progressie te zien.
      </p>
    );
  }

  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const plotWidth = WIDTH - PAD * 2;
  const plotHeight = HEIGHT - PAD * 2;

  const coords = points.map((p, i) => ({
    x: PAD + (points.length === 1 ? 0 : (i / (points.length - 1)) * plotWidth),
    y: PAD + plotHeight - ((p.weight - min) / range) * plotHeight,
    ...p,
  }));

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full touch-manipulation"
      role="img"
      aria-label="Gewichtsprogressie"
    >
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={WIDTH - PAD}
          y1={PAD + plotHeight * f}
          y2={PAD + plotHeight * f}
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => {
        const isLast = i === coords.length - 1;
        const isActive = active === i;
        return (
          <g key={c.date} onClick={() => setActive(isActive ? null : i)} className="cursor-pointer">
            <circle cx={c.x} cy={c.y} r={10} fill="transparent" />
            <circle
              cx={c.x}
              cy={c.y}
              r={isLast || isActive ? 5 : 4}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth="2"
            />
            {(isActive || isLast) && (
              <text
                x={c.x}
                y={c.y - 10}
                textAnchor={isLast ? "end" : "middle"}
                className="fill-foreground text-[9px] font-medium"
              >
                {c.weight} kg
              </text>
            )}
          </g>
        );
      })}
      <text x={PAD} y={HEIGHT - 6} className="fill-muted-foreground text-[8px]">
        {formatDate(points[0].date)}
      </text>
      <text
        x={WIDTH - PAD}
        y={HEIGHT - 6}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        {formatDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
