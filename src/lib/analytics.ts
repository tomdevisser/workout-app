import { WorkoutSession } from "./types";

export interface WeekCount {
  weekStart: string;
  label: string;
  count: number;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function workoutsPerWeek(
  sessions: WorkoutSession[],
  weeks: number,
): WeekCount[] {
  const currentWeekStart = startOfWeek(new Date());
  const result: WeekCount[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = sessions.filter((s) => {
      const d = new Date(s.dateStart);
      return d >= weekStart && d < weekEnd;
    }).length;
    result.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      label: weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      count,
    });
  }
  return result;
}

export function countInCurrentMonth(sessions: WorkoutSession[]): number {
  const now = new Date();
  return sessions.filter((s) => {
    const d = new Date(s.dateStart);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

export function currentStreakWeeks(sessions: WorkoutSession[]): number {
  const weeks = workoutsPerWeek(sessions, 52);
  let streak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].count > 0) {
      streak++;
    } else if (i === weeks.length - 1) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export interface WeightPoint {
  date: string;
  weight: number;
}

export function exerciseWeightHistory(
  sessions: WorkoutSession[],
  exerciseId: string,
): WeightPoint[] {
  const sorted = [...sessions].sort((a, b) => (a.dateStart < b.dateStart ? -1 : 1));
  const points: WeightPoint[] = [];
  for (const s of sorted) {
    const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const weights = ex.sets
      .map((set) => set.weight)
      .filter((w): w is number => typeof w === "number" && w > 0);
    if (weights.length === 0) continue;
    points.push({ date: s.dateStart, weight: Math.max(...weights) });
  }
  return points;
}

export function listLoggedExerciseIds(sessions: WorkoutSession[]): string[] {
  const ids = new Set<string>();
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (ex.sets.some((set) => typeof set.weight === "number" && set.weight > 0)) {
        ids.add(ex.exerciseId);
      }
    }
  }
  return Array.from(ids);
}
