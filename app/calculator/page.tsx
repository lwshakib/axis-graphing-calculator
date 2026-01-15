"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Delete, RotateCcw, Percent, Divide, X, Minus, Plus, Equal } from "lucide-react";
import { evaluateMath } from "@/lib/math-parser";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isResult, setIsResult] = useState(false);

  const handleNumber = (num: string) => {
    if (display === "0" || isResult) {
      setDisplay(num);
      setIsResult(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
    setIsResult(false);
  };

  const calculate = () => {
    try {
      const finalEquation = equation + display;
      const result = evaluateMath(finalEquation);
      setDisplay(String(Number(result.toFixed(8))));
      setEquation("");
      setIsResult(true);
    } catch (error) {
      setDisplay("Error");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
    setIsResult(false);
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const appendDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const toggleSign = () => {
    if (display !== "0") {
      setDisplay(String(Number(display) * -1));
    }
  };

  const percentage = () => {
    setDisplay(String(Number(display) / 100));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
        {/* Display */}
        <div className="h-32 flex flex-col items-end justify-end px-4 mb-6">
          <div className="text-zinc-400 dark:text-zinc-500 text-lg font-medium h-6">
            {equation}
          </div>
          <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 truncate w-full text-right">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <CalcButton onClick={clear} className="bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            AC
          </CalcButton>
          <CalcButton onClick={toggleSign} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            +/-
          </CalcButton>
          <CalcButton onClick={percentage} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Percent size={20} />
          </CalcButton>
          <CalcButton onClick={() => handleOperator("÷")} className="bg-primary text-primary-foreground">
            <Divide size={20} />
          </CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
          <CalcButton onClick={() => handleOperator("×")} className="bg-primary text-primary-foreground">
            <X size={20} />
          </CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
          <CalcButton onClick={() => handleOperator("-")} className="bg-primary text-primary-foreground">
            <Minus size={20} />
          </CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
          <CalcButton onClick={() => handleOperator("+")} className="bg-primary text-primary-foreground">
            <Plus size={20} />
          </CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => handleNumber("0")} className="col-span-2 text-left px-8 justify-start">
            0
          </CalcButton>
          <CalcButton onClick={appendDecimal}>.</CalcButton>
          <CalcButton onClick={calculate} className="bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20">
            <Equal size={24} />
          </CalcButton>
        </div>
      </div>
    </div>
  );
}

function CalcButton({ 
  children, 
  onClick, 
  className 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-16 w-full rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95",
        "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100",
        className
      )}
    >
      {children}
    </button>
  );
}
