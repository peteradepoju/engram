"use client";

import { useEffect, useState } from "react";
import { onPyStatus, runPython, stopPython, warmUp, type PyStatus, type RunResult } from "@/lib/python";
import { saveExercise } from "@/lib/progress";
import { useLesson } from "./context";
import { Tex } from "./tex";
import { CodeEditor, dedent } from "./code-editor";

type Props = {
  code?: string;
  /** Python with test_ functions. Turns the cell into an auto-marked exercise. */
  tests?: string;
  id?: string;
  title?: string;
  prompt?: React.ReactNode;
  hint?: string;
  solution?: string;
  /** Run once automatically when Python is ready (for setup cells). */
  autorun?: boolean;
  /** Show the value of the last expression, like a notebook. */
  showValue?: boolean;
  readOnly?: boolean;
};

export function PyCell({ code: rawCode = "", tests: rawTests, id, title, prompt, hint, solution: rawSolution, autorun, showValue = true, readOnly }: Props) {
  const { lessonId } = useLesson();
  const code = dedent(rawCode);
  const tests = rawTests ? dedent(rawTests) : undefined;
  const solution = rawSolution ? dedent(rawSolution) : undefined;
  const [src, setSrc] = useState(code);
  const [out, setOut] = useState<{ stream: string; text: string }[]>([]);
  const [res, setRes] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<PyStatus>("idle");
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const isExercise = !!tests;

  useEffect(() => onPyStatus(setStatus), []);
  useEffect(() => { if (autorun) void run(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function run() {
    setRunning(true);
    setOut([]);
    setRes(null);
    const r = await runPython({
      code: src, scope: lessonId, tests, showValue,
      onOut: (stream, text) => setOut((o) => [...o, { stream, text }]),
    });
    setRes(r);
    setRunning(false);
    if (isExercise && id) {
      const allOk = !!r.results && r.results.length > 0 && r.results.every((t) => t.ok);
      void saveExercise(`${lessonId}:${id}`, allOk, src);
    }
  }

  const passed = res?.results && res.results.length > 0 && res.results.every((t) => t.ok);

  return (
    <div className={`overflow-hidden rounded-xl border ${isExercise ? (passed ? "border-good" : "border-accent/40") : "border-line"} bg-surface not-prose`}>
      {(title || isExercise) && (
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="eyebrow">{isExercise ? "Exercise" : "Code"}</span>
          {title ? <span className="font-semibold">{title}</span> : null}
          {passed ? <span className="chip ml-auto !bg-good-soft !text-good">Passed</span> : null}
        </div>
      )}
      {prompt ? <div className="border-b border-line px-4 py-3 text-[0.97rem] [&>*+*]:mt-2">{typeof prompt === "string" ? <p><Tex>{prompt}</Tex></p> : prompt}</div> : null}
      <div onFocus={() => void warmUp()}>
        <CodeEditor value={src} onChange={setSrc} onRun={() => { if (!running) void run(); }} readOnly={readOnly} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
        <button className="btn btn-primary !py-1.5" onClick={run} disabled={running}>
          {running ? "Running…" : isExercise ? "Run and check" : "Run"}
        </button>
        {running ? <button className="btn !py-1.5" onClick={stopPython}>Stop</button> : null}
        <button className="btn !py-1.5" onClick={() => { setSrc(code); setOut([]); setRes(null); }}>Reset</button>
        {hint ? <button className="btn !py-1.5" onClick={() => setShowHint((v) => !v)}>Hint</button> : null}
        {solution ? <button className="btn !py-1.5" onClick={() => setShowSol((v) => !v)}>{showSol ? "Hide solution" : "Solution"}</button> : null}
        <span className="ml-auto text-xs text-ink-3">
          {status === "loading" ? "Downloading Python (about 10 MB, first time only)…" : status === "ready" ? "Python ready · Shift+Enter runs" : status === "error" ? "Python failed to start: reload the page" : "Python starts when you run"}
        </span>
      </div>
      {showHint && hint ? <div className="border-t border-line bg-warn-soft px-4 py-3 text-sm">{hint}</div> : null}
      {showSol && solution ? (
        <div className="border-t border-line">
          <div className="px-4 pt-2 text-xs font-semibold text-ink-3">Solution</div>
          <CodeEditor value={solution} readOnly label="Solution code" />
        </div>
      ) : null}
      {(out.length > 0 || res) && (
        <div className="border-t border-line px-4 py-3 font-mono text-[0.84rem]">
          {out.map((o, i) => (
            <pre key={i} className={`whitespace-pre-wrap ${o.stream === "stderr" ? "text-bad" : "text-ink"}`}>{o.text}</pre>
          ))}
          {res?.value ? <pre className="whitespace-pre-wrap text-ink-2">{res.value}</pre> : null}
          {res?.error ? <pre className="whitespace-pre-wrap text-bad">{res.error}</pre> : null}
          {res?.figs?.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={`data:image/png;base64,${f}`} alt="Plot produced by the code" className="mt-2 max-w-full rounded-lg bg-white" />
          ))}
          {res?.results ? (
            <ul className="mt-2 space-y-1 font-sans text-sm">
              {res.results.map((t, i) => (
                <li key={i} className={t.ok ? "text-good" : "text-bad"}>
                  {t.ok ? "✓" : "✗"} {t.name}{!t.ok && t.msg ? <span className="text-ink-2">: {t.msg}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {res && !res.error && out.length === 0 && !res.value && !res.figs?.length && !res.results ? (
            <span className="text-ink-3">Ran with no output.</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
