"use client";

/**
 * ForgotPasswordPage Component
 *
 * Part of the secondary authentication flow.
 * Allows users to initiate a password recovery process via email.
 *
 * Flow:
 * 1. User provides their registered email.
 * 2. 'authClient.requestPasswordReset' is called with a redirect target.
 * 3. The server dispatches an email containing a signed token link.
 * 4. This component switches to a 'Check Email' success state upon a 200 OK response.
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
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * handleSubmit: Triggers the recovery email dispatch.
   * @param e Standard form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset(
      {
        email,
        // The URL the user will land on when clicking the email link
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          toast.error(ctx.error.message || "Could not process request");
        },
        onSuccess: () => {
          setEmailSent(true);
          toast.success("Security email dispatched successfully.");
        },
      },
    );
    setLoading(false);
  };

  /**
   * Success View: Rendered once the server confirms the email was queued.
   * Redirects user attention to their inbox.
   */
  if (emailSent) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3 animate-bounce shadow-lg shadow-primary/5">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-base italic">
            A secure link has been sent to{" "}
            <span className="font-bold text-foreground underline decoration-primary/30 underline-offset-4">
              {email}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground/80 leading-relaxed px-4">
            The link is valid for 1 hour. If you don&apos;t receive it shortly,
            check your spam folder or try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full font-bold h-11 bg-primary text-primary-foreground shadow-xl shadow-primary/20"
          >
            <a
              href="https://mail.google.com" // Quick-link convenience for Gmail users
              target="_blank"
              rel="noopener noreferrer"
            >
              Check Gmail Inbox
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-11 border-border/50 font-semibold"
          >
            <Link href="/sign-in" className="flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /**
   * Initial View: The email capture form.
   */
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-black tracking-tight uppercase">
          Recover Account
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          Forgotten your password? Enter your email and we&apos;ll help you
          reset it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="email"
              className="font-bold text-[10px] uppercase tracking-widest pl-1"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. user@axis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-muted/20 h-12 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 font-bold text-lg"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant="ghost"
          className="w-full h-10 text-muted-foreground hover:text-primary transition-colors"
        >
          <Link
            href="/sign-in"
            className="flex items-center justify-center font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
