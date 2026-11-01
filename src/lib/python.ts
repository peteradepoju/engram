"use client";

export type RunResult = {
  ok: boolean;
  error: string | null;
  value: string | null;
  figs: string[];
  results: { name: string; ok: boolean; msg: string }[] | null;
};

type Pending = { onOut: (stream: string, text: string) => void; resolve: (r: RunResult) => void };

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let readyResolve: (() => void) | null = null;
let lastError = "";
let seq = 0;
const pending = new Map<number, Pending>();
const listeners = new Set<(s: PyStatus) => void>();

export type PyStatus = "idle" | "loading" | "ready" | "error";
let status: PyStatus = "idle";

function setStatus(s: PyStatus) {
  status = s;
  listeners.forEach((l) => l(s));
}

export function onPyStatus(fn: (s: PyStatus) => void) {
  listeners.add(fn);
  fn(status);
  return () => { listeners.delete(fn); };
}

function start() {
  worker = new Worker("/pyodide-worker.js", { type: "module" });
  const fail = (msg: string) => {
    lastError = msg;
    setStatus("error");
    readyResolve?.();
    pending.forEach((p) => p.resolve({ ok: false, error: msg, value: null, figs: [], results: null }));
    pending.clear();
  };
  setStatus("loading");
  readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
    worker!.addEventListener("message", function first(e) {
      if (e.data?.type === "ready") { setStatus("ready"); resolve(); worker!.removeEventListener("message", first); }
    });
  });
  worker.onmessage = (e) => {
    const m = e.data;
    if (m?.type === "boot-error") { fail("Python could not start: " + m.error + ". Check your connection and reload the page, or use the Colab notebook."); return; }
    const p = pending.get(m.id);
    if (!p) return;
    if (m.type === "out") p.onOut(m.stream, m.text);
    if (m.type === "done") { pending.delete(m.id); p.resolve(m as RunResult); }
  };
  worker.onerror = () => fail("Python could not start in this browser. Check your connection and reload the page. If it keeps failing, open the lesson's Colab notebook instead.");
  worker.onmessageerror = () => fail("Python sent a message the page could not read. Reload the page.");
  setTimeout(() => { if (status === "loading") fail("Python is taking too long to download (it is about 10 MB the first time). Check your connection and reload the page."); }, 90000);
  worker.postMessage({ type: "boot" });
}

/** Starts Pyodide in the background (it is about 10 MB the first time, then cached by the browser). */
export function warmUp() {
  if (!worker) start();
  return readyPromise!;
}

export async function runPython(opts: {
  code: string;
  scope: string;
  tests?: string;
  showValue?: boolean;
  onOut?: (stream: string, text: string) => void;
}): Promise<RunResult> {
  await warmUp();
  if (status === "error") {
    // Let the next run try again from scratch.
    worker?.terminate();
    worker = null;
    return { ok: false, error: lastError, value: null, figs: [], results: null };
  }
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, { onOut: opts.onOut ?? (() => {}), resolve });
    worker!.postMessage({ type: "run", id, code: opts.code, scope: opts.scope, tests: opts.tests, showValue: opts.showValue });
  });
}

/** Stops a running cell by restarting Python. Variables defined on the page are lost. */
export function stopPython() {
  if (!worker) return;
  worker.terminate();
  worker = null;
  pending.forEach((p) => p.resolve({ ok: false, error: "Stopped. Python restarted, so run earlier cells again.", value: null, figs: [], results: null }));
  pending.clear();
  start();
}
