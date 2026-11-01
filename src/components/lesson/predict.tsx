"use client";

import { useEffect, useState } from "react";
import { useLesson } from "./context";

/** A prediction made before the lesson and revisited at the end. Kept in this browser. */
export function Predict({ question, revisit }: { question: string; revisit?: boolean }) {
  const { lessonId } = useLesson();
  const key = `engram-predict-${lessonId}`;
  const [text, setText] = useState("");
  useEffect(() => { try { setText(localStorage.getItem(key) ?? ""); } catch {} }, [key]);
  const save = (v: string) => { setText(v); try { localStorage.setItem(key, v); } catch {} };
  return (
    <section className="rounded-xl border border-warn/40 bg-warn-soft p-5 not-prose">
      <div className="eyebrow !text-warn">{revisit ? "Back to your prediction" : "Predict first"}</div>
      <p className="mt-2 font-medium">{question}</p>
      {revisit ? (
        <p className="mt-2 text-[0.95rem] text-ink-2">{text ? <>You wrote: <em>&ldquo;{text}&rdquo;</em>. Were you right? What would you change?</> : "You didn't write a prediction. Try one before tomorrow's lesson: it makes the learning stick."}</p>
      ) : (
        <textarea value={text} onChange={(e) => save(e.target.value)} rows={2} placeholder="Write a guess. Being wrong is fine; guessing is what makes it stick."
          className="input mt-3 !bg-surface" />
      )}
    </section>
  );
}
