"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dueCards, gradeCard, previewIntervals, GRADES, deckSize, type StoredCard } from "@/lib/progress";
import { Tex } from "@/components/lesson/tex";
import { useUser } from "@/lib/hooks/use-user";

export function ReviewSession() {
  const { user, loading } = useUser();
  const [queue, setQueue] = useState<StoredCard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [flip, setFlip] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!user) return;
    dueCards().then(setQueue);
    deckSize().then(setTotal);
  }, [user]);

  if (loading || (user && queue === null)) return <p className="mt-8 text-ink-3">Loading your deck…</p>;
  if (!user) return null;
  const card = queue![0];

  if (!card) {
    return (
      <div className="card mt-8 p-6 text-center">
        <div className="text-lg font-semibold">{done ? `Done: ${done} cards reviewed.` : "Nothing due right now."}</div>
        <p className="mt-2 text-ink-2">{total ? `Your deck has ${total} cards.` : "Add cards from the Flashcards section at the end of each lesson."}</p>
        <Link href="/today" className="btn btn-primary mt-4">Back to today</Link>
      </div>
    );
  }

  const intervals = previewIntervals(card);
  async function grade(g: (typeof GRADES)[number]["grade"]) {
    const c = queue![0];
    setQueue((q) => q!.slice(1));
    setFlip(false);
    setDone((d) => d + 1);
    await gradeCard(c, g);
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between text-sm text-ink-3"><span>{queue!.length} due</span><span>{done} reviewed</span></div>
      <div className="card mt-2 overflow-hidden">
        <div className="px-6 py-10 text-center text-lg">
          <div className="eyebrow mb-3">{card.state.source}</div>
          <Tex>{card.state.front}</Tex>
          {flip ? <div className="mt-6 border-t border-line pt-6"><Tex>{card.state.back}</Tex></div> : null}
        </div>
        <div className="border-t border-line p-3">
          {!flip ? (
            <button className="btn btn-primary w-full justify-center !py-3" onClick={() => setFlip(true)}>Show answer</button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button key={g.grade} className="btn flex-col !gap-0 !py-2" onClick={() => grade(g.grade)} title={g.hint}>
                  <span>{g.label}</span><span className="text-xs font-normal text-ink-3">{intervals[g.grade]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
