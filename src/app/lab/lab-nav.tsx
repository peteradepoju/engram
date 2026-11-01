import Link from "next/link";

export function LabNav({ active }: { active: string }) {
  const items = [["/lab", "Overview"], ["/lab/journal", "Journal"], ["/lab/questions", "Question bank"], ["/lab/projects", "Projects"]];
  return (
    <nav className="mt-4 flex flex-wrap gap-2">
      {items.map(([h, l]) => <Link key={h} href={h} className={`chip !py-1.5 ${active === h ? "!bg-accent !text-white" : ""}`}>{l}</Link>)}
    </nav>
  );
}

export const STAGES = [
  { id: "question", label: "Question", hint: "A clear research question, labelled with a Marr level." },
  { id: "hypothesis", label: "Hypothesis", hint: "A falsifiable claim, its prediction, and what result would prove it wrong." },
  { id: "plan", label: "Experiment plan", hint: "Data or model, method, baselines, statistics, compute and time." },
  { id: "running", label: "Running", hint: "Experiments under way; log results as they come." },
  { id: "outline", label: "Paper outline", hint: "Title, abstract, figure list, related work." },
  { id: "drafting", label: "Drafting", hint: "Writing the paper; track drafts." },
  { id: "submitted", label: "Submitted", hint: "Under review at a venue." },
  { id: "published", label: "Published", hint: "Accepted or posted as a preprint." },
] as const;

export const VENUES = ["CCN", "Cosyne", "NeurIPS", "NeurIPS workshop", "ICLR", "ICLR workshop", "ICML", "Bernstein Conference", "CNS", "eLife", "PLOS Computational Biology", "Neural Computation", "Nature Neuroscience", "Neuron", "Nature Machine Intelligence", "TMLR", "bioRxiv or arXiv preprint"];
