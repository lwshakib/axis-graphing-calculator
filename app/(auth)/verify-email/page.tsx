"use client";

/**
 * VerifyEmailPage Component
 * 
 * An automated, token-driven view that completes the email verification handshake.
 * 
 * Logic Partitioning:
 * 1. Automatic Execution: The verification request triggers via `useEffect` 
 *    the moment the component mounts with a valid token.
 * 2. Visual Feedback Engine: Handles three distinct UI states (Verifying, 
 *    Success, Error) with reactive icons and status messages.
 * 3. Token-Based Security: Acts as the client-side bridge for the server's signed verification links.
 */

import { useEffect, useState, Suspense } from "react";
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
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  // Deterministic initial status based on URL schema
  const initialStatus = token ? "loading" : "error";
  const initialMessage = token ? "" : "Security check failed: No verification token provided.";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    initialStatus,
  );
  const [message, setMessage] = useState(initialMessage);

  /**
   * Verification Trigger:
   * Communicates with the auth engine to invalidate the token and 
   * mutate the user's 'verified' status in the database.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Failed to confirm email ownership.");
        toast.error(error.message || "Integrity error during verification.");
      } else {
        setStatus("success");
        setMessage("Your identity has been confirmed. Welcome to Axis!");
        toast.success("Security handshake complete.");
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          {/* Reactive Status Iconography */}
          {status === "loading" && (
            <div className="rounded-full bg-primary/10 p-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="rounded-full bg-[#47CEAC]/10 p-3 shadow-lg shadow-[#47CEAC]/5">
              <CheckCircle2 className="h-6 w-6 text-[#47CEAC]" />
            </div>
          )}
          {status === "error" && (
            <div className="rounded-full bg-destructive/10 p-3">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-black tracking-tight uppercase">
          {status === "loading" && "Resolving Identity..."}
          {status === "success" && "Access Granted"}
          {status === "error" && "Access Denied"}
        </CardTitle>
        <CardDescription className="text-base font-medium italic">
          {message || "Validating security token with the auth server. Please hold."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {status === "success" && (
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            Persistence features and advanced mathematical modeling are now 
            unlocked for your account.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant={status === "success" ? "default" : "outline"}
          className={`w-full h-12 font-bold transition-all ${status === 'success' ? 'bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20' : 'border-border/50'}`}
        >
          <Link href="/sign-in" className="flex items-center justify-center">
            {status === "success" ? (
              "Continue to Dashboard"
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Login
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * VerifyEmailPage (Root)
 * Employs Suspense to handle the useSearchParams hook in a client-side context.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">Establishing Secure Channel...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
