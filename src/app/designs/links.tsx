"use client";

import Link from "next/link";
import { applyDesign } from "@/components/design-switch";
import type { DesignId } from "@/lib/designs";

export function DesignLinks({ id }: { id: DesignId }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href={`/?design=${id}`} onClick={() => applyDesign(id)} className="btn btn-primary">Explore this design</Link>
      <Link href={`/learn/w036/d1?design=${id}`} onClick={() => applyDesign(id)} className="btn">Open a lesson</Link>
    </div>
  );
}
