"use client";

/**
 * SaveSessionButton Component
 *
 * A mission-critical utility that bridges the gap between client-side math
 * state and server-side persistence.
 *
 * Key Features:
 * 1. Intent-Based Persistence: If a guest tries to save, their intent (data type/title)
 *    is cached in localStorage, allowing the session to be automatically created
 *    immediately after they complete the authentication flow.
 * 2. Polymorphic Saving: Handles 'graph', 'calculator', 'scientific', and '3d' types
 *    via a unified API endpoint.
 * 3. Reactive UI: Provides visual feedback (loaders, toasts) and conditional
 *    rendering based on existing session IDs.
 */

import React, { useState, useEffect } from "react";
import { Save, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SaveSessionButtonProps {
  /** The specific workspace module generating the data. */
  type: "graph" | "calculator" | "scientific" | "3d";
  /** The state object (equations, viewport, matrices, etc.) to be JSON serialized. */
  data: unknown;
  /** Optional: The UUID of an existing session. If provided, the button performs an update instead of a create. */
  currentSessionId?: string;
  /** Callback triggered after a successful server-side save. */
  onSaveSuccess?: (id: string, title: string) => void;
}

/**
 * LocalStorage key used to store the persistence intent across redirects.
 * Essential for the 'Guest -> Sign In -> Automatic Save' workflow.
 */
const AUTOSAVE_KEY = "axis_pending_save";

export function SaveSessionButton({
  type,
  data,
  currentSessionId,
  onSaveSuccess,
}: SaveSessionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Untitled " + type);
  const [isSaving, setIsSaving] = useState(false);

  // Retrieve session using the better-auth client hook
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  /**
   * handleSave: Communicates with the /api/sessions endpoint.
   * If currentSessionId exists, the backend logic (implemented in the API route)
   * will handle it as an idempotent update.
   *
   * @param customTitle Optional override for the session title.
   */
  const handleSave = async (customTitle?: string) => {
    if (!session) return;

    setIsSaving(true);
    const finalTitle = customTitle || title;
    try {
      const resp = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentSessionId,
          type,
          title: finalTitle,
          data,
        }),
      });

      if (!resp.ok) throw new Error("Failed to save");

      const savedData = await resp.json();
      toast.success("Session saved successfully!");
      setIsOpen(false);

      // Clear persistence intent once successfully committed to DB
      localStorage.removeItem(AUTOSAVE_KEY);

      if (onSaveSuccess) {
        onSaveSuccess(savedData.id, savedData.title);
      } else {
        // Fallback: Hard redirect to the workspace's persistent URL
        router.push(`/${type}/${savedData.id}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Error saving session. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Auto-Persistence Hook:
   * Triggers when the user returns to this page after a login redirect.
   * If there's a pending save intent in localStorage, it executes handleSave immediately.
   */
  useEffect(() => {
    if (session && !isPending) {
      const pending = localStorage.getItem(AUTOSAVE_KEY);
      if (pending) {
        try {
          const { type: pType, title: pTitle } = JSON.parse(pending);
          // Ensure we only auto-save if we are in the correct workspace type
          if (pType === type) {
            handleSave(pTitle);
          }
        } catch {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending, type]);

  /**
   * Caches the user's intent to save before they leave the page to sign in.
   */
  const prepareAutoSave = () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ type, title }));
  };

  /**
   * Standard View: Simple button for users already editing an established session.
   * Optimized for quick updates without disrupting the creative workflow.
   */
  if (session && currentSessionId) {
    return (
      <Button
        variant="default"
        size="sm"
        className="h-9 px-4 gap-2 rounded-xl font-bold transition-all active:scale-95 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-[#47CEAC]/20 hover:shadow-[#47CEAC]/40 shadow-lg border-none"
        onClick={() => handleSave()}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Save size={16} />
        )}
        <span className="text-xs uppercase tracking-wider">Save</span>
      </Button>
    );
  }

  /**
   * Dialog View: Full naming and auth-handling modal.
   * Provides clarity to guest users that their data is protected during login.
   */
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 gap-2 rounded-xl font-bold transition-all active:scale-95 border-border/50 hover:bg-[#47CEAC]/10 hover:text-[#47CEAC] hover:border-[#47CEAC]/30"
        >
          <Save size={16} />
          <span className="text-xs uppercase tracking-wider">
            {currentSessionId ? "Save" : "Save Changes"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border shadow-2xl p-8 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black tracking-tighter">
            Save Session
          </DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground pt-1 italic">
            {session
              ? "Your work is about to be immortalized. Give it a name."
              : "Axis saves your progress automatically after you sign in."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground pl-1"
            >
              Session Name
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Integration Sandbox"
              className="rounded-xl h-14 text-lg font-bold border-border/50 focus-visible:ring-[#47CEAC]/30 bg-muted/20"
            />
          </div>
        </div>

        {session ? (
          <DialogFooter>
            <Button
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full h-14 rounded-xl text-lg font-bold gap-3 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20 border-none transition-all active:scale-[0.98]"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Save to Dashboard
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex flex-col gap-4">
            <Button
              asChild
              className="h-14 w-full rounded-xl text-lg font-bold flex gap-3 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20 border-none transition-all active:scale-[0.98]"
              onClick={prepareAutoSave}
            >
              <Link
                href={`/sign-in?callbackURL=${encodeURIComponent(window.location.pathname)}`}
              >
                <LogIn size={20} />
                Sign in to Persist
              </Link>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.1em] px-4 leading-relaxed">
              We&apos;ll remember your status and save it the moment you&apos;re
              redirected back.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
