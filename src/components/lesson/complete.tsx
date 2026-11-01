"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { completeLesson, isLessonComplete } from "@/lib/progress";
import { useUser } from "@/lib/hooks/use-user";

export function CompleteLesson({ lessonId, next }: { lessonId: string; next?: { href: string; title: string } }) {
  const { user } = useUser();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) isLessonComplete(lessonId).then(setDone); }, [user, lessonId]);

  return (
    <section className="card mt-12 flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="font-semibold">{done ? "Lesson complete. Well done." : "Finished the lesson?"}</div>
        <div className="text-sm text-ink-2">{done ? "Today counts toward your streak." : "Mark it complete to keep your streak and track your progress."}</div>
      </div>
      {user ? (
        <button className="btn btn-primary" disabled={done || busy} onClick={async () => { setBusy(true); setDone(await completeLesson(lessonId)); setBusy(false); }}>
          {done ? "✓ Completed" : busy ? "Saving…" : "Mark complete"}
        </button>
      ) : (
        <Link className="btn btn-primary" href={`/login?next=/learn/${lessonId.slice(0, 4)}/${lessonId.slice(4)}`}>Sign in to save progress</Link>
      )}
      {next ? <Link className="btn" href={next.href}>Next: {next.title} →</Link> : null}
    </section>
  );
}
