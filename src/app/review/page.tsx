import type { Metadata } from "next";
import { ReviewSession } from "./review-session";

export const metadata: Metadata = { title: "Spaced review" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <div className="eyebrow">15 minutes a day</div>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Spaced review</h1>
      <p className="mt-2 text-ink-2">Cards come back just before you would forget them, scheduled by the FSRS algorithm. Answer in your head, reveal, then grade yourself honestly.</p>
      <ReviewSession />
    </div>
  );
}
