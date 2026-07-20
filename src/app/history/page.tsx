"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/context/app-data";
import { getTemplate } from "@/lib/program";
import { completedSetsCount } from "@/lib/workout-logic";
import { WorkoutSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsView } from "@/components/analytics-view";
import { Download, Upload } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SessionDetail({ session }: { session: WorkoutSession }) {
  return (
    <div className="flex flex-col gap-4">
      {session.exercises.map((ex) => (
        <div key={ex.exerciseId}>
          <p className="text-sm font-medium">{ex.name}</p>
          <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
            {ex.sets.map((s) => (
              <div key={s.setNumber} className="flex justify-between">
                <span>Set {s.setNumber}</span>
                <span className="tabular-nums">
                  {ex.unit === "seconds"
                    ? `${s.reps ?? "-"} sec`
                    : `${s.weight ?? "-"} kg x ${s.reps ?? "-"}`}
                  {s.completed ? " ✓" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { data, ready, exportData, importData } = useAppData();
  const [selected, setSelected] = useState<WorkoutSession | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!ready || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Laden…
      </div>
    );
  }

  const sessions = [...data.sessions].sort((a, b) =>
    a.dateStart < b.dateStart ? 1 : -1,
  );
  const currentProfile = data.settings.profile;

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setImportMsg("Data geïmporteerd.");
    } catch {
      setImportMsg("Import mislukt: ongeldig bestand.");
    } finally {
      e.target.value = "";
      setTimeout(() => setImportMsg(null), 4000);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-bold">Historie</h1>
        <p className="text-sm text-muted-foreground">
          {sessions.length} workout{sessions.length === 1 ? "" : "s"} opgeslagen
        </p>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="w-full">
          <TabsTrigger value="sessions" className="flex-1">
            Sessies
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            Voortgang
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={exportData}>
              <Download className="size-4" /> Exporteer back-up
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" /> Importeer
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {importMsg && <p className="text-xs text-muted-foreground">{importMsg}</p>}

          {sessions.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Nog geen workouts voltooid. Start je eerste workout via de Workout-tab.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.map((s) => {
                const { done, total } = completedSetsCount(s);
                return (
                  <button key={s.id} onClick={() => setSelected(s)} className="text-left">
                    <Card>
                      <CardContent className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium">
                            {getTemplate(s.profileId ?? currentProfile, s.templateId).name}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(s.dateStart)}</p>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {done}/{total} sets
                        </span>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsView sessions={sessions} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected &&
                getTemplate(selected.profileId ?? currentProfile, selected.templateId).name}{" "}
              &middot;{" "}
              {selected && formatDate(selected.dateStart)}
            </DialogTitle>
          </DialogHeader>
          {selected && <SessionDetail session={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
