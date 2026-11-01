import katex from "katex";

/** Renders a string with $inline$ and $$display$$ maths and `code`. Used where content arrives as props. */
export function Tex({ children, className }: { children: string; className?: string }) {
  const html = children
    .split(/(\$\$[^$]+\$\$|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((part) => {
      if (part.startsWith("$$")) return katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
      if (part.startsWith("$") && part.length > 1) return katex.renderToString(part.slice(1, -1), { throwOnError: false });
      if (part.startsWith("`")) return `<code class="font-mono text-[0.9em] bg-[var(--code-bg)] px-1 rounded">${esc(part.slice(1, -1))}</code>`;
      if (part.startsWith("**")) return `<strong>${esc(part.slice(2, -2))}</strong>`;
      return esc(part);
    })
    .join("");
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
