"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { History, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";


export function UserAccount() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogOut = async () => {
    const parts = pathname.split("/").filter(Boolean);
    const tools = ["graph", "calculator", "scientific", "3d", "dashboard"];
    
    let target = pathname;

    // Check if we are on a session page: /tool/some-id
    if (parts.length === 2 && tools.includes(parts[0])) {
      target = `/${parts[0]}`;
    } else if (parts[0] === "dashboard") {
      target = "/";
    }

    await authClient.signOut({ 
      fetchOptions: { 
        onSuccess: () => {
          router.push(target);
          router.refresh();
        } 
      } 
    });
  };

  if (isPending) {
    return <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />;
  }

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

  const user = session.user;
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl p-2" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-3">
          <p className="text-sm font-black leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link href="/dashboard" className="flex items-center w-full">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link href="/dashboard" className="flex items-center w-full">
            <History className="mr-2 h-4 w-4" />
            <span>My Sessions</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-bold">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
