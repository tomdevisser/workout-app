import { AppData, MealLog, Settings, WorkoutSession } from "./types";

const STORAGE_KEY = "workout-app-data";
const DATA_VERSION = 1;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultSettings(): Settings {
  return {
    profile: "tom",
    programStartDate: todayIso(),
    lastUsedWeights: {},
  };
}

function defaultData(): AppData {
  return {
    version: DATA_VERSION,
    settings: defaultSettings(),
    sessions: [],
    activeSession: null,
    mealLogs: [],
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      version: DATA_VERSION,
      settings: { ...defaultSettings(), ...parsed.settings },
      sessions: parsed.sessions ?? [],
      activeSession: parsed.activeSession ?? null,
      mealLogs: parsed.mealLogs ?? [],
    };
  } catch (err) {
    console.error("Kon opgeslagen data niet lezen, val terug op standaard.", err);
    return defaultData();
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportDataToFile(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = todayIso();
  a.href = url;
  a.download = `workout-app-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file: File): Promise<AppData> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<AppData>;
  const merged: AppData = {
    version: DATA_VERSION,
    settings: { ...defaultSettings(), ...parsed.settings },
    sessions: parsed.sessions ?? [],
    activeSession: parsed.activeSession ?? null,
    mealLogs: parsed.mealLogs ?? [],
  };
  saveData(merged);
  return merged;
}

export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sortSessionsDesc(sessions: WorkoutSession[]): WorkoutSession[] {
  return [...sessions].sort((a, b) => (a.dateStart < b.dateStart ? 1 : -1));
}

export function mealsForDate(meals: MealLog[], date: string): MealLog[] {
  return meals.filter((m) => m.date === date).sort((a, b) => (a.time < b.time ? -1 : 1));
}
