import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * AuthLayout: The protective wrapper for login, signup, and reset flows.
 * 
 * Aesthetic: Provides a focused, centered experience for user credentials, 
 * using 'animate-in' for a premium entry transition.
 * 
 * Logic: Implements a "Negative Auth" guard. If a user already has an active session,
 * we trigger a 404 (notFound()) to prevent them from accessing sign-in pages. 
 * This keeps the application state logical and clean.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Security Guard: Prevent authenticated users from seeing auth screens.
  if (session) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        {children}
      </div>
    </div>
  );
}
