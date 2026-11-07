/* Engram service worker: makes the installed app quick to open and lets lessons you have visited open offline.
   Pages always come from the network first, so new lessons appear straight away; the cache is only a fallback. */
const VERSION = "engram-v2";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const MAX_PAGES = 120;

const OFFLINE_HTML = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline | Engram</title><style>body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#111018;color:#ecebf2;text-align:center;padding:24px}
a{color:#9d8bff}</style></head><body><div><h1 style="font-family:Georgia,serif">You are offline</h1>
<p>This page has not been saved on this device yet. Lessons you have opened before still work offline.</p><p><a href="/today">Try again</a></p></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (!key.startsWith(VERSION)) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_PAGES; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                    // Supabase, YouTube, Pyodide CDN: leave alone
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth") || url.pathname === "/sw.js") return;

  // Build files are content-hashed, so they never change: cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/notebooks/") || url.pathname === "/pyodide-worker.js") {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Pages and their data: network first, saved copy when offline.
  const isPage = req.mode === "navigate" || req.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
  if (!isPage) return;
  event.respondWith((async () => {
    const cache = await caches.open(PAGES);
    try {
      const res = await fetch(req);
      if (res.ok && res.type === "basic") { cache.put(req, res.clone()); trim(cache); }
      return res;
    } catch {
      const hit = await cache.match(req, { ignoreVary: true });
      if (hit) return hit;
      if (req.mode === "navigate") return new Response(OFFLINE_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
      return Response.error();
    }
  })());
});
