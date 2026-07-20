"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/app-data";
import { getExerciseDef, getProfileTemplates, getTemplate } from "@/lib/program";
import {
  buildSessionFromTemplate,
  completedSetsCount,
  getNextWorkoutId,
  getRestSeconds,
  repsRangeLabel,
} from "@/lib/workout-logic";
import { ExerciseDef, ExerciseLog, SetLog, WorkoutId, WorkoutSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RestTimer } from "@/components/rest-timer";
import { ExerciseIllustration } from "@/components/exercise-illustration";
import { Check, Lightbulb, Minus, Plus, Repeat, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function StartPicker() {
  const { data, startSession } = useAppData();
  const router = useRouter();
  if (!data) return null;
  const profileId = data.settings.profile;
  const templates = getProfileTemplates(profileId);
  const nextId = getNextWorkoutId(data.sessions);

  function handleStart(id: WorkoutId) {
    const session = buildSessionFromTemplate(profileId, id, data!.settings);
    startSession(session);
    router.push("/workout");
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="text-2xl font-bold">Workout starten</h1>
      <p className="text-sm text-muted-foreground">
        Aanbevolen: Workout {nextId} (op basis van je laatste sessie).
      </p>
      <div className="flex flex-col gap-3">
        {templates.map((template) => (
          <Card key={template.id} className={cn(template.id === nextId && "border-orange-500/60")}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {template.exercises.map((ex) => (
                  <li key={ex.id} className="flex justify-between">
                    <span>{ex.name}</span>
                    <span className="tabular-nums">
                      {ex.defaultSets}x{repsRangeLabel(ex.repsMin, ex.repsMax)}
                      {ex.unit === "seconds" ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleStart(template.id)}>
                Start {template.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function targetLabel(ex: ExerciseLog) {
  const range = repsRangeLabel(ex.repsMin, ex.repsMax);
  const unit = ex.unit === "seconds" ? "sec" : "reps";
  return `${ex.sets.length} x ${range} ${unit}${ex.perSide ? " /been" : ""}`;
}

function ActiveWorkout({ session }: { session: WorkoutSession }) {
  const { data, updateActiveSession, finishActiveSession, discardActiveSession } =
    useAppData();
  const router = useRouter();
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [timer, setTimer] = useState<{ exerciseName: string; seconds: number; key: number } | null>(
    null,
  );

  const settings = data!.settings;
  const { done, total } = completedSetsCount(session);
  const profileId = session.profileId ?? settings.profile;

  function patchExercise(exerciseId: string, updater: (ex: ExerciseLog) => ExerciseLog) {
    const next: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.exerciseId === exerciseId ? updater(ex) : ex,
      ),
    };
    updateActiveSession(next);
  }

  function patchSet(
    exerciseId: string,
    setNumber: number,
    updater: (s: SetLog) => SetLog,
  ) {
    patchExercise(exerciseId, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.setNumber === setNumber ? updater(s) : s)),
    }));
  }

  function toggleComplete(ex: ExerciseLog, set: SetLog) {
    const nextCompleted = !set.completed;
    patchSet(ex.exerciseId, set.setNumber, (s) => ({ ...s, completed: nextCompleted }));
    if (nextCompleted) {
      const seconds = getRestSeconds(ex.exerciseId);
      setTimer({ exerciseName: ex.name, seconds, key: Date.now() });
    }
  }

  function toggleAlternative(ex: ExerciseLog, def: ExerciseDef) {
    const usingAlternative = ex.name === def.alternative;
    patchExercise(ex.exerciseId, (e) => ({
      ...e,
      name: usingAlternative ? def.name : def.alternative,
    }));
  }

  function addSet(ex: ExerciseLog) {
    patchExercise(ex.exerciseId, (e) => ({
      ...e,
      sets: [
        ...e.sets,
        { setNumber: e.sets.length + 1, weight: null, reps: null, completed: false },
      ],
    }));
  }

  function removeSet(ex: ExerciseLog) {
    if (ex.sets.length <= 1) return;
    patchExercise(ex.exerciseId, (e) => ({
      ...e,
      sets: e.sets
        .slice(0, -1)
        .map((s, i) => ({ ...s, setNumber: i + 1 })),
    }));
  }

  function handleFinish() {
    finishActiveSession();
    router.push("/");
  }

  function handleDiscard() {
    discardActiveSession();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-2 pt-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{getTemplate(profileId, session.templateId).name}</h1>
          <span className="text-xs text-muted-foreground">
            {done}/{total} sets
          </span>
        </div>
        <Progress value={total ? (done / total) * 100 : 0} className="mt-2" />
      </div>

      {session.exercises.map((ex) => {
        const def = getExerciseDef(ex.exerciseId);
        const usingAlternative = def ? ex.name === def.alternative : false;
        const isBodyweight = ex.bodyweight;
        return (
        <Card key={ex.exerciseId}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                {def && <ExerciseIllustration category={def.category} />}
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-base">{ex.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Doel: {targetLabel(ex)}</p>
                </div>
              </div>
              {def && (
                <button
                  onClick={() => toggleAlternative(ex, def)}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                    usingAlternative
                      ? "border-orange-500 bg-orange-500/10 text-orange-600"
                      : "text-muted-foreground",
                  )}
                >
                  <Repeat className="size-3" />
                  {usingAlternative ? "Alternatief" : "Wissel"}
                </button>
              )}
            </div>
            {def?.tip && (
              <p className="mt-2 flex items-start gap-1.5 rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-orange-500" />
                {def.tip}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-1.5 text-xs text-muted-foreground">
              <span></span>
              <span>
                {ex.unit === "seconds" ? "Seconden" : isBodyweight ? "Reps" : "Gewicht (kg)"}
              </span>
              <span>{ex.unit === "seconds" || isBodyweight ? "" : "Reps"}</span>
              <span></span>
            </div>
            {ex.sets.map((set) => {
              const lastWeight = settings.lastUsedWeights[ex.exerciseId];
              return (
                <div
                  key={set.setNumber}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-1.5"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {set.setNumber}
                  </span>
                  {ex.unit === "seconds" || isBodyweight ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
                      placeholder={repsRangeLabel(ex.repsMin, ex.repsMax)}
                      value={set.reps ?? ""}
                      onChange={(e) =>
                        patchSet(ex.exerciseId, set.setNumber, (s) => ({
                          ...s,
                          reps: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                    />
                  ) : (
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
                      placeholder={lastWeight ? String(lastWeight) : "kg"}
                      value={set.weight ?? ""}
                      onChange={(e) =>
                        patchSet(ex.exerciseId, set.setNumber, (s) => ({
                          ...s,
                          weight: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                    />
                  )}
                  {ex.unit === "seconds" || isBodyweight ? (
                    <span />
                  ) : (
                    <input
                      type="number"
                      inputMode="numeric"
                      className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
                      placeholder={repsRangeLabel(ex.repsMin, ex.repsMax)}
                      value={set.reps ?? ""}
                      onChange={(e) =>
                        patchSet(ex.exerciseId, set.setNumber, (s) => ({
                          ...s,
                          reps: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                    />
                  )}
                  <button
                    onClick={() => toggleComplete(ex, set)}
                    aria-label="Set voltooid"
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border transition-colors",
                      set.completed
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-input text-muted-foreground",
                    )}
                  >
                    <Check className="size-4" />
                  </button>
                </div>
              );
            })}
            <div className="mt-1 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => addSet(ex)}>
                <Plus className="size-3.5" /> Set
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSet(ex)}
                disabled={ex.sets.length <= 1}
              >
                <Minus className="size-3.5" /> Set
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}

      <div className="flex flex-col gap-2">
        {confirmFinish ? (
          <div className="flex flex-col gap-2 rounded-lg border p-3">
            <p className="text-sm">Workout afronden en opslaan in historie?</p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleFinish}>
                Ja, afronden
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmFinish(false)}>
                Annuleren
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={() => setConfirmFinish(true)}>
            Workout voltooien
          </Button>
        )}

        {confirmDiscard ? (
          <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 p-3">
            <p className="text-sm">
              Workout verwijderen zonder op te slaan? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={handleDiscard}>
                Ja, verwijderen
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDiscard(false)}>
                Annuleren
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(true)}>
            <Trash2 className="size-3.5" /> Workout annuleren
          </Button>
        )}
      </div>

      {timer && (
        <RestTimer
          key={timer.key}
          exerciseName={timer.exerciseName}
          totalSeconds={timer.seconds}
          onCancel={() => setTimer(null)}
        />
      )}
    </div>
  );
}

export default function WorkoutPage() {
  const { data, ready } = useAppData();

  const activeSession = useMemo(() => data?.activeSession ?? null, [data]);

  if (!ready || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Laden…
      </div>
    );
  }

  if (!activeSession) return <StartPicker />;

  return <ActiveWorkout session={activeSession} />;
}
