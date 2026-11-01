"use client";

import { useState } from "react";

/** A YouTube video that loads only when played (privacy-enhanced mode). Always credited. */
export function Video({ id, title, by, start, note }: { id: string; title: string; by: string; start?: number; note?: string }) {
  const [play, setPlay] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`;
  return (
    <figure className="card not-prose overflow-hidden">
      <div className="relative aspect-video bg-black">
        {play ? (
          <iframe src={src} title={title} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white">▶</span>
          </button>
        )}
      </div>
      <figcaption className="px-4 py-3 text-sm">
        <div className="font-semibold">{title}</div>
        <div className="text-ink-3">Video by {by}{start ? `, from ${Math.floor(start / 60)}:${String(start % 60).padStart(2, "0")}` : ""}. Watch on YouTube for the full credits.</div>
        {note ? <div className="mt-1 text-ink-2">{note}</div> : null}
      </figcaption>
    </figure>
  );
}
