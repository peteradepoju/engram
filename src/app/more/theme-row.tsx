"use client";

import { useTheme } from "@/components/nav";

export function ThemeRow() {
  const [theme, apply] = useTheme();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1" role="radiogroup" aria-label="Theme">
      {(["system", "light", "dark"] as const).map((t) => (
        <button key={t} role="radio" aria-checked={theme === t} onClick={() => apply(t)}
          className={`tap rounded-lg py-2 text-sm font-medium capitalize ${theme === t ? "bg-surface text-ink shadow-sm" : "text-ink-3"}`}>{t === "system" ? "Automatic" : t}</button>
      ))}
    </div>
  );
}
