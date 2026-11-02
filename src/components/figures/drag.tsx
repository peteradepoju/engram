"use client";

import { useRef } from "react";

/** Makes SVG handles draggable. Coordinates are in the SVG's viewBox units. */
export function useSvgDrag(onMove: (key: string, x: number, y: number) => void) {
  const svg = useRef<SVGSVGElement>(null);
  const active = useRef<string | null>(null);
  const toLocal = (e: React.PointerEvent) => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };
  return {
    ref: svg,
    handle: (key: string) => ({
      onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); active.current = key; (e.target as Element).setPointerCapture(e.pointerId); },
      style: { cursor: "grab", touchAction: "none" as const },
    }),
    svgProps: {
      onPointerMove: (e: React.PointerEvent) => { if (active.current) { const p = toLocal(e); onMove(active.current, p.x, p.y); } },
      onPointerUp: () => { active.current = null; },
      onPointerLeave: () => { active.current = null; },
      style: { touchAction: "none" as const, userSelect: "none" as const },
    },
  };
}

export function Arrow({ x1, y1, x2, y2, color, width = 2.5, id }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number; id: string }) {
  return (
    <g>
      <defs>
        <marker id={`ah-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} markerEnd={`url(#ah-${id})`} />
    </g>
  );
}
