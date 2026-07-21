"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/context/app-data";
import { genId } from "@/lib/storage";
import { mealsForDate } from "@/lib/storage";
import { resizeImageToDataUrl, splitDataUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MealCalendar } from "@/components/meal-calendar";
import { Camera, CalendarDays, Lightbulb, Sparkles, Trash2, X } from "lucide-react";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionPage() {
  const { data, ready, addMeal, deleteMeal } = useAppData();
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [estimated, setEstimated] = useState(false);
  const [rawDescription, setRawDescription] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    suggestion: string;
    reasoning: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

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

  const date = selectedDate;
  const isToday = selectedDate === todayIso();
  const dateLabel = isToday
    ? "Vandaag"
    : new Date(`${selectedDate}T00:00:00`).toLocaleDateString("nl-NL", {
        weekday: "short",
        day: "numeric",
        month: "long",
      });
  const loggedDates = new Set(data.mealLogs.map((m) => m.date));
  const goals = data.settings.dailyGoals?.[data.settings.profile];
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
    setImageDataUrl(null);
    setEstimated(false);
    setRawDescription(undefined);
    setAnalyzeError(null);
    setImageError(null);
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError(null);
    try {
      const resized = await resizeImageToDataUrl(file);
      setImageDataUrl(resized);
    } catch {
      setImageError("Kon de foto niet verwerken.");
    }
  }

  async function handleAnalyze() {
    const trimmed = description.trim();
    if (!trimmed && !imageDataUrl) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const body: { description: string; image?: { data: string; mediaType: string } } = {
        description: trimmed,
      };
      if (imageDataUrl) {
        const { mediaType, data } = splitDataUrl(imageDataUrl);
        body.image = { data, mediaType };
      }
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analyse mislukt.");
      setName(data.title);
      setCalories(String(Math.round(data.calories)));
      setProtein(String(Math.round(data.protein)));
      setCarbs(String(Math.round(data.carbs)));
      setFat(String(Math.round(data.fat)));
      setEstimated(true);
      setRawDescription(trimmed || undefined);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analyse mislukt.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSuggest() {
    if (!goals) return;
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const remaining = {
        calories: Math.max(goals.calories - totals.calories, 0),
        protein: Math.max(goals.protein - totals.protein, 0),
        carbs: Math.max(goals.carbs - totals.carbs, 0),
        fat: Math.max(goals.fat - totals.fat, 0),
      };
      const res = await fetch("/api/suggest-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remaining,
          time: new Date().toTimeString().slice(0, 5),
          loggedMeals: meals.map((m) => m.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Suggestie mislukt.");
      setSuggestion(data);
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : "Suggestie mislukt.");
    } finally {
      setSuggestLoading(false);
    }
  }

  function handleUseSuggestion() {
    if (!suggestion) return;
    setName(suggestion.suggestion);
    setCalories(String(Math.round(suggestion.calories)));
    setProtein(String(Math.round(suggestion.protein)));
    setCarbs(String(Math.round(suggestion.carbs)));
    setFat(String(Math.round(suggestion.fat)));
    setEstimated(true);
    setRawDescription(suggestion.suggestion);
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
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-heading text-2xl font-bold">Voeding</h1>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground capitalize"
        >
          <CalendarDays className="size-3.5" />
          {dateLabel}
        </button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 py-2">
          {goals ? (
            <div className="flex flex-col gap-2.5">
              {(
                [
                  { key: "calories", label: "kcal", value: totals.calories, goal: goals.calories },
                  { key: "protein", label: "Eiwit (g)", value: totals.protein, goal: goals.protein },
                  { key: "carbs", label: "Koolh. (g)", value: totals.carbs, goal: goals.carbs },
                  { key: "fat", label: "Vet (g)", value: totals.fat, goal: goals.fat },
                ] as const
              ).map((m) => {
                const pct = m.goal > 0 ? Math.min(100, (m.value / m.goal) * 100) : 0;
                return (
                  <div key={m.key}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="tabular-nums font-medium">
                        {Math.round(m.value)} / {Math.round(m.goal)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 py-1 text-center">
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
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                Stel dagelijkse doelen in bij Instellingen om je voortgang te zien.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {isToday && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-2">
            <p className="text-sm font-semibold">Wat kun je nu het beste eten?</p>
            {goals ? (
              <>
                <Button variant="secondary" onClick={handleSuggest} disabled={suggestLoading}>
                  <Lightbulb className="size-4" />
                  {suggestLoading ? "Denken…" : "AI suggestie"}
                </Button>
                {suggestError && <p className="text-xs text-destructive">{suggestError}</p>}
                {suggestion && (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm font-medium">{suggestion.suggestion}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                      ~{Math.round(suggestion.calories)} kcal &middot; E {Math.round(suggestion.protein)}g
                      &middot; K {Math.round(suggestion.carbs)}g &middot; V {Math.round(suggestion.fat)}g
                    </p>
                    <Button size="sm" variant="ghost" className="mt-2" onClick={handleUseSuggestion}>
                      Gebruik dit voorstel
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Stel eerst dagelijkse doelen in bij Instellingen voor een AI-suggestie.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isToday && (
      <Card>
        <CardContent className="flex flex-col gap-3 py-2">
          <p className="text-sm font-semibold">Maaltijd toevoegen</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meal-description" className="text-xs">
              Foto en/of beschrijving van wat je hebt gegeten
            </Label>
            <div className="flex gap-2">
              {imageDataUrl ? (
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUrl}
                    alt="Voorbeeld van de maaltijd"
                    className="size-16 rounded-md border object-cover"
                  />
                  <button
                    onClick={() => setImageDataUrl(null)}
                    aria-label="Verwijder foto"
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground"
                >
                  <Camera className="size-5" />
                  <span className="text-[9px]">Foto</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />
              <Textarea
                id="meal-description"
                placeholder="Bijv. 2 boterhammen met pindakaas en een banaan"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1"
              />
            </div>
            {imageError && <p className="text-xs text-destructive">{imageError}</p>}
            <Button
              variant="secondary"
              onClick={handleAnalyze}
              disabled={analyzing || (!description.trim() && !imageDataUrl)}
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
      )}

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

      {meals.length === 0 && !isToday && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Geen maaltijden gelogd op deze dag.
        </p>
      )}

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kies een dag</DialogTitle>
          </DialogHeader>
          <MealCalendar
            selectedDate={selectedDate}
            loggedDates={loggedDates}
            onSelect={(iso) => {
              setSelectedDate(iso);
              setCalendarOpen(false);
            }}
          />
          {!isToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedDate(todayIso());
                setCalendarOpen(false);
              }}
            >
              Terug naar vandaag
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
