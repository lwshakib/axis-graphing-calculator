"use client";

/**
 * ResetPasswordPage Component
 * 
 * The destination for users clicking a recovery link from their email.
 * This component consumes a 'token' from the URL to authenticate the password update.
 * 
 * Key Elements:
 * 1. URL Parameter Extraction: Uses 'useSearchParams' to grab the one-time-use token.
 * 2. Suspense Wrapper: Essential for Next.js client components using 'useSearchParams' 
 *    to avoid hydration mismatches during static export or SSR.
 * 3. Validation: Client-side check to ensure password and confirmation match.
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * handleSubmit: Submits the new password along with the verification token.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Process aborted: Missing unique reset token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Integrity check failed: Passwords do not match.");
      return;
    }

    setLoading(true);
    await authClient.resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          // Typically fails if the token is expired (usually >1h) or already used.
          toast.error(ctx.error.message || "Failed to reset password.");
        },
        onSuccess: () => {
          setSuccess(true);
          toast.success("Security credentials updated successfully!");
        },
      },
    );
    setLoading(false);
  };

  /**
   * Error View: Displayed if the user arrives without a valid token in the URL.
   */
  if (!token) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-black uppercase text-destructive">Invalid Integrity</CardTitle>
          <CardDescription className="font-medium pt-2">
            This password reset link is invalid, malformed, or has already expired for your security.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold border-destructive/20 text-destructive hover:bg-destructive/10">
            <Link href="/forgot-password">Request Fresh Link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /**
   * Success View: Rendered once the server confirms the update.
   */
  if (success) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/10 p-3 shadow-lg shadow-green-500/5">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight uppercase">
            Account Secured
          </CardTitle>
          <CardDescription className="text-base italic font-medium">
            Your identity has been re-verified and your password updated.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full h-12 font-bold bg-[#47CEAC] hover:bg-[#36BB9A] text-white rounded-xl shadow-xl shadow-[#47CEAC]/20">
            <Link href="/sign-in">Return to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /**
   * Main Interactive View: Capture the new credentials.
   */
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-black tracking-tight uppercase">
          Choose New Password
        </CardTitle>
        <CardDescription className="font-medium">
          Ensure your new password is secure and unique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password" title="At least 8 characters recommended" className="font-bold text-[10px] uppercase tracking-widest pl-1">New Credential</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20 h-12 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="font-bold text-[10px] uppercase tracking-widest pl-1">Repeat for Verification</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Change
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full font-bold text-muted-foreground hover:text-primary">
          <Link href="/sign-in" className="flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel and Return
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * ResetPasswordPage (Root)
 * Wraps the content in Suspense to handle dynamic search params safely.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Auth Module...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
