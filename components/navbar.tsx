"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Calculator, FunctionSquare, LayoutGrid, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    name: "Graphing",
    href: "/graph",
    icon: LayoutGrid,
  },
  {
    name: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
  {
    name: "Scientific",
    href: "/scientific",
    icon: FunctionSquare,
  },
  { name: "3D Plotter", href: "/3d", icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Logo iconClassName="w-8 h-8" textClassName="text-xl" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-accent",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground"
                )}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="font-semibold px-4">
            Log In
          </Button>
          <Button size="sm" className="font-semibold px-4 rounded-full">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <Icon size={16} />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <div className="h-px bg-muted my-1 sm:hidden" />
              <DropdownMenuItem className="sm:hidden">Log In</DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden font-bold">Sign Up</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings size={20} />
        </Button>
      </div>
    </nav>
  );
}
