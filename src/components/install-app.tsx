"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "./nav";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Offers to install Engram as an app: the browser's own prompt in Chrome and Edge on phones and computers, instructions for Safari on iPhone, iPad and Mac. */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [macSafari, setMacSafari] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    setIos(isIos);
    setMacSafari(!isIos && ua.includes("Macintosh") && /Version\/1[7-9]|Version\/[2-9]\d/.test(ua) && ua.includes("Safari") && !/Chrome|Chromium|Edg|Firefox/.test(ua));
    try { setDismissed(compact && localStorage.getItem("engram-install-dismissed") === "1"); } catch {}
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as PromptEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, [compact]);

  if (installed || dismissed || (!evt && !ios && !macSafari)) return null;

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
          <div className="text-sm text-ink-3">Opens in its own window from your home screen, dock or taskbar, and lessons you have visited work offline.</div>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={install} className="btn btn-primary tap flex-1 justify-center">{evt ? "Install" : showSteps ? "Hide the steps" : "Show me how"}</button>
        {compact ? <button onClick={dismiss} className="btn tap">Not now</button> : null}
      </div>
      {showSteps ? (
        macSafari ? (
          <ol className="space-y-2 border-t border-line bg-surface-2 px-4 py-3 text-sm">
            <li><span className="font-semibold">1.</span> In Safari, open the <span className="font-semibold">File</span> menu, or the Share button in the toolbar.</li>
            <li><span className="font-semibold">2.</span> Choose <span className="font-semibold">Add to Dock</span>.</li>
            <li><span className="font-semibold">3.</span> Click <span className="font-semibold">Add</span>. Engram opens from the Dock in its own window.</li>
          </ol>
        ) : (
          <ol className="space-y-2 border-t border-line bg-surface-2 px-4 py-3 text-sm">
            <li><span className="font-semibold">1.</span> In Safari, tap the Share button <span aria-hidden>(the square with an arrow)</span>.</li>
            <li><span className="font-semibold">2.</span> Scroll down and tap <span className="font-semibold">Add to Home Screen</span>.</li>
            <li><span className="font-semibold">3.</span> Tap <span className="font-semibold">Add</span>. Engram appears with your other apps.</li>
          </ol>
        )
      ) : null}
    </div>
  );
}
