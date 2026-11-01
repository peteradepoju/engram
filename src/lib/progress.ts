"use client";

import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";
import { supabase } from "@/lib/supabase/client";
import { todayIn } from "@/lib/curriculum";

let tzCache: string | null = null;

async function uid(): Promise<string | null> {
  const { data } = await supabase().auth.getUser();
  return data.user?.id ?? null;
}

async function timezone(id: string): Promise<string> {
  if (tzCache) return tzCache;
  const { data } = await supabase().from("profiles").select("timezone").eq("id", id).maybeSingle();
  tzCache = (data?.timezone as string) || "Africa/Lagos";
  return tzCache;
}

/** Marks today as a study day (keeps the streak) and adds minutes to it. */
export async function recordStudy(minutes = 0) {
  const id = await uid();
  if (!id) return;
  const day = todayIn(await timezone(id));
  const sb = supabase();
  const { data } = await sb.from("study_days").select("minutes").eq("user_id", id).eq("day", day).maybeSingle();
  await sb.from("study_days").upsert({ user_id: id, day, minutes: (data?.minutes ?? 0) + minutes });
}

export async function completeLesson(lessonId: string, minutes = 120) {
  const id = await uid();
  if (!id) return false;
  await supabase().from("lesson_progress").upsert({ user_id: id, lesson_id: lessonId });
  await recordStudy(minutes);
  return true;
}

export async function isLessonComplete(lessonId: string) {
  const id = await uid();
  if (!id) return false;
  const { data } = await supabase().from("lesson_progress").select("lesson_id").eq("user_id", id).eq("lesson_id", lessonId).maybeSingle();
  return !!data;
}

export async function saveExercise(itemId: string, ok: boolean, answer: string) {
  const id = await uid();
  if (!id) return;
  const sb = supabase();
  const { data } = await sb.from("exercise_results").select("attempts, ok").eq("user_id", id).eq("item_id", itemId).maybeSingle();
  await sb.from("exercise_results").upsert({
    user_id: id, item_id: itemId, ok: ok || !!data?.ok, attempts: (data?.attempts ?? 0) + 1, answer, updated_at: new Date().toISOString(),
  });
}

export async function saveQuiz(quizId: string, score: number, total: number) {
  const id = await uid();
  if (!id) return;
  await supabase().from("quiz_attempts").insert({ user_id: id, quiz_id: quizId, score, total });
}

// ---------- Spaced review (FSRS) ----------

export type CardContent = { id: string; front: string; back: string };
export type StoredCard = { card_id: string; due: string; state: { card: Card; front: string; back: string; source: string } };

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

/** Adds cards to the learner's deck. Cards already in the deck keep their schedule. */
export async function addCards(source: string, cards: CardContent[]) {
  const id = await uid();
  if (!id || cards.length === 0) return 0;
  const sb = supabase();
  const ids = cards.map((c) => c.id);
  const { data: existing } = await sb.from("cards").select("card_id").eq("user_id", id).in("card_id", ids);
  const have = new Set((existing ?? []).map((r) => r.card_id as string));
  const rows = cards.filter((c) => !have.has(c.id)).map((c) => {
    const card = createEmptyCard(new Date());
    return { user_id: id, card_id: c.id, due: card.due.toISOString(), state: { card, front: c.front, back: c.back, source } };
  });
  if (rows.length) await sb.from("cards").insert(rows);
  return rows.length;
}

export async function dueCards(): Promise<StoredCard[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase().from("cards").select("card_id, due, state").eq("user_id", id)
    .lte("due", new Date().toISOString()).order("due").limit(200);
  return (data ?? []) as StoredCard[];
}

export async function deckSize(): Promise<number> {
  const id = await uid();
  if (!id) return 0;
  const { count } = await supabase().from("cards").select("card_id", { count: "exact", head: true }).eq("user_id", id);
  return count ?? 0;
}

export const GRADES: { grade: Grade; label: string; hint: string }[] = [
  { grade: Rating.Again, label: "Again", hint: "I didn't know it" },
  { grade: Rating.Hard, label: "Hard", hint: "Got it, with effort" },
  { grade: Rating.Good, label: "Good", hint: "Got it" },
  { grade: Rating.Easy, label: "Easy", hint: "Instant" },
];

function revive(card: Card): Card {
  return { ...card, due: new Date(card.due), last_review: card.last_review ? new Date(card.last_review) : undefined };
}

export function previewIntervals(stored: StoredCard) {
  const now = new Date();
  const out: Record<number, string> = {};
  const rec = scheduler.repeat(revive(stored.state.card), now);
  for (const g of GRADES) {
    const due = rec[g.grade].card.due;
    const mins = Math.round((due.getTime() - now.getTime()) / 60000);
    out[g.grade] = mins < 60 ? `${Math.max(1, mins)} min` : mins < 1440 ? `${Math.round(mins / 60)} h` : `${Math.round(mins / 1440)} d`;
  }
  return out;
}

export async function gradeCard(stored: StoredCard, grade: Grade) {
  const id = await uid();
  if (!id) return;
  const next = scheduler.next(revive(stored.state.card), new Date(), grade).card;
  await supabase().from("cards").update({
    due: next.due.toISOString(), state: { ...stored.state, card: next }, updated_at: new Date().toISOString(),
  }).eq("user_id", id).eq("card_id", stored.card_id);
  await recordStudy(0);
}
