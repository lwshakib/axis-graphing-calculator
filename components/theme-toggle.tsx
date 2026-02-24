"use client";

/**
 * ThemeToggle component allowing users to switch between Light, Dark, and System display modes.
 * Uses `next-themes` for theme persistence and Lucide icons for visual representation.
 */

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  // Access the setTheme function from next-themes provider
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Main toggle button with a rotating icon animation between sun and moon */}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          {/* Sun icon visible in light mode, hidden/rotated in dark mode */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon hidden/rotated in light mode, visible in dark mode */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown menu options for explicit theme selection */}
      <DropdownMenuContent align="end" className="rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 rounded-lg cursor-pointer"
        >
          <Sun size={16} />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 rounded-lg cursor-pointer"
        >
          <Moon size={16} />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 rounded-lg cursor-pointer"
        >
          <Monitor size={16} />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
