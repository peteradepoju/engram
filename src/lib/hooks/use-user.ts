"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { DEFAULT_START } from "@/lib/curriculum";

export type Profile = {
  id: string;
  display_name: string | null;
  timezone: string;
  start_date: string;
  calendar_token: string;
  tutor_enabled: boolean;
};

/** The signed-in user (or null), plus a loading flag. */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => { setUser(data.user ?? null); setLoading(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

/** The signed-in user's profile row. New accounts start on the next Monday unless they choose otherwise. */
export function useProfile() {
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!user) { setProfile(null); setReady(true); return; }
    supabase().from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile((data as Profile) ?? { id: user.id, display_name: null, timezone: "Africa/Lagos", start_date: DEFAULT_START, calendar_token: "", tutor_enabled: true });
      setReady(true);
    });
  }, [user, loading]);
  return { user, profile, setProfile, ready };
}
