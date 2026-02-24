"use client";

/**
 * MathKeyboard component providing a virtual mathematical keypad.
 * Useful for mobile users or for quick entry of mathematical functions.
 * Features categorized color schemes for numbers, operators, and functions.
 */

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MathKeyboardProps {
  onInput: (value: string) => void; // Callback when a key is pressed
  onClose: () => void; // Callback to hide the keyboard
  isOpen: boolean; // Controls whether keyboard is rendered
}

/**
 * 2D array representation of the keyboard layout.
 */
const KEYS = [
  ["7", "8", "9", "/", "sin", "cos"],
  ["4", "5", "6", "*", "tan", "sqrt"],
  ["1", "2", "3", "-", "(", ")"],
  ["0", ".", "=", "+", "x", "y"],
  ["pi", "e", "^", "log", "ln", "abs"],
];

export function MathKeyboard({ onInput, onClose, isOpen }: MathKeyboardProps) {
  // Return null if keyboard is not active
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-full">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header containing title and close button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Math Keyboard
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Dynamic Keypad Grid */}
        <div className="grid grid-cols-6 gap-2">
          {KEYS.flat().map((key) => (
            <Button
              key={key}
              variant="outline"
              className={cn(
                "h-12 text-lg font-medium transition-all hover:scale-105 active:scale-95",
                // Conditional styling based on key type
                ["/", "*", "-", "+", "="].includes(key)
                  ? "bg-primary/10 text-primary border-primary/20" // Math Operators
                  : ["sin", "cos", "tan", "sqrt", "log", "ln", "abs"].includes(
                        key,
                      )
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" // Math Functions
                    : "bg-secondary/50", // Numbers and other symbols
              )}
              onClick={() => onInput(key)}
            >
              {/* Specialized symbol rendering */}
              {key === "sqrt" ? "√" : key === "pi" ? "π" : key}
            </Button>
          ))}

          {/* Action Buttons: Spanning multiple columns */}
          <Button
            variant="destructive"
            className="h-12 text-lg font-medium col-span-2"
            onClick={() => onInput("backspace")}
          >
            Backspace
          </Button>
          <Button
            variant="secondary"
            className="h-12 text-lg font-medium col-span-2"
            onClick={() => onInput("clear")}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
