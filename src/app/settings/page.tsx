"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/context/app-data";
import { PROFILE_LIST } from "@/lib/program";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyGoals, ProfileId } from "@/lib/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function SettingsPage() {
  const { data, ready, updateSettings, exportData, importData, resetAllData } =
    useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!ready || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Laden…
      </div>
    );
  }

  const { settings } = data;
  const goals = settings.dailyGoals?.[settings.profile];

  function handleProfileChange(id: ProfileId) {
    if (id === settings.profile) return;
    updateSettings({ profile: id, programStartDate: todayIso() });
  }

  function handleGoalChange(field: keyof DailyGoals, value: string) {
    const current = goals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    updateSettings({
      dailyGoals: {
        ...settings.dailyGoals,
        [settings.profile]: { ...current, [field]: Number(value) || 0 },
      },
    });
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setMsg("Data geïmporteerd.");
    } catch {
      setMsg("Import mislukt: ongeldig bestand.");
    } finally {
      e.target.value = "";
      setTimeout(() => setMsg(null), 4000);
    }
  }

  function handleReset() {
    resetAllData();
    setConfirmReset(false);
    setMsg("Workouts en voeding gewist. Instellingen zijn behouden.");
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-bold">Instellingen</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trainingsschema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {PROFILE_LIST.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileChange(profile.id)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  settings.profile === profile.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                {profile.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Bepaalt welk schema je op het Vandaag- en Workout-scherm ziet.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dagelijkse doelen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-cal" className="text-xs">kcal</Label>
              <Input
                id="goal-cal"
                type="number"
                inputMode="numeric"
                value={goals?.calories ?? ""}
                onChange={(e) => handleGoalChange("calories", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-protein" className="text-xs">Eiwit</Label>
              <Input
                id="goal-protein"
                type="number"
                inputMode="numeric"
                value={goals?.protein ?? ""}
                onChange={(e) => handleGoalChange("protein", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-carbs" className="text-xs">Koolh.</Label>
              <Input
                id="goal-carbs"
                type="number"
                inputMode="numeric"
                value={goals?.carbs ?? ""}
                onChange={(e) => handleGoalChange("carbs", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-fat" className="text-xs">Vet</Label>
              <Input
                id="goal-fat"
                type="number"
                inputMode="numeric"
                value={goals?.fat ?? ""}
                onChange={(e) => handleGoalChange("fat", e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Wordt gebruikt om je voortgang te tonen op het Voeding-scherm, per profiel.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data-beheer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Alle data staat lokaal op dit apparaat. Exporteer regelmatig een back-up —
            dit bestand kun je ook delen met AI voor analyse van je voortgang.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={exportData}>
              <Download className="size-4" /> Exporteer
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
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}

          <Separator />

          {confirmReset ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                Weet je zeker dat je alle workouts en voedingslogs wilt wissen? Dit kan
                niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handleReset}>
                  Ja, wis alles
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmReset(false)}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
              Alle workouts &amp; voeding wissen
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
