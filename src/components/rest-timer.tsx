"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifyRestDone } from "@/lib/sound";

interface RestTimerProps {
  exerciseName: string;
  totalSeconds: number;
  onCancel: () => void;
}

export function RestTimer({ exerciseName, totalSeconds, onCancel }: RestTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        notifyRestDone();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;
  const progress =
    totalSeconds > 0
      ? Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100)
      : 100;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-auto w-full max-w-md px-4">
      <div className="rounded-2xl border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Rust &middot; {exerciseName}</p>
            <p
              className={`text-3xl font-bold tabular-nums ${
                remaining <= 0 ? "text-primary" : ""
              }`}
            >
              {remaining < 0 ? "0:00" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRemaining((r) => r + 15)}
            >
              +15s
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancel} aria-label="Sluit timer">
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
