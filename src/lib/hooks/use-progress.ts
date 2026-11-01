"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type ProgressData = {
  completed: Set<string>;
  studyDays: Map<string, number>; // date -> minutes
  dueCards: number;
  deck: number;
  journalCount: number;
  questionCount: number;
  papersRead: number;
  quizzes: { quiz_id: string; score: number; total: number; created_at: string }[];
};

/** Everything the dashboard pages need about the signed-in learner, loaded in parallel. */
export function useProgress(userId: string | undefined) {
  const [data, setData] = useState<ProgressData | null>(null);
  useEffect(() => {
    if (!userId) return;
    const sb = supabase();
    const now = new Date().toISOString();
    Promise.all([
      sb.from("lesson_progress").select("lesson_id").eq("user_id", userId),
      sb.from("study_days").select("day, minutes").eq("user_id", userId),
      sb.from("cards").select("card_id", { count: "exact", head: true }).eq("user_id", userId).lte("due", now),
      sb.from("cards").select("card_id", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("questions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("paper_notes").select("paper_id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["read", "deep"]),
      sb.from("quiz_attempts").select("quiz_id, score, total, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
    ]).then(([lp, sd, due, deck, j, q, p, qa]) => {
      setData({
        completed: new Set((lp.data ?? []).map((r) => r.lesson_id as string)),
        studyDays: new Map((sd.data ?? []).map((r) => [r.day as string, r.minutes as number])),
        dueCards: due.count ?? 0,
        deck: deck.count ?? 0,
        journalCount: j.count ?? 0,
        questionCount: q.count ?? 0,
        papersRead: p.count ?? 0,
        quizzes: (qa.data ?? []) as ProgressData["quizzes"],
      });
    });
  }, [userId]);
  return data;
}
