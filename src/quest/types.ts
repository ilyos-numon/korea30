import type { Route } from '../routes';

export interface Bilingual { vi: string; ko: string }

export interface QuestDay {
  day: number;
  icon: string;
  title: Bilingual;
  where: Bilingual;
  bring: Bilingual[];
  say: { ko: string; viPron: string; viMeaning: string };
  tip?: Bilingual;
  link?: { route: Exclude<Route, 'quest'>; label: Bilingual };
}
