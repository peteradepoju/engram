"use client";

import { useState } from "react";
import { saveQuiz } from "@/lib/progress";
import { Tex } from "./tex";
import { useLesson } from "./context";

export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string };

export function Quiz({ id = "quiz", title = "Quiz", questions }: { id?: string; title?: string; questions: QuizQuestion[] }) {
  const { lessonId } = useLesson();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const score = picked.filter((p, i) => p === questions[i].answer).length;
  const allAnswered = picked.every((p) => p !== null);

  function submit() {
    setSubmitted(true);
    void saveQuiz(`${lessonId}:${id}`, score, questions.length);
  }

  return (
    <section className="card not-prose overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-3">
        <div><div className="eyebrow">Check your understanding</div><div className="font-semibold">{title}</div></div>
        {submitted ? <div className="chip ml-auto !bg-accent-soft !text-accent">{score} / {questions.length}</div> : null}
      </div>
      <ol className="!list-none divide-y divide-line !pl-0">
        {questions.map((item, qi) => (
          <li key={qi} className="px-4 py-4 sm:px-5">
            <div className="font-medium"><span className="mr-2 text-ink-3">{qi + 1}.</span><Tex>{item.q}</Tex></div>
            <div className="mt-3 grid gap-2">
              {item.options.map((opt, oi) => {
                const chosen = picked[qi] === oi;
                const right = oi === item.answer;
                let cls = "border-line hover:border-ink-3";
                if (submitted && right) cls = "border-good bg-good-soft";
                else if (submitted && chosen && !right) cls = "border-bad bg-bad-soft";
                else if (chosen) cls = "border-accent bg-accent-soft";
                return (
                  <button key={oi} disabled={submitted}
                    onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                    className={`tap rounded-xl border px-3.5 py-3 text-left text-[0.95rem] transition sm:rounded-lg sm:px-3 sm:py-2 ${cls}`}>
                    <Tex>{opt}</Tex>
                  </button>
                );
              })}
            </div>
            {submitted ? (
              <p className="mt-3 text-sm text-ink-2"><span className={picked[qi] === item.answer ? "font-semibold text-good" : "font-semibold text-bad"}>
                {picked[qi] === item.answer ? "Correct. " : "Not this time. "}</span><Tex>{item.explain}</Tex></p>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex gap-2 border-t border-line px-5 py-3">
        {!submitted ? (
          <button className="btn btn-primary tap flex-1 justify-center sm:flex-none" disabled={!allAnswered} onClick={submit}>{allAnswered ? "Check answers" : "Answer every question to check"}</button>
        ) : (
          <button className="btn" onClick={() => { setSubmitted(false); setPicked(questions.map(() => null)); }}>Try again</button>
        )}
      </div>
    </section>
  );
}
