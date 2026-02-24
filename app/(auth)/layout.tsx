import React from 'react';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
        {children}
      </div>
    </div>
  );
}
