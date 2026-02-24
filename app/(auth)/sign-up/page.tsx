"use client";

/**
 * SignUpPage Component
 * 
 * Facilitates the onboarding of new users.
 * Supports manual registration via email/password and social onboarding via Google.
 * 
 * Key Logic:
 * 1. Data Collection: Captures 'name', 'email', and 'password'.
 * 2. Verification Flow: After a successful email signup, the user is redirected 
 *    to a 'Check Email' screen for link-based verification (handled by Better-Auth).
 * 3. Unified Auth Client: Uses the same central 'authClient' instance as the rest of the app.
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
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * handleSignUp: Dispatches a user creation request.
   * Leverages Better-Auth lifecycle events to manage UI state.
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          // Expose database or validation errors to the user
          toast.error(ctx.error.message || "Registration failed");
        },
        onSuccess: () => {
          toast.success("Account created! Please verify your identity.");
          // Redirect to a specialized instruction page for email verification
          router.push("/check-email");
        },
      },
    );
    setLoading(false);
  };

  /**
   * handleGoogleSignIn: Initiates the social onboarding flow.
   * If the Google account doesn't exist in our DB, a new User record is created automatically.
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
          Create an account
        </CardTitle>
        <CardDescription>
          Join Axis and start mapping your mathematical journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Registration Form */}
        <form onSubmit={handleSignUp} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20"
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
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
          <Button type="submit" className="w-full font-bold h-11" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>

        {/* Third Party Divider */}
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

        {/* Social Authentication */}
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
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
