"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, Home, Calculator, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0, 0.71, 0.2, 1.01]
          }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary/20 via-primary/10 to-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-primary animate-bounce" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Equation Not Found
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-md mx-auto">
            It seems this coordinate doesn't exist in our mathematical universe.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Back to Base
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 px-8 font-black text-lg border-2 hover:bg-accent border-zinc-200 dark:border-zinc-800 hover:scale-105 active:scale-95 transition-all">
            <Link href="/calculator">
              <Calculator className="mr-2 h-5 w-5" /> Use Calculator
            </Link>
          </Button>
        </motion.div>

        {/* Floating Mathematical Symbols Decor */}
        <div className="absolute -z-10 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
            <div className="absolute top-10 left-10 text-6xl font-serif rotate-12">∫</div>
            <div className="absolute bottom-20 left-20 text-4xl font-serif -rotate-12">π</div>
            <div className="absolute top-20 right-20 text-5xl font-serif rotate-45">Σ</div>
            <div className="absolute bottom-10 right-10 text-6xl font-serif -rotate-6">∞</div>
            <div className="absolute top-1/2 left-[-2rem] text-4xl font-serif">√</div>
            <div className="absolute top-1/2 right-[-2rem] text-4xl font-serif">Δ</div>
        </div>
      </div>
    </div>
  );
}
