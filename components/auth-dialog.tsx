"use client";

import React, { useState } from "react";
import { LogIn, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  children?: React.ReactNode;
  triggerAsChild?: boolean;
  onSuccess?: () => void;
  onSocialLogin?: () => void;
}

export function AuthDialog({ children, triggerAsChild = true, onSuccess, onSocialLogin }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider: "google" | "github") => {
    onSocialLogin?.();
    await authClient.signIn.social({
      provider,
      callbackURL: window.location.href,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signin") {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });
        
        if (error) {
          toast.error(error.message || "Login failed");
        } else {
          toast.success("Logged in successfully!");
          setIsOpen(false);
          onSuccess?.();
        }
      } else {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          toast.error(error.message || "Account creation failed");
        } else {
          toast.success("Account created successfully!");
          setIsOpen(false);
          onSuccess?.();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset mode to signin when closing
        setTimeout(() => setMode("signin"), 300);
      }
    }}>
      <DialogTrigger asChild={triggerAsChild}>
        {children || (
          <Button variant="outline" size="sm" className="font-semibold px-4">
            Log In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground text-base">
              {mode === "signin" 
                ? "Sign in to sync your mathematical journey across all your devices."
                : "Join AXIS to save your expressions, patterns and history forever."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <Button 
              className="h-14 rounded-2xl text-lg font-bold flex gap-3 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20 border-none transition-all active:scale-[0.98]" 
              onClick={() => handleSocialLogin("google")}
            >
              <LogIn size={20} />
              {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-background px-4 text-muted-foreground font-black tracking-[0.2em]">
                  {mode === "signin" ? "Or continue with email" : "Or sign up with email"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "signup" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Full Name</label>
                  <Input 
                    placeholder="John Doe" 
                    className="rounded-2xl h-14 pl-6 border-border/50 focus-visible:ring-[#47CEAC]/30 bg-muted/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="rounded-2xl h-14 pl-12 border-border/50 focus-visible:ring-[#47CEAC]/30 bg-muted/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="rounded-2xl h-14 pl-12 border-border/50 focus-visible:ring-[#47CEAC]/30 bg-muted/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                type="submit"
                disabled={isLoading}
                className="h-14 rounded-2xl font-black text-lg bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white transition-all active:scale-[0.98] mt-2 shadow-xl shadow-zinc-900/10"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : (mode === "signin" ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground font-medium">
              {mode === "signin" ? (
                <>
                  Don't have an account? <span 
                    className="text-primary font-bold cursor-pointer hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Sign up for free
                  </span>
                </>
              ) : (
                <>
                  Already have an account? <span 
                    className="text-primary font-bold cursor-pointer hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    Log in instead
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
