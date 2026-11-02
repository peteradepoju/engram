import { Tex } from "./tex";

/** Renders a short markdown-like answer (paragraphs, lists, headings, $maths$, `code`, **bold**). Used for tutor replies. */
export function RichText({ text }: { text: string }) {
  // Normalise other maths delimiters to dollars.
  const src = text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => `\n\n$$${m.trim()}$$\n\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => `$${m.trim()}$`)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => `\n\n$$${m.replace(/\s*\n\s*/g, " ").trim()}$$\n\n`);
  // Split into blocks, then into runs of list lines and ordinary lines.
  const isItem = (l: string) => /^\s*([-*•]|\d+[.)])\s+/.test(l);
  type Run = { kind: "p" | "ul" | "ol" | "h" | "math"; lines: string[] };
  const runs: Run[] = [];
  for (const block of src.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    if (/^\$\$[\s\S]+\$\$$/.test(block)) { runs.push({ kind: "math", lines: [block] }); continue; }
    for (const line of block.split("\n")) {
      const kind: Run["kind"] = /^#{1,4}\s/.test(line) ? "h" : isItem(line) ? (/^\s*\d/.test(line) ? "ol" : "ul") : "p";
      const last = runs[runs.length - 1];
      if (last && last.kind === kind && kind !== "h" && !(last as Run & { closed?: boolean }).closed) last.lines.push(line);
      else runs.push({ kind, lines: [line] });
    }
    const last = runs[runs.length - 1] as Run & { closed?: boolean };
    last.closed = true; // a blank line ends the run
  }
  const strip = (l: string) => l.replace(/^\s*([-*•]|\d+[.)])\s+/, "");
  return (
    <div className="space-y-3">
      {runs.map((r, i) => {
        if (r.kind === "math") return <div key={i} className="overflow-x-auto"><Tex>{r.lines[0]}</Tex></div>;
        if (r.kind === "h") return <div key={i} className="font-semibold"><Tex>{r.lines[0].replace(/^#{1,4}\s+/, "")}</Tex></div>;
        if (r.kind === "ul") return <ul key={i} className="list-disc space-y-1 pl-5">{r.lines.map((l, j) => <li key={j}><Tex>{strip(l)}</Tex></li>)}</ul>;
        if (r.kind === "ol") return <ol key={i} className="list-decimal space-y-1 pl-5">{r.lines.map((l, j) => <li key={j}><Tex>{strip(l)}</Tex></li>)}</ol>;
        return <p key={i}><Tex>{r.lines.join(" ")}</Tex></p>;
      })}
    </div>
  );
}
