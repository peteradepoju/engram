"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting, indentUnit, bracketMatching } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Token colours come from CSS variables, so they follow the light and dark themes.
const pyHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--tok-keyword)" },
  { tag: [t.string, t.special(t.string)], color: "var(--tok-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--tok-number)" },
  { tag: [t.comment, t.lineComment], color: "var(--tok-comment)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], color: "var(--tok-function)" },
  { tag: [t.definition(t.className), t.className], color: "var(--tok-class)" },
  { tag: [t.self, t.special(t.variableName)], color: "var(--tok-self)", fontStyle: "italic" },
  { tag: [t.propertyName], color: "var(--tok-property)" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--tok-punct)" },
  { tag: t.escape, color: "var(--tok-number)" },
]);

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--code-bg)", color: "var(--ink)", fontSize: "0.86rem" },
  ".cm-content": { fontFamily: "var(--font-mono)", padding: "12px 0", caretColor: "var(--accent)", lineHeight: "1.6", fontVariantLigatures: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono)" },
  ".cm-gutters": { backgroundColor: "var(--code-bg)", color: "var(--ink-3)", border: "none", paddingLeft: "6px" },
  ".cm-lineNumbers .cm-gutterElement": { minWidth: "2ch", paddingRight: "10px" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--accent) 7%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink-2)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "color-mix(in srgb, var(--accent) 25%, transparent) !important" },
  "&.cm-focused": { outline: "none" },
  ".cm-matchingBracket": { backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)", outline: "none" },
});

/** A Python editor with syntax colours. Shift+Enter or Ctrl+Enter runs the cell. */
export function CodeEditor({ value, onChange, onRun, readOnly, label = "Python code" }: {
  value: string; onChange?: (v: string) => void; onRun?: () => void; readOnly?: boolean; label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cb = useRef({ onChange, onRun });
  cb.current = { onChange, onRun };

  useEffect(() => {
    if (!host.current) return;
    const runKeys = keymap.of([
      { key: "Shift-Enter", run: () => { cb.current.onRun?.(); return true; } },
      { key: "Mod-Enter", run: () => { cb.current.onRun?.(); return true; } },
    ]);
    view.current = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          runKeys, lineNumbers(), history(), drawSelection(), highlightActiveLine(), bracketMatching(),
          indentUnit.of("    "), EditorState.tabSize.of(4),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
          python(), syntaxHighlighting(pyHighlight), theme,
          EditorView.editable.of(!readOnly), EditorState.readOnly.of(!!readOnly),
          EditorView.contentAttributes.of({ "aria-label": label }),
          EditorView.updateListener.of((u) => { if (u.docChanged) cb.current.onChange?.(u.state.doc.toString()); }),
        ],
      }),
    });
    return () => view.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Outside changes (Reset) replace the document.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={host} className="min-h-[3rem]" />;
}

/** Removes the indentation shared by every line (lesson files indent code inside props). */
export function dedent(s: string) {
  const lines = s.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(Number.isFinite(ind) ? ind : 0)).join("\n");
}
