"use client";

/**
 * Account Page: User profile and security management.
 * Provides tools for updating profile info, managing OAuth connections,
 * changing passwords, revoking active sessions, and deleting the account.
 * Integrates with better-auth for client-side authentication management.
 */

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Laptop,
  Monitor,
  Smartphone,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Internal Interfaces ---

interface SessionItem {
  id: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AccountItem {
  id: string;
  providerId: string;
}

interface UserWithProvider {
  name?: string | null;
  email?: string;
  image?: string | null;
  provider?: string;
}

export default function AccountPage() {
  // --- Auth State ---
  const {
    data: session,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = authClient.useSession();

  // --- Domain Data State ---
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  // --- Form & Action State ---
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  /** Data Fetcher: Lists all active sessions for the user. */
  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    try {
      // better-auth-client listSessions helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (authClient as any).listSessions();
      if (res.data) setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  /** Data Fetcher: Lists linked third-party accounts (Google, etc.). */
  const fetchAccounts = async () => {
    setIsAccountsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (authClient as any).listAccounts();
      if (res.data) setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setIsAccountsLoading(false);
    }
  };

  // Sync profile data when the session hydrates
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchSessions();
      fetchAccounts();
    }
  }, [session]);

  // Loading indicator for initial hydration
  if (isSessionPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Redirect to sign-in if no active session
  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // --- Profile Actions ---

  /** Updates the user's display name. */
  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setIsUpdatingName(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      toast.success("Profile updated");
      refetchSession(); // Refresh local session cache
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingName(false);
    }
  };

  /** Updates user credentials. */
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error("Please fill all fields and ensure passwords match");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) throw error;
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update password";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /** Logs out another active device session by ID. */
  const handleRevokeSession = async (id: string) => {
    setRevokingId(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (authClient as any).revokeSession({ id });
      toast.success("Session revoked");
      fetchSessions();
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  /** Initiates OAuth linking flow. */
  const handleLinkAccount = async (provider: "google") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/account",
      });
    } catch {
      toast.error(`Failed to link ${provider} account`);
    }
  };

  /** Destructive action to permanently remove the user and all data. */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || "Failed to delete account");
      } else {
        toast.success("Account deleted successfully");
        await authClient.signOut();
        window.location.href = "/sign-in";
      }
    } catch {
      toast.error("An error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  /** Unlinks a connected OAuth provider. */
  const handleUnlinkAccount = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (authClient as any).unlinkAccount({ accountRecordId: id });
      toast.success("Account unlinked");
      fetchAccounts();
    } catch {
      toast.error("Failed to unlink account");
    }
  };

  /** Helper to determine if a specific provider is already used by this user. */
  const isProviderLinked = (provider: string) => {
    if ((user as UserWithProvider).provider === provider) return true;
    return accounts?.some((acc) => acc.providerId === provider);
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen font-sans transition-colors duration-500">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* --- Navigation & Profile Sidebar --- */}
          <div className="space-y-8 lg:col-span-4">
            <div className="sticky top-12">
              <div className="group relative mx-auto h-32 w-32 lg:mx-0">
                <Avatar className="border-secondary ring-border h-32 w-32 border-4 shadow-2xl ring-1 transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="bg-secondary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-6 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
              </div>

              {/* Sidebar Quick-Scroll Navigation */}
              <div className="mt-12 hidden space-y-2 lg:block">
                {["Profile", "Security", "Sessions", "Delete Account"].map(
                  (item) => (
                    <button
                      key={item}
                      className={cn(
                        "w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-all",
                        item === "Delete Account"
                          ? "text-destructive hover:bg-destructive/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                      onClick={() => {
                        const el = document.getElementById(
                          item.toLowerCase().replace(" ", "-"),
                        );
                        if (el)
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* --- Main Settings Stream --- */}
          <div className="space-y-20 pb-40 lg:col-span-8">
            {/* Section: Profile Settings */}
            <section id="profile" className="scroll-mt-12 space-y-8">
              <div className="border-border border-b pb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Profile Settings
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Manage your public information and connected accounts.
                </p>
              </div>

              <div className="space-y-10">
                {/* Display Name Form */}
                <div className="grid gap-3">
                  <Label
                    htmlFor="name"
                    className="text-muted-foreground text-xs font-bold"
                  >
                    Display Name
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="border-border bg-secondary/50 text-foreground focus-visible:ring-primary/50 h-11 max-w-md rounded-xl"
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={isUpdatingName || name === user.name}
                      variant="default"
                      className="hover:shadow-primary/20 h-11 rounded-xl px-6 font-bold shadow-lg transition-all"
                    >
                      {isUpdatingName ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </div>

                {/* OAuth Provider Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs font-bold">
                      Connected Accounts
                    </Label>
                    {isAccountsLoading && (
                      <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    )}
                  </div>

                  <div className="grid gap-3">
                    {isAccountsLoading ? (
                      <div className="grid gap-3">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-secondary/30 border-border/60 h-20 animate-pulse rounded-2xl border"
                          />
                        ))}
                      </div>
                    ) : (
                      ["google"].map((provider) => {
                        const isLinked = isProviderLinked(provider);
                        return (
                          <div
                            key={provider}
                            className="bg-secondary/30 border-border/60 hover:bg-secondary/50 flex items-center justify-between rounded-2xl border p-4 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-background border-border flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm">
                                {provider === "google" && (
                                  <Image
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    alt="google"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-foreground text-xs font-bold capitalize">
                                  {provider}
                                </p>
                                <p className="text-muted-foreground text-[10px] font-medium">
                                  {isLinked
                                    ? "Connected and verified"
                                    : "Not connected"}
                                </p>
                              </div>
                            </div>
                            {isLinked ? (
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-500">
                                  Active
                                </span>
                                {accounts?.some(
                                  (a) => a.providerId === provider,
                                ) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const acc = accounts?.find(
                                        (a) => a.providerId === provider,
                                      );
                                      if (acc) handleUnlinkAccount(acc.id);
                                    }}
                                    className="text-destructive hover:bg-destructive/10 h-8 rounded-lg px-3 text-[10px] font-bold"
                                  >
                                    Unlink
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleLinkAccount(provider as "google")
                                }
                                className="border-border bg-background hover:bg-secondary h-8 rounded-lg px-4 text-[10px] font-bold"
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Account Security */}
            <section id="security" className="scroll-mt-12 space-y-8">
              <div className="border-border border-b pb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Account Security
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Change your password and secure your identity.
                </p>
              </div>

              <div className="max-w-md space-y-5">
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-[10px] font-bold">
                    Current Password
                  </Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border-border bg-secondary/50 h-11 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-[10px] font-bold">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-border bg-secondary/50 h-11 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-[10px] font-bold">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-border bg-secondary/50 h-11 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={
                    isUpdatingPassword || !currentPassword || !newPassword
                  }
                  className="hover:shadow-primary/20 mt-2 h-11 w-full rounded-xl font-bold shadow-lg transition-all"
                >
                  {isUpdatingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </div>
            </section>

            {/* Section: Active Sessions Management */}
            <section id="sessions" className="scroll-mt-12 space-y-8">
              <div className="border-b border-zinc-900 pb-4">
                <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                  Active Sessions
                  {isSessionsLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  )}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Devices that are currently logged into your account.
                </p>
              </div>

              <div className="grid gap-3">
                {isSessionsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-800" />
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className="border-border/60 bg-secondary/30 group hover:bg-secondary/50 flex items-center justify-between rounded-2xl border p-5 backdrop-blur-sm transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="bg-background border-border flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm">
                          {s.userAgent?.toLowerCase().includes("mobile") ? (
                            <Smartphone className="text-muted-foreground h-6 w-6" />
                          ) : (
                            <Laptop className="text-muted-foreground h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-foreground text-sm font-bold">
                              {s.userAgent?.split(")")[0]?.split("(")[1] ||
                                "Modern Browser"}
                            </p>
                            {s.id === session.session.id && (
                              <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-[9px] font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[10px] font-medium text-zinc-500 opacity-80">
                            {s.ipAddress || "Active Connection"} • Last active
                            recently
                          </p>
                        </div>
                      </div>
                      {s.id !== session.session.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(s.id)}
                          disabled={revokingId === s.id}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-4"
                        >
                          {revokingId === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="mr-2 h-4 w-4" />
                          )}
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900">
                      <Monitor className="h-6 w-6 text-zinc-600" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-400">
                      No active sessions found
                    </h3>
                    <p className="mt-1 max-w-[200px] text-xs text-zinc-600">
                      Only the current session is currently registered in our
                      security logs.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Danger Zone (Account Deletion) */}
            <section
              id="delete-account"
              className="scroll-mt-12 pt-16 border-t border-border/10"
            >
              <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/[0.03] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-destructive flex items-center gap-2">
                    <AlertTriangle size={24} />
                    Delete Account
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Once you delete your account, there is no going back. All
                    sessions and data will be permanently removed.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="rounded-xl px-8 font-bold shadow-lg shadow-destructive/10 h-11 transition-all hover:scale-[1.02]"
                    >
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-border bg-background backdrop-blur-xl">
                    <AlertDialogHeader className="space-y-3">
                      <AlertDialogTitle className="text-xl font-black tracking-tight">
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground text-sm">
                        This action is permanent and cannot be undone. You will
                        lose all saved sessions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                      <AlertDialogCancel className="rounded-xl border-border bg-secondary/50 font-bold h-11">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold px-8 h-11 shadow-lg shadow-destructive/20"
                      >
                        {isDeleting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          "Confirm Deletion"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
