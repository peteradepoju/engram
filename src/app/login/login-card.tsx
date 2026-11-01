"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LoginCard() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/today";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(params.get("error") ? "Sign-in failed. Please try again." : null);
  const [busy, setBusy] = useState(false);
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function google() {
    setErr(null);
    const { error } = await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setErr(error.message);
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Sign in to Engram</h1>
      <p className="mt-2 text-sm text-ink-2">Free. Your progress, streak, review deck, journal and projects sync across your phone and laptop.</p>
      <button className="btn mt-6 w-full justify-center" onClick={google}>Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-xs text-ink-3"><span className="h-px flex-1 bg-line" />or use email<span className="h-px flex-1 bg-line" /></div>
      {sent ? (
        <p className="rounded-lg bg-good-soft p-3 text-sm">Check your inbox for a sign-in link sent to <strong>{email}</strong>. You can close this tab.</p>
      ) : (
        <form onSubmit={magic} className="space-y-3">
          <input type="email" required className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
        </form>
      )}
      {err ? <p className="mt-3 text-sm text-bad">{err}</p> : null}
      <p className="mt-6 text-xs text-ink-3">Lessons, papers and the Hub are open to everyone without an account.</p>
    </div>
  );
}
