"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/context/app-data";
import { PROFILE_LIST } from "@/lib/program";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileId } from "@/lib/types";

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

  function handleProfileChange(id: ProfileId) {
    if (id === settings.profile) return;
    updateSettings({ profile: id, programStartDate: todayIso() });
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
        <h1 className="text-2xl font-bold">Instellingen</h1>
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
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
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
