"use client";

/**
 * UserAccount component for managing user sessions and profile visibility.
 * Displays login/signup buttons for guests and a user profile dropdown for authenticated users.
 */

import React from "react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { History, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function UserAccount() {
  // Retrieve current session and loading state from Better-Auth client
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handles user logout with context-aware redirection.
   * If the user is on a tool-specific page (e.g., /graph/123), redirects to the tool home (/graph).
   * If on the dashboard, redirects to the application root.
   */
  const handleLogOut = async () => {
    const parts = pathname.split("/").filter(Boolean);
    const tools = ["graph", "calculator", "scientific", "3d", "dashboard"];

    let target = pathname;

    // Logic to determine redirection target after logout
    if (parts.length === 2 && tools.includes(parts[0])) {
      // User is on a specific session page -> Go to tool home
      target = `/${parts[0]}`;
    } else if (parts[0] === "dashboard") {
      // User is on dashboard -> Go to root landing page
      target = "/";
    }

    // Execute sign out and perform navigation on success
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(target);
          router.refresh();
        },
      },
    });
  };

  // Render a loading state (pulse effect) while session status is being determined
  if (isPending) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  // Render Guest view if no active session is found
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="font-semibold px-4"
          asChild
        >
          <Link href="/sign-in">Log In</Link>
        </Button>
        <Button
          size="sm"
          className="font-bold px-4 rounded-full shadow-lg shadow-primary/10 transition-all hover:scale-105"
          asChild
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  // Authenticated view variables
  const user = session.user;
  // Generate initials for the avatar fallback
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Profile Avatar Button */}
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 rounded-lg p-1.5 shadow-xl border-border/50"
        align="end"
        forceMount
      >
        {/* User Metadata Header */}
        <div className="flex flex-col space-y-0.5 p-2">
          <p className="text-sm font-bold leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        
        {/* Navigation Items */}
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
          <Link href="/account" className="flex items-center w-full">
            <UserIcon className="mr-2 h-3.5 w-3.5" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
          <Link href="/dashboard" className="flex items-center w-full">
            <History className="mr-2 h-3.5 w-3.5" />
            <span>My Sessions</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Destructive Logout Action */}
        <DropdownMenuItem
          className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogOut}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span className="font-bold">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
