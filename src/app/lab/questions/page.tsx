import type { Metadata } from "next";
import { LabNav } from "../lab-nav";
import { QuestionBank } from "./question-bank";

export const metadata: Metadata = { title: "Question bank" };

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Question bank</h1>
      <p className="mt-2 text-ink-2">Every research question you have saved. Tag them, park the ones that can wait, and promote the ones that will not leave you alone to projects.</p>
      <LabNav active="/lab/questions" />
      <QuestionBank />
    </div>
  );
}
