import type { Metadata } from "next";
import { DESIGNS } from "@/lib/designs";
import { DesignLinks } from "./links";

export const metadata: Metadata = { title: "Design samples" };

export default function DesignsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:pt-14">
      <div className="eyebrow">For Peter: choosing Engram&apos;s look</div>
      <h1 className="display mt-3 text-[2.2rem] font-semibold leading-tight tracking-tight md:text-[2.8rem]" style={{ fontFamily: "var(--font-serif)" }}>Five design samples</h1>
      <p className="mt-4 max-w-2xl text-ink-2">
        Each sample is the whole working site, with every page, lesson, figure and code cell, in a different design. Open one and explore it.
        The choice is remembered as you move around, and the switch in the bottom corner changes it at any time, including back to the current design.
        The theme button in the header shows each sample in light and dark.
      </p>
      <ol className="mt-10 space-y-6">
        {DESIGNS.map((d, i) => (
          <li key={d.id} className="card overflow-hidden md:grid md:grid-cols-[1.1fr_1fr]">
            <div className="flex min-h-48 flex-col justify-center gap-3 p-6" style={{ background: d.preview.bg, color: d.preview.ink }}>
              <div style={{ fontFamily: d.preview.body, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: d.preview.accent }}>Week 36 · Day 1</div>
              <div style={{ fontFamily: d.preview.head, fontWeight: d.preview.weight, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                Learn how <span style={{ fontStyle: d.preview.em, color: d.preview.accent }}>brains and machines</span> learn.
              </div>
              <div style={{ fontFamily: d.preview.body, fontSize: 15, lineHeight: 1.6, opacity: 0.8 }}>
                Bayes&apos; rule turns tuning curves into a posterior over position: every spike adds the logarithm of its cell&apos;s field.
              </div>
            </div>
            <div className="flex flex-col p-6">
              <div className="text-xs text-ink-3">Sample {i + 1}</div>
              <h2 className="mt-1 text-2xl font-semibold">{d.name}</h2>
              <div className="mt-1 text-xs text-ink-3">{d.fonts}</div>
              <p className="mt-3 flex-1 text-[0.95rem] text-ink-2">{d.blurb}</p>
              <DesignLinks id={d.id} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
