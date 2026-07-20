import { getExerciseDef, getTemplate } from "./program";
import { ExerciseLog, ProfileId, Settings, WorkoutId, WorkoutSession } from "./types";
import { genId } from "./storage";

export const REVIEW_INTERVAL_WEEKS = 6;

export function repsRangeLabel(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`;
}

export function workoutLabel(templateId: WorkoutId): string {
  return `Workout ${templateId}`;
}

export function getNextWorkoutId(sessions: WorkoutSession[]): WorkoutId {
  if (sessions.length === 0) return "A";
  const last = [...sessions].sort((a, b) =>
    a.dateStart < b.dateStart ? 1 : -1,
  )[0];
  return last.templateId === "A" ? "B" : "A";
}

export function buildSessionFromTemplate(
  profileId: ProfileId,
  templateId: WorkoutId,
  settings: Settings,
): WorkoutSession {
  const template = getTemplate(profileId, templateId);
  const exercises: ExerciseLog[] = template.exercises.map((def) => {
    const previousWeight = settings.lastUsedWeights[def.id] ?? def.startWeight ?? null;
    return {
      exerciseId: def.id,
      name: def.name,
      unit: def.unit,
      perSide: def.perSide,
      bodyweight: def.bodyweight,
      repsMin: def.repsMin,
      repsMax: def.repsMax,
      sets: Array.from({ length: def.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        weight: def.unit === "seconds" || def.bodyweight ? null : previousWeight,
        reps: null,
        completed: false,
      })),
    };
  });

  return {
    id: genId("session"),
    profileId,
    templateId,
    dateStart: new Date().toISOString(),
    exercises,
  };
}

export function getRestSeconds(exerciseId: string): number {
  return getExerciseDef(exerciseId)?.restSeconds ?? 90;
}

export interface ReviewStatus {
  reviewDate: Date;
  daysLeft: number;
  isOverdue: boolean;
  isUpcoming: boolean;
}

export function getReviewStatus(settings: Settings): ReviewStatus {
  const start = new Date(settings.programStartDate + "T00:00:00");
  const reviewDate = new Date(start);
  reviewDate.setDate(reviewDate.getDate() + REVIEW_INTERVAL_WEEKS * 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.round((reviewDate.getTime() - today.getTime()) / msPerDay);

  return {
    reviewDate,
    daysLeft,
    isOverdue: daysLeft <= 0,
    isUpcoming: daysLeft > 0 && daysLeft <= 7,
  };
}

export function completedSetsCount(session: WorkoutSession): {
  done: number;
  total: number;
} {
  let done = 0;
  let total = 0;
  for (const ex of session.exercises) {
    for (const s of ex.sets) {
      total += 1;
      if (s.completed) done += 1;
    }
  }
  return { done, total };
}
