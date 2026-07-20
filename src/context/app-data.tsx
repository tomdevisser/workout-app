"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppData, MealLog, Settings, WorkoutSession } from "@/lib/types";
import {
  exportDataToFile,
  genId,
  importDataFromFile,
  loadData,
  saveData,
} from "@/lib/storage";

interface AppDataContextValue {
  data: AppData | null;
  ready: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  startSession: (session: WorkoutSession) => void;
  updateActiveSession: (session: WorkoutSession) => void;
  discardActiveSession: () => void;
  finishActiveSession: () => void;
  addMeal: (meal: MealLog) => void;
  deleteMeal: (mealId: string) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage: must run post-mount so the
    // server-rendered and first client render stay in sync (no window there).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!data) return;
    const isAyse = data.settings.profile === "ayse";
    document.documentElement.dataset.theme = isAyse ? "ayse" : "tom";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isAyse ? "#fdf5f8" : "#faf9f5");
    // Deliberately scoped to profile only — re-running this on every
    // unrelated data mutation (a logged set, a meal) would be wasted work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.settings.profile]);

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, settings: { ...prev.settings, ...patch } };
        saveData(next);
        return next;
      });
    },
    [],
  );

  const startSession = useCallback(
    (session: WorkoutSession) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, activeSession: session };
        saveData(next);
        return next;
      });
    },
    [],
  );

  const updateActiveSession = useCallback((session: WorkoutSession) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, activeSession: session };
      saveData(next);
      return next;
    });
  }, []);

  const discardActiveSession = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, activeSession: null };
      saveData(next);
      return next;
    });
  }, []);

  const finishActiveSession = useCallback(() => {
    setData((prev) => {
      if (!prev || !prev.activeSession) return prev;
      const finished: WorkoutSession = {
        ...prev.activeSession,
        dateEnd: new Date().toISOString(),
      };
      const lastUsedWeights = { ...prev.settings.lastUsedWeights };
      for (const exercise of finished.exercises) {
        const weights = exercise.sets
          .map((s) => s.weight)
          .filter((w): w is number => typeof w === "number" && w > 0);
        if (weights.length > 0) {
          lastUsedWeights[exercise.exerciseId] = weights[weights.length - 1];
        }
      }
      const next: AppData = {
        ...prev,
        sessions: [...prev.sessions, finished],
        activeSession: null,
        settings: { ...prev.settings, lastUsedWeights },
      };
      saveData(next);
      return next;
    });
  }, []);

  const addMeal = useCallback((meal: MealLog) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, mealLogs: [...prev.mealLogs, meal] };
      saveData(next);
      return next;
    });
  }, []);

  const deleteMeal = useCallback((mealId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        mealLogs: prev.mealLogs.filter((m) => m.id !== mealId),
      };
      saveData(next);
      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    if (data) exportDataToFile(data);
  }, [data]);

  const importData = useCallback(async (file: File) => {
    const next = await importDataFromFile(file);
    setData(next);
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = loadData();
    fresh.sessions = [];
    fresh.mealLogs = [];
    fresh.activeSession = null;
    persist(fresh);
  }, [persist]);

  return (
    <AppDataContext.Provider
      value={{
        data,
        ready,
        updateSettings,
        startSession,
        updateActiveSession,
        discardActiveSession,
        finishActiveSession,
        addMeal,
        deleteMeal,
        exportData,
        importData,
        resetAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export { genId };
