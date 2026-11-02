"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./nav";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Offers to install Engram on the home screen: the browser's own prompt on Android and desktop, instructions on iPhone and iPad. */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    const ua = navigator.userAgent;
    setIos(/iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1));
    try { setDismissed(compact && localStorage.getItem("engram-install-dismissed") === "1"); } catch {}
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as PromptEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, [compact]);

  if (installed || dismissed || (!evt && !ios)) return null;

  const install = async () => {
    if (evt) { await evt.prompt(); await evt.userChoice; setEvt(null); }
    else setShowSteps((v) => !v);
  };
  const dismiss = () => { setDismissed(true); try { localStorage.setItem("engram-install-dismissed", "1"); } catch {} };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <LogoMark size={44} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Install Engram</div>
          <div className="text-sm text-ink-3">Opens full screen from your home screen, and lessons you have visited work offline.</div>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={install} className="btn btn-primary tap flex-1 justify-center">{evt ? "Install" : showSteps ? "Hide the steps" : "Show me how"}</button>
        {compact ? <button onClick={dismiss} className="btn tap">Not now</button> : null}
      </div>
      {showSteps ? (
        <ol className="space-y-2 border-t border-line bg-surface-2 px-4 py-3 text-sm">
          <li><span className="font-semibold">1.</span> In Safari, tap the Share button <span aria-hidden>(the square with an arrow)</span>.</li>
          <li><span className="font-semibold">2.</span> Scroll down and tap <span className="font-semibold">Add to Home Screen</span>.</li>
          <li><span className="font-semibold">3.</span> Tap <span className="font-semibold">Add</span>. Engram appears with your other apps.</li>
        </ol>
      ) : null}
    </div>
  );
}
