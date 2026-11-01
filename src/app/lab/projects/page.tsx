import type { Metadata } from "next";
import { LabNav } from "../lab-nav";
import { ProjectList } from "./project-list";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Projects</h1>
      <p className="mt-2 text-ink-2">Each project moves through eight stages, from a question to a published paper, with a target venue and deadline.</p>
      <LabNav active="/lab/projects" />
      <ProjectList />
    </div>
  );
}
