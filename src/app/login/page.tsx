import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginCard } from "./login-card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  );
}
