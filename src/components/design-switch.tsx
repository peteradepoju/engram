"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DESIGNS, type DesignId } from "@/lib/designs";

const OPTIONS: { id: DesignId; name: string }[] = [...DESIGNS.map((d) => ({ id: d.id as DesignId, name: d.name })), { id: "original", name: "Current design" }];

export function applyDesign(id: DesignId) {
  try { localStorage.setItem("engram-design", id); } catch {}
  if (id === "original") delete document.documentElement.dataset.design;
  else document.documentElement.dataset.design = id;
}

/** A small floating control for trying the design samples. Only for the samples preview. */
export function DesignSwitch() {
  const [design, setDesign] = useState<DesignId>("original");
  const [open, setOpen] = useState(false);
  useEffect(() => { setDesign((document.documentElement.dataset.design as DesignId) || "original"); }, []);
  const pick = (id: DesignId) => { applyDesign(id); setDesign(id); setOpen(false); };
  const current = OPTIONS.find((o) => o.id === design)?.name ?? "Current design";
  return (
    <div className="design-switch">
      {open && (
        <div className="mb-2 w-56 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-xl">
          <div className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">Design samples</div>
          {OPTIONS.map((o) => (
            <button key={o.id} onClick={() => pick(o.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2 ${o.id === design ? "font-semibold text-accent" : "text-ink"}`}>
              {o.name}{o.id === design && <span aria-hidden>✓</span>}
            </button>
          ))}
          <Link href="/designs" onClick={() => setOpen(false)} className="mt-1 block border-t border-line px-3 py-2 text-sm text-ink-2 hover:text-ink">Compare all samples</Link>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="tap flex items-center gap-1.5 rounded-full border border-line bg-surface/95 px-3 py-1.5 text-[0.75rem] font-medium text-ink shadow-lg backdrop-blur">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden /><span className="hidden sm:inline">Design:</span> {current}<span className="text-ink-3" aria-hidden>{open ? "▾" : "▴"}</span>
      </button>
    </div>
  );
}
