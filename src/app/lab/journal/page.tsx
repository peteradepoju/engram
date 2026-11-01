import type { Metadata } from "next";
import { LabNav } from "../lab-nav";
import { JournalList } from "./journal-list";

export const metadata: Metadata = { title: "Research journal" };

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Research journal</h1>
      <p className="mt-2 text-ink-2">What you read or did, what surprised or bothered you, and the questions it raised. Reread it weekly and star the question you most want answered.</p>
      <LabNav active="/lab/journal" />
      <JournalList />
    </div>
  );
}
