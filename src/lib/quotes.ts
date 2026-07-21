export const MOTIVATIONAL_QUOTES: string[] = [
  "The best time to start was yesterday. The next best time is now.",
  "Discipline is remembering what you want, even when you've forgotten why.",
  "Every rep counts, especially the one you don't feel like doing.",
  "Consistency beats intensity — just show up.",
  "Your body can handle it. Convince your mind.",
  "Progress is never linear, but it's always the result of showing up.",
  "The only bad workout is the one you skipped.",
  "Small steps, every week, become big results.",
  "You don't get strong on your good days — you get strong on this one.",
  "Do it for the version of yourself you're building.",
  "Discomfort today is strength tomorrow.",
  "No one has ever regretted a workout they actually started.",
  "Rest when you need to, never quit.",
  "Progress feels boring until you look back.",
  "You don't need motivation, you just need to begin.",
];

export function getQuoteForDate(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
