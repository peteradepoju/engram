"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks/use-user";

/** "Create a free account" for visitors; "Go to today" once signed in. */
export function AccountCta() {
  const { user, loading } = useUser();
  if (loading) return <span className="btn btn-primary invisible justify-center !py-3">Loading</span>;
  return user
    ? <Link href="/today" className="btn btn-primary justify-center !py-3">Go to today&apos;s plan</Link>
    : <Link href="/login" className="btn btn-primary justify-center !py-3">Create a free account</Link>;
}
