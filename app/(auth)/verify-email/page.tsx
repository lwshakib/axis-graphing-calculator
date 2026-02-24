"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email.");
        toast.error(error.message || "Failed to verify email.");
      } else {
        setStatus("success");
        setMessage("Your email has been successfully verified!");
        toast.success("Email verified successfully!");
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <Logo className="h-10 w-10" showText={false} />
        </div>
        <div className="flex justify-center mb-4">
          {status === "loading" && (
            <div className="rounded-full bg-primary/10 p-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="rounded-full bg-destructive/10 p-3">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {status === "loading" && "Verifying email..."}
          {status === "success" && "Email verified!"}
          {status === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription className="text-base">
          {message || "We are verifying your email address. Please wait."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {status === "success" && (
          <p className="text-sm text-muted-foreground">
            You can now log in to your account and start using Axis.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant={status === "success" ? "default" : "outline"} className="w-full">
          <Link href="/sign-in" className="flex items-center justify-center">
            {status === "success" ? "Go to Login" : <><ArrowLeft className="mr-2 h-4 w-4" /> Back to Login</>}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
