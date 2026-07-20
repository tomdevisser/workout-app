"use client";

import { useState } from "react";
import { useAppData } from "@/context/app-data";
import { genId } from "@/lib/storage";
import { mealsForDate } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Camera, Sparkles, Trash2 } from "lucide-react";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionPage() {
  const { data, ready, addMeal, deleteMeal } = useAppData();
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [estimated, setEstimated] = useState(false);
  const [rawDescription, setRawDescription] = useState<string | undefined>(undefined);

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  if (!ready || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Laden…
      </div>
    );
  }

  const date = todayIso();
  const meals = mealsForDate(data.mealLogs, date);
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
      fat: acc.fat + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  function resetForm() {
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setDescription("");
    setEstimated(false);
    setRawDescription(undefined);
    setAnalyzeError(null);
  }

  async function handleAnalyze() {
    const trimmed = description.trim();
    if (!trimmed) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analyse mislukt.");
      setName(data.title);
      setCalories(String(Math.round(data.calories)));
      setProtein(String(Math.round(data.protein)));
      setCarbs(String(Math.round(data.carbs)));
      setFat(String(Math.round(data.fat)));
      setEstimated(true);
      setRawDescription(trimmed);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analyse mislukt.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleAdd() {
    if (!name.trim()) return;
    addMeal({
      id: genId("meal"),
      date,
      time: new Date().toTimeString().slice(0, 5),
      name: name.trim(),
      calories: calories ? Number(calories) : undefined,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      estimated,
      rawDescription,
    });
    resetForm();
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Voeding</h1>
        <p className="text-sm text-muted-foreground">Vandaag</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-4 gap-2 py-1 text-center">
          <div>
            <p className="text-lg font-bold tabular-nums">{Math.round(totals.calories)}</p>
            <p className="text-[11px] text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{Math.round(totals.protein)}</p>
            <p className="text-[11px] text-muted-foreground">eiwit (g)</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{Math.round(totals.carbs)}</p>
            <p className="text-[11px] text-muted-foreground">koolh. (g)</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{Math.round(totals.fat)}</p>
            <p className="text-[11px] text-muted-foreground">vet (g)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Maaltijd toevoegen</p>
            <Button
              variant="secondary"
              size="sm"
              disabled
              title="Binnenkort: macro's schatten met een foto"
            >
              <Camera className="size-3.5" /> Scan (binnenkort)
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meal-description" className="text-xs">
              Beschrijf wat je hebt gegeten
            </Label>
            <Textarea
              id="meal-description"
              placeholder="Bijv. 2 boterhammen met pindakaas en een banaan"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={handleAnalyze}
              disabled={analyzing || !description.trim()}
            >
              <Sparkles className="size-4" />
              {analyzing ? "Analyseren…" : "Analyseer met AI"}
            </Button>
            {analyzeError && (
              <p className="text-xs text-destructive">{analyzeError}</p>
            )}
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            {estimated ? "Geschat door AI — controleer en pas zo nodig aan:" : "Of vul handmatig in:"}
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meal-name" className="text-xs">Naam</Label>
            <Input
              id="meal-name"
              placeholder="Bijv. Havermout met yoghurt"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setEstimated(false);
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="meal-cal" className="text-xs">kcal</Label>
              <Input
                id="meal-cal"
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="meal-protein" className="text-xs">Eiwit</Label>
              <Input
                id="meal-protein"
                type="number"
                inputMode="numeric"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="meal-carbs" className="text-xs">Koolh.</Label>
              <Input
                id="meal-carbs"
                type="number"
                inputMode="numeric"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="meal-fat" className="text-xs">Vet</Label>
              <Input
                id="meal-fat"
                type="number"
                inputMode="numeric"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Toevoegen
          </Button>
        </CardContent>
      </Card>

      {meals.length > 0 && (
        <div className="flex flex-col gap-2">
          {meals.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">
                    {m.name}
                    {m.estimated && (
                      <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                        (AI-schatting)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.time} &middot; {m.calories ?? 0} kcal &middot; E {m.protein ?? 0}g &middot;{" "}
                    K {m.carbs ?? 0}g &middot; V {m.fat ?? 0}g
                  </p>
                </div>
                <button
                  onClick={() => deleteMeal(m.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Verwijder maaltijd"
                >
                  <Trash2 className="size-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
