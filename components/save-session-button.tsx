"use client";

import React, { useState } from "react";
import { Save, LogIn, Loader2 } from "lucide-react";
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
  type: "graph" | "calculator" | "scientific" | "3d";
  data: any;
  currentSessionId?: string;
  onSaveSuccess?: (id: string, title: string) => void;
}

export function SaveSessionButton({
  type,
  data,
  currentSessionId,
  onSaveSuccess,
}: SaveSessionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Untitled " + type);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSave = async () => {
    if (!session) {
      // Should already be handled by the dialog showing login but just in case
      return;
    }

    setIsSaving(true);
    try {
      const resp = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentSessionId,
          type,
          title,
          data,
        }),
      });

      if (!resp.ok) throw new Error("Failed to save");

      const savedData = await resp.json();
      toast.success("Session saved successfully!");
      setIsOpen(false);
      
      if (onSaveSuccess) {
        onSaveSuccess(savedData.id, savedData.title);
      } else {
        // Default behavior: move to the new URL
        router.push(`/${type}/${savedData.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving session");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: window.location.href,
    });
  };

  // If we are already saved and just want to quick-save
  if (session && currentSessionId) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-4 gap-2 rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        <span className="text-xs font-bold uppercase tracking-wider">Save</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 gap-2 rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Save size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{currentSessionId ? "Save" : "Save Changes"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Save Session</DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            {session 
              ? "Give your session a name to easily find it later." 
              : "You need to be logged in to save your work."}
          </DialogDescription>
        </DialogHeader>

        {session ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Brilliant Math"
                className="rounded-xl h-12 text-lg font-bold"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-6">
            <Button 
              className="h-14 rounded-2xl text-lg font-bold flex gap-3 shadow-xl shadow-blue-500/20" 
              onClick={() => handleLogin("google")}
            >
              <LogIn size={20} />
              Sign in with Google
            </Button>
            {/* Can add more providers if needed */}
            <p className="text-xs text-center text-muted-foreground font-medium mt-2">
              All your work will be synced across all your devices.
            </p>
          </div>
        )}

        {session && (
          <DialogFooter>
            <Button 
              disabled={isSaving} 
              onClick={handleSave}
              className="w-full h-12 rounded-xl text-lg font-bold gap-2"
            >
              {isSaving && <Loader2 className="animate-spin" size={20} />}
              Save Session
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
