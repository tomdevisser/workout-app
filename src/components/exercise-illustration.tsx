import { ExerciseCategory } from "@/lib/types";

function Figure({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const illustrations: Record<ExerciseCategory, React.ReactNode> = {
  squat: (
    <Figure>
      <circle cx="50" cy="20" r="8" fill="currentColor" stroke="none" />
      <path d="M50 28 L50 55" />
      <path d="M50 40 L38 48" />
      <path d="M50 40 L62 48" />
      <path d="M38 48 L34 60" />
      <path d="M62 48 L66 60" />
      <path d="M50 55 L36 72" />
      <path d="M50 55 L64 72" />
      <path d="M36 72 L38 88" />
      <path d="M64 72 L62 88" />
    </Figure>
  ),
  lunge: (
    <Figure>
      <circle cx="46" cy="18" r="8" fill="currentColor" stroke="none" />
      <path d="M46 26 L48 50" />
      <path d="M48 34 L34 42" />
      <path d="M48 36 L64 30" />
      <path d="M48 50 L30 66" />
      <path d="M30 66 L30 88" />
      <path d="M48 50 L68 62" />
      <path d="M68 62 L60 88" />
    </Figure>
  ),
  hinge: (
    <Figure>
      <circle cx="34" cy="28" r="8" fill="currentColor" stroke="none" />
      <path d="M34 36 L52 56" />
      <path d="M40 42 L30 60" />
      <path d="M30 60 L34 62" />
      <path d="M44 48 L36 62" />
      <path d="M36 62 L40 64" />
      <path d="M52 56 L58 76" />
      <path d="M52 56 L70 68" />
      <path d="M58 76 L54 90" />
      <path d="M70 68 L74 90" />
    </Figure>
  ),
  "horizontal-press": (
    <Figure>
      <circle cx="18" cy="60" r="8" fill="currentColor" stroke="none" />
      <path d="M26 60 L58 60" />
      <path d="M40 60 L36 42" />
      <path d="M40 60 L36 78" />
      <path d="M58 60 L74 76" />
      <path d="M58 60 L74 44" />
      <path d="M16 68 L20 82" />
      <path d="M20 82 L34 82" />
    </Figure>
  ),
  "vertical-press": (
    <Figure>
      <circle cx="50" cy="20" r="8" fill="currentColor" stroke="none" />
      <path d="M50 28 L50 62" />
      <path d="M50 62 L38 90" />
      <path d="M50 62 L62 90" />
      <path d="M50 40 L32 18" />
      <path d="M50 40 L68 18" />
      <path d="M32 18 L32 10" />
      <path d="M68 18 L68 10" />
    </Figure>
  ),
  row: (
    <Figure>
      <circle cx="30" cy="30" r="8" fill="currentColor" stroke="none" />
      <path d="M30 38 L48 58" />
      <path d="M36 44 L26 58" />
      <path d="M26 58 L30 60" />
      <path d="M40 50 L32 60" />
      <path d="M32 60 L36 62" />
      <path d="M48 58 L52 78" />
      <path d="M48 58 L66 70" />
      <path d="M52 78 L48 90" />
      <path d="M66 70 L70 90" />
      <path d="M30 30 L44 24" />
      <path d="M44 24 L44 30" />
    </Figure>
  ),
  pulldown: (
    <Figure>
      <circle cx="50" cy="22" r="8" fill="currentColor" stroke="none" />
      <path d="M50 30 L50 64" />
      <path d="M50 64 L38 90" />
      <path d="M50 64 L62 90" />
      <path d="M50 40 L30 30" />
      <path d="M50 40 L70 30" />
      <path d="M20 22 L80 22" />
      <path d="M30 22 L30 30" />
      <path d="M70 22 L70 30" />
    </Figure>
  ),
  "lateral-raise": (
    <Figure>
      <circle cx="50" cy="20" r="8" fill="currentColor" stroke="none" />
      <path d="M50 28 L50 62" />
      <path d="M50 62 L38 90" />
      <path d="M50 62 L62 90" />
      <path d="M50 36 L20 40" />
      <path d="M50 36 L80 40" />
    </Figure>
  ),
  curl: (
    <Figure>
      <circle cx="50" cy="20" r="8" fill="currentColor" stroke="none" />
      <path d="M50 28 L50 62" />
      <path d="M50 62 L38 90" />
      <path d="M50 62 L62 90" />
      <path d="M50 38 L34 50" />
      <path d="M34 50 L44 32" />
    </Figure>
  ),
  triceps: (
    <Figure>
      <circle cx="50" cy="20" r="8" fill="currentColor" stroke="none" />
      <path d="M50 28 L50 62" />
      <path d="M50 62 L38 90" />
      <path d="M50 62 L62 90" />
      <path d="M50 34 L66 26" />
      <path d="M66 26 L60 12" />
      <path d="M50 36 L34 40" />
    </Figure>
  ),
  core: (
    <Figure>
      <circle cx="16" cy="64" r="8" fill="currentColor" stroke="none" />
      <path d="M24 64 L80 50" />
      <path d="M40 60 L36 78" />
      <path d="M62 55 L66 74" />
      <path d="M80 50 L88 58" />
    </Figure>
  ),
  "hip-isolation": (
    <Figure>
      <circle cx="50" cy="22" r="8" fill="currentColor" stroke="none" />
      <path d="M50 30 L50 52" />
      <path d="M36 24 L50 34" />
      <path d="M64 24 L50 34" />
      <path d="M50 52 L30 62" />
      <path d="M50 52 L70 62" />
      <path d="M30 62 L26 88" />
      <path d="M70 62 L74 88" />
      <path d="M20 60 L30 62" />
      <path d="M80 60 L70 62" />
    </Figure>
  ),
  "leg-extension": (
    <Figure>
      <circle cx="30" cy="24" r="8" fill="currentColor" stroke="none" />
      <path d="M30 32 L34 58" />
      <path d="M34 58 L60 62" />
      <path d="M60 62 L78 44" />
      <path d="M30 40 L46 46" />
      <path d="M30 40 L18 54" />
      <path d="M74 40 L78 44" />
    </Figure>
  ),
  "hip-thrust": (
    <Figure>
      <circle cx="22" cy="60" r="8" fill="currentColor" stroke="none" />
      <path d="M30 62 L54 62" />
      <path d="M54 62 L70 42" />
      <path d="M54 62 L64 84" />
      <path d="M70 42 L70 84" />
      <path d="M22 68 L20 84" />
    </Figure>
  ),
  "chest-fly": (
    <Figure>
      <circle cx="18" cy="60" r="8" fill="currentColor" stroke="none" />
      <path d="M26 60 L58 60" />
      <path d="M40 60 L36 42" />
      <path d="M40 60 L36 78" />
      <path d="M42 46 L60 34" />
      <path d="M42 74 L60 84" />
      <path d="M16 68 L20 82" />
      <path d="M20 82 L34 82" />
    </Figure>
  ),
};

export function ExerciseIllustration({
  category,
  className,
}: {
  category: ExerciseCategory;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted p-2.5 text-muted-foreground"
      }
    >
      {illustrations[category]}
    </div>
  );
}
