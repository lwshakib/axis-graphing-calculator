"use client";

/**
 * SignInPage Component
 *
 * Provides the user interface for authenticating existing users.
 * Supports standard email/password credentials and OAuth-based social login (Google).
 *
 * Features:
 * 1. Reactive Input: Managed form state for credentials.
 * 2. Visual Feedback: Loading states and toast notifications (success/error).
 * 3. Navigation: Links to password recovery and account creation.
 */

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * handleSignIn: Executes the credential-based authentication.
   * Leverages authClient.signIn.email which internally manages session tokens and cookies.
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email(
      {
        email,
        password,
        // Successful login redirects to the main user workspace
        callbackURL: "/dashboard",
      },
      {
        /**
         * Lifecycle Hooks:
         * Better-Auth provides convenient hooks for managing complex async UI states.
         */
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          // Display user-friendly error messages from the auth server
          toast.error(ctx.error.message || "Invalid credentials");
        },
      },
    );
    if (!error) {
      toast.success("Welcome back! Signing you in...");
    }
    setLoading(false);
  };

  /**
   * handleGoogleSignIn: Initiates the OAuth2 flow via Google.
   * This triggers a server-side redirect to competitive auth provider.
   */
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Credential Form */}
        <form onSubmit={handleSignIn} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold h-11"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        {/* Visual Separator */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-background px-2 text-muted-foreground/60">
              Third Party Access
            </span>
          </div>
        </div>

        {/* Social Authentication Provider */}
        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="h-11 font-bold border-border/50 hover:bg-muted/50"
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Google Workspace
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="text-sm text-center text-muted-foreground w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-primary hover:underline"
          >
            Create one today
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
