import type { Metadata } from "next";
import { LabOverview } from "./lab-overview";
import { LabNav } from "./lab-nav";

export const metadata: Metadata = { title: "Research Lab" };

export default function LabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <div className="eyebrow">From curiosity to publication</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Research Lab</h1>
      <p className="mt-2 max-w-3xl text-ink-2">Your journal collects what surprises you. Questions worth keeping go to the question bank. The ones that keep coming back become projects, which move through hypothesis, plan, experiments and outline to a paper at a venue.</p>
      <LabNav active="/lab" />
      <LabOverview />
    </div>
  );
}
