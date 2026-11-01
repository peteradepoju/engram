"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";

const Ctx = createContext<Set<string>>(new Set());

/** Loads the learner's completed lessons once, for tick marks across a page. */
export function CompletedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!user) return;
    supabase().from("lesson_progress").select("lesson_id").eq("user_id", user.id)
      .then(({ data }) => setDone(new Set((data ?? []).map((r) => r.lesson_id as string))));
  }, [user]);
  return <Ctx.Provider value={done}>{children}</Ctx.Provider>;
}

export function DoneMark({ id }: { id: string }) {
  const done = useContext(Ctx);
  return done.has(id) ? <span className="text-good" aria-label="completed">✓</span> : null;
}

export function WeekDone({ ids }: { ids: string[] }) {
  const done = useContext(Ctx);
  const n = ids.filter((i) => done.has(i)).length;
  if (!n) return null;
  return <span className={`chip ${n === ids.length ? "!bg-good-soft !text-good" : ""}`}>{n}/{ids.length}</span>;
}
