"use client";

import { useState } from "react";
import { WorkoutSession } from "@/lib/types";
import { getExerciseDef } from "@/lib/program";
import {
  countInCurrentMonth,
  currentStreakWeeks,
  exerciseWeightHistory,
  listLoggedExerciseIds,
  workoutsPerWeek,
} from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekBarChart } from "@/components/charts/week-bar-chart";
import { WeightLineChart } from "@/components/charts/weight-line-chart";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted py-3">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-center text-[10px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

export function AnalyticsView({ sessions }: { sessions: WorkoutSession[] }) {
  const loggedExerciseIds = listLoggedExerciseIds(sessions);
  const [selectedExercise, setSelectedExercise] = useState(loggedExerciseIds[0] ?? "");

  if (sessions.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Nog geen data. Rond je eerste workout af om je voortgang hier te zien.
      </p>
    );
  }

  const weeks = workoutsPerWeek(sessions, 10);
  const thisWeek = weeks[weeks.length - 1]?.count ?? 0;
  const streak = currentStreakWeeks(sessions);
  const weightHistory = selectedExercise
    ? exerciseWeightHistory(sessions, selectedExercise)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        <StatTile label="Totaal workouts" value={sessions.length} />
        <StatTile label="Deze week" value={thisWeek} />
        <StatTile label="Deze maand" value={countInCurrentMonth(sessions)} />
        <StatTile label="Weken op rij" value={streak} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workouts per week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekBarChart data={weeks} />
        </CardContent>
      </Card>

      {loggedExerciseIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gewichtsprogressie</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              {loggedExerciseIds.map((id) => {
                const def = getExerciseDef(id);
                return (
                  <option key={id} value={id}>
                    {def?.name ?? id}
                  </option>
                );
              })}
            </select>
            <WeightLineChart points={weightHistory} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
