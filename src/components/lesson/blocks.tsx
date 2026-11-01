import type { ReactNode } from "react";
import { Tex } from "./tex";

const rich = (x: ReactNode) => (typeof x === "string" ? <p><Tex>{x}</Tex></p> : x);

/** A step of the lesson, with its time budget. */
export function Step({ n, title, minutes, children }: { n: number; title: string; minutes?: number; children?: ReactNode }) {
  return (
    <div className="mt-12 flex items-baseline gap-3 border-t border-line pt-6 first:mt-0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{n}</span>
      <div className="min-w-0">
        <div className="text-[1.35rem] font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>{title}</div>
        {minutes ? <div className="mt-1 text-sm text-ink-3">About {minutes} minutes</div> : null}
        {children}
      </div>
    </div>
  );
}

export function Key({ title = "Key ideas", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-accent/30 bg-accent-soft p-5">
      <div className="eyebrow !text-accent">{title}</div>
      <div className="mt-2 [&>*+*]:mt-2">{children}</div>
    </aside>
  );
}

const CALLOUT = {
  think: { label: "Think about it", cls: "border-warn/40 bg-warn-soft", eyebrow: "!text-warn" },
  note: { label: "Note", cls: "border-line bg-surface-2", eyebrow: "" },
  warning: { label: "Watch out", cls: "border-bad/40 bg-bad-soft", eyebrow: "!text-bad" },
  history: { label: "A little history", cls: "border-line bg-surface", eyebrow: "" },
  research: { label: "Research thread", cls: "border-good/40 bg-good-soft", eyebrow: "!text-good" },
};

export function Callout({ kind = "note", title, children }: { kind?: keyof typeof CALLOUT; title?: string; children: ReactNode }) {
  const c = CALLOUT[kind];
  return (
    <aside className={`rounded-xl border p-5 ${c.cls}`}>
      <div className={`eyebrow ${c.eyebrow}`}>{title ?? c.label}</div>
      <div className="mt-2 [&>*+*]:mt-2">{children}</div>
    </aside>
  );
}

/** The neuro-to-AI bridge box: the same idea seen from both sides. */
export function Bridge({ title, neuro, ai, children }: { title?: string; neuro: ReactNode; ai: ReactNode; children?: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <div className="eyebrow">Bridge</div>
        {title ? <div className="mt-0.5 font-semibold">{title}</div> : null}
      </div>
      <div className="grid md:grid-cols-2">
        <div className="border-line bg-neuro-soft/60 p-5 md:border-r">
          <div className="eyebrow !text-neuro">In the brain</div>
          <div className="mt-2 [&>*+*]:mt-2">{rich(neuro)}</div>
        </div>
        <div className="bg-ai-soft/60 p-5">
          <div className="eyebrow !text-ai">In the machine</div>
          <div className="mt-2 [&>*+*]:mt-2">{rich(ai)}</div>
        </div>
      </div>
      {children ? <div className="border-t border-line p-5 [&>*+*]:mt-2">{children}</div> : null}
    </section>
  );
}

export function Figure({ caption, credit, children }: { caption?: ReactNode; credit?: ReactNode; children: ReactNode }) {
  return (
    <figure className="card overflow-hidden">
      <div className="p-4">{children}</div>
      {caption || credit ? (
        <figcaption className="border-t border-line px-4 py-3 text-sm text-ink-2">
          {caption}
          {credit ? <span className="mt-1 block text-xs text-ink-3">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Colab({ path, label = "Open the notebook in Colab" }: { path: string; label?: string }) {
  const href = `https://colab.research.google.com/github/peteradepoju/engram/blob/main/public/notebooks/${path}`;
  return (
    <span className="inline-flex flex-wrap gap-2">
      <a href={href} target="_blank" rel="noreferrer" className="btn !no-underline">
        <span className="rounded bg-[#f9ab00] px-1 text-[0.7rem] font-bold text-black">CO</span> {label}
      </a>
      <a href={`/notebooks/${path}`} download className="btn !no-underline" title="Download, then in Colab choose File, Upload notebook (or open it in Jupyter)">
        Download notebook (.ipynb)
      </a>
    </span>
  );
}

export function Reading({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-line bg-surface p-5">
      <div className="eyebrow">Further reading</div>
      <div className="mt-2 text-[0.97rem] [&>*+*]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </aside>
  );
}
