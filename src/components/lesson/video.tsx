"use client";

import { useState } from "react";

/** A YouTube video that loads only when played (privacy-enhanced mode). Always credited.
 *  If the video id is wrong or the video was removed, YouTube serves a small grey placeholder thumbnail;
 *  we detect that and show a link to find the video instead of a broken player. */
export function Video({ id, title, by, start, note }: { id: string; title: string; by: string; start?: number; note?: string }) {
  const [play, setPlay] = useState(false);
  const [missing, setMissing] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`;
  const find = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${by}`)}`;
  return (
    <figure className="card bleed not-prose overflow-hidden">
      <div className="relative aspect-video bg-black">
        {missing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <div className="font-semibold">This video is unavailable here.</div>
            <a href={find} target="_blank" rel="noreferrer" className="btn !border-white/30 !bg-white/10 !text-white">Find “{title}” on YouTube</a>
          </div>
        ) : play ? (
          <iframe src={src} title={title} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
              onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120) setMissing(true); }} onError={() => setMissing(true)} />
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
