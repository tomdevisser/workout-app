export const MOTIVATIONAL_QUOTES: string[] = [
  "De beste tijd om te beginnen was gisteren. De op één na beste tijd is nu.",
  "Discipline is jezelf herinneren wat je wilt, ook als je het niet meer weet.",
  "Elke rep telt, ook de rep die je niet zin hebt om te doen.",
  "Consistentie verslaat intensiteit — kom gewoon opdagen.",
  "Je lichaam kan het aan. Overtuig je hoofd.",
  "Progressie is nooit lineair, maar altijd het resultaat van doorzetten.",
  "De enige slechte workout is de workout die je oversloeg.",
  "Kleine stappen, elke week, worden grote resultaten.",
  "Je wordt niet sterk op je goede dagen — je wordt sterk op deze dag.",
  "Doe het voor de versie van jezelf die je aan het bouwen bent.",
  "Ongemak vandaag is kracht morgen.",
  "Niemand ooit spijt gehad van een training die wel is gestart.",
  "Rust als het moet, stop nooit.",
  "Vooruitgang voelt saai totdat je omkijkt.",
  "Je hoeft niet gemotiveerd te zijn, je moet gewoon beginnen.",
];

export function getQuoteForDate(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
