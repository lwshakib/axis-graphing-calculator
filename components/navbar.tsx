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
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { UserAccount } from "@/components/user-account";

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
                  "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 group",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={16} className={cn("transition-transform group-hover:scale-110", isActive && "relative z-10")} />
                <span className={cn(isActive && "relative z-10")}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <UserAccount />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl backdrop-blur-xl bg-background/90 border-border/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild className="rounded-xl mb-1">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 w-full cursor-pointer px-3 py-2.5 transition-all",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      )}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-muted-foreground"} />
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <div className="h-px bg-muted/50 my-2 sm:hidden mx-2" />
              <DropdownMenuItem asChild className="sm:hidden rounded-xl">
                 <UserAccount />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
          <Settings size={20} />
        </Button>
      </div>
    </nav>
  );
}
