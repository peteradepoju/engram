export type LessonMeta = {
  title: string;
  intro: string;
  goals: string[];
  plan: { label: string; minutes: number }[];
  paper?: string; // id of the day's paper
};
