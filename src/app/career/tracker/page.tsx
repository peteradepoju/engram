import type { Metadata } from "next";
import { Tracker } from "./tracker";

export const metadata: Metadata = { title: "Application tracker" };

export default function TrackerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Application tracker</h1>
      <p className="mt-2 text-ink-2">Every programme and supervisor you are considering, with deadlines and status.</p>
      <Tracker />
    </div>
  );
}
