"use client";

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
  type: "graph" | "calculator" | "scientific" | "3d";
  data: any;
  currentSessionId?: string;
  onSaveSuccess?: (id: string, title: string) => void;
}

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
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

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
      localStorage.removeItem(AUTOSAVE_KEY);
      
      if (onSaveSuccess) {
        onSaveSuccess(savedData.id, savedData.title);
      } else {
        router.push(`/${type}/${savedData.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving session");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle auto-save after social login redirect
  useEffect(() => {
    if (session && !isPending) {
      const pending = localStorage.getItem(AUTOSAVE_KEY);
      if (pending) {
        const { type: pType, title: pTitle } = JSON.parse(pending);
        if (pType === type) {
          handleSave(pTitle);
        }
      }
    }
  }, [session, isPending, type]);

  const prepareAutoSave = () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ type, title }));
  };

  if (session && currentSessionId) {
    return (
      <Button
        variant="default"
        size="sm"
        className="h-9 px-4 gap-2 rounded-xl font-bold transition-all active:scale-95 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-[#47CEAC]/20 hover:shadow-[#47CEAC]/40 shadow-lg border-none"
        onClick={() => handleSave()}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        <span className="text-xs uppercase tracking-wider">Save</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 gap-2 rounded-xl font-bold transition-all active:scale-95 border-border/50 hover:bg-[#47CEAC]/10 hover:text-[#47CEAC] hover:border-[#47CEAC]/30"
        >
          <Save size={16} />
          <span className="text-xs uppercase tracking-wider">{currentSessionId ? "Save" : "Save Changes"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">Save Session</DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground pt-1">
            {session 
              ? "Give your session a name to easily find it later." 
              : "Set a title and sign in to persist your work."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pl-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Brilliant Math"
              className="rounded-2xl h-14 text-lg font-bold border-border/50 focus-visible:ring-[#47CEAC]/30 bg-muted/20"
            />
          </div>
        </div>

        {session ? (
          <DialogFooter>
            <Button 
              disabled={isSaving} 
              onClick={() => handleSave()}
              className="w-full h-14 rounded-2xl text-lg font-bold gap-3 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20 border-none transition-all active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Session
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex flex-col gap-4">
            <Button 
                asChild
                className="h-14 w-full rounded-2xl text-lg font-bold flex gap-3 bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-xl shadow-[#47CEAC]/20 border-none transition-all active:scale-[0.98]" 
                onClick={prepareAutoSave}
              >
                <Link href={`/sign-in?callbackURL=${encodeURIComponent(window.location.pathname)}`}>
                  <LogIn size={20} />
                  Sign in to Save
                </Link>
              </Button>
            <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-[0.1em] px-4">
              Your data will be automatically saved after you sign in.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
