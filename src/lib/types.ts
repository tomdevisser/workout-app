export type WorkoutId = "A" | "B";

export type ProfileId = "tom" | "ayse";

export type ExerciseCategory =
  | "squat"
  | "lunge"
  | "hinge"
  | "horizontal-press"
  | "vertical-press"
  | "row"
  | "pulldown"
  | "lateral-raise"
  | "curl"
  | "triceps"
  | "core"
  | "hip-isolation"
  | "leg-extension"
  | "hip-thrust"
  | "chest-fly";

export interface ExerciseDef {
  id: string;
  name: string;
  alternative: string;
  defaultSets: number;
  repsMin: number;
  repsMax: number;
  unit: "reps" | "seconds";
  restSeconds: number;
  perSide?: boolean;
  bodyweight?: boolean;
  startWeight?: number;
  category: ExerciseCategory;
  tip: string;
}

export interface WorkoutTemplate {
  id: WorkoutId;
  name: string;
  exercises: ExerciseDef[];
}

export interface Profile {
  id: ProfileId;
  label: string;
  templates: WorkoutTemplate[];
}

export interface SetLog {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  unit: "reps" | "seconds";
  perSide?: boolean;
  bodyweight?: boolean;
  repsMin: number;
  repsMax: number;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  profileId?: ProfileId;
  templateId: WorkoutId;
  dateStart: string;
  dateEnd?: string;
  exercises: ExerciseLog[];
  notes?: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Settings {
  profile: ProfileId;
  programStartDate: string;
  lastUsedWeights: Record<string, number>;
  dailyGoals?: Partial<Record<ProfileId, DailyGoals>>;
}

export interface MealLog {
  id: string;
  date: string;
  time: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  estimated: boolean;
  rawDescription?: string;
}

export interface AppData {
  version: number;
  settings: Settings;
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  mealLogs: MealLog[];
}
