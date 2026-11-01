"use client";

import { useState } from "react";
import { addCards, type CardContent } from "@/lib/progress";
import { useUser } from "@/lib/hooks/use-user";
import { Tex } from "./tex";
import { useLesson } from "./context";

/** The day's flashcards: flip through them, then add them to the spaced-review deck. */
export function Flashcards({ cards }: { cards: { front: string; back: string }[] }) {
  const { lessonId } = useLesson();
  const { user } = useUser();
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const deck: CardContent[] = cards.map((c, k) => ({ id: `${lessonId}:${k + 1}`, ...c }));
  const c = deck[i];

  return (
    <section className="card not-prose overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-3">
        <div><div className="eyebrow">Flashcards</div><div className="font-semibold">{deck.length} cards from today</div></div>
        <div className="ml-auto text-sm text-ink-3">{i + 1} / {deck.length}</div>
      </div>
      <button onClick={() => setFlip((f) => !f)} className="block min-h-40 w-full px-6 py-8 text-center text-lg" aria-label="Flip card">
        <div className="eyebrow mb-3">{flip ? "Answer" : "Question"}</div>
        <Tex>{flip ? c.back : c.front}</Tex>
        {!flip ? <div className="mt-4 text-xs text-ink-3">Tap to reveal</div> : null}
      </button>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <button className="btn" disabled={i === 0} onClick={() => { setI(i - 1); setFlip(false); }}>Previous</button>
        <button className="btn" disabled={i === deck.length - 1} onClick={() => { setI(i + 1); setFlip(false); }}>Next</button>
        <div className="ml-auto">
          {user ? (
            <button className="btn btn-primary" disabled={added !== null} onClick={async () => setAdded(await addCards(lessonId, deck))}>
              {added === null ? "Add to my review deck" : added === 0 ? "Already in your deck" : `Added ${added} cards`}
            </button>
          ) : (
            <a className="btn" href="/login">Sign in to keep these cards</a>
          )}
        </div>
      </div>
    </section>
  );
}
