"use client";

import { useRouter } from "next/navigation";
import { useAppData } from "@/context/app-data";
import { getTemplate } from "@/lib/program";
import {
  buildSessionFromTemplate,
  completedSetsCount,
  getNextWorkoutId,
  getReviewStatus,
  repsRangeLabel,
} from "@/lib/workout-logic";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkoutId } from "@/lib/types";
import { getQuoteForDate } from "@/lib/quotes";
import Link from "next/link";
import { CalendarClock, ChevronRight, Quote } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function HomePage() {
  const { data, ready, startSession } = useAppData();
  const router = useRouter();

  if (!ready || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Laden…
      </div>
    );
  }

  const { settings, sessions, activeSession } = data;
  const profileId = settings.profile;
  const quote = getQuoteForDate(new Date());
  const review = getReviewStatus(settings);
  const nextId = getNextWorkoutId(sessions);
  const otherId: WorkoutId = nextId === "A" ? "B" : "A";
  const nextTemplate = getTemplate(profileId, nextId);
  const otherTemplate = getTemplate(profileId, otherId);
  const recent = [...sessions]
    .sort((a, b) => (a.dateStart < b.dateStart ? 1 : -1))
    .slice(0, 3);

  function handleStart(id: WorkoutId) {
    const session = buildSessionFromTemplate(profileId, id, settings);
    startSession(session);
    router.push("/workout");
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Vandaag</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-muted px-3.5 py-3 text-sm">
        <Quote className="mt-0.5 size-4 shrink-0 text-orange-500" />
        <p className="italic text-muted-foreground">{quote}</p>
      </div>

      {(review.isUpcoming || review.isOverdue) && (
        <Card
          className={
            review.isOverdue
              ? "border-orange-500/60 bg-orange-500/10"
              : "border-amber-400/50 bg-amber-400/10"
          }
        >
          <CardContent className="flex items-start gap-3 py-1">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-orange-500" />
            <div className="text-sm">
              {review.isOverdue ? (
                <p className="font-medium">
                  Tijd om je schema te herzien — wissel oefeningen voor hun alternatief
                  tijdens je volgende workout voor optimale progressie.
                </p>
              ) : (
                <p className="font-medium">
                  Nog {review.daysLeft} {review.daysLeft === 1 ? "dag" : "dagen"} tot
                  schema-review.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSession ? (
        <Card className="border-orange-500/60">
          <CardHeader>
            <CardTitle>Workout in uitvoering</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {getTemplate(activeSession.profileId ?? profileId, activeSession.templateId).name}{" "}
              &middot; gestart om{" "}
              {new Date(activeSession.dateStart).toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {(() => {
              const { done, total } = completedSetsCount(activeSession);
              return (
                <div className="flex flex-col gap-1.5">
                  <Progress value={total ? (done / total) * 100 : 0} />
                  <p className="text-xs text-muted-foreground">
                    {done} / {total} sets voltooid
                  </p>
                </div>
              );
            })()}
            <Link href="/workout" className={buttonVariants({ size: "lg" })}>
              Doorgaan <ChevronRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Volgende workout: {nextTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {nextTemplate.exercises.map((ex) => (
                <li key={ex.id} className="flex justify-between">
                  <span>{ex.name}</span>
                  <span className="tabular-nums">
                    {ex.defaultSets}x{repsRangeLabel(ex.repsMin, ex.repsMax)}
                    {ex.unit === "seconds" ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <Button size="lg" onClick={() => handleStart(nextId)}>
              Start {nextTemplate.name}
            </Button>
            <button
              className="text-xs text-muted-foreground underline underline-offset-2"
              onClick={() => handleStart(otherId)}
            >
              In plaats daarvan {otherTemplate.name} starten
            </button>
          </CardContent>
        </Card>
      )}

      {recent.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Recente workouts
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((s) => {
              const { done, total } = completedSetsCount(s);
              return (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between py-1 text-sm">
                    <span>{getTemplate(s.profileId ?? profileId, s.templateId).name}</span>
                    <span className="text-muted-foreground">{formatDate(s.dateStart)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {done}/{total} sets
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
