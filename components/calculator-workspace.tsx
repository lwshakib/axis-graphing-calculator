"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Delete,
  RotateCcw,
  Percent,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  Edit3,
} from "lucide-react";
import { evaluateMath } from "@/lib/math-parser";
import { SaveSessionButton } from "@/components/save-session-button";
import { useRouter } from "next/navigation";

interface CalculatorWorkspaceProps {
  initialData?: {
    display: string;
    equation: string;
    title: string;
  };
  sessionId?: string;
}

export function CalculatorWorkspace({
  initialData,
  sessionId,
}: CalculatorWorkspaceProps) {
  const [display, setDisplay] = useState(initialData?.display || "0");
  const [equation, setEquation] = useState(initialData?.equation || "");
  const [title, setTitle] = useState(
    initialData?.title || "Untitled Calculator",
  );
  const [isResult, setIsResult] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    sessionId,
  );
  const router = useRouter();

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

  const toggleSign = () => {
    if (display !== "0") {
      setDisplay(String(Number(display) * -1));
    }
  };

  const percentage = () => {
    setDisplay(String(Number(display) / 100));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-sm mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-primary" />
          <span className="text-sm font-black tracking-tight">{title}</span>
        </div>
        <SaveSessionButton
          type="calculator"
          data={{ display, equation }}
          currentSessionId={currentSessionId}
          onSaveSuccess={(id, newTitle) => {
            setCurrentSessionId(id);
            setTitle(newTitle);
            router.replace(`/calculator/${id}`);
          }}
        />
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="h-32 flex flex-col items-end justify-end px-4 mb-6">
          <div className="text-zinc-400 dark:text-zinc-500 text-lg font-medium h-6">
            {equation}
          </div>
          <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 truncate w-full text-right">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <CalcButton
            onClick={clear}
            className="bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            AC
          </CalcButton>
          <CalcButton
            onClick={toggleSign}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            +/-
          </CalcButton>
          <CalcButton
            onClick={percentage}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <Percent size={20} />
          </CalcButton>
          <CalcButton
            onClick={() => handleOperator("÷")}
            className="bg-primary text-primary-foreground"
          >
            <Divide size={20} />
          </CalcButton>

          <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
          <CalcButton
            onClick={() => handleOperator("×")}
            className="bg-primary text-primary-foreground"
          >
            <X size={20} />
          </CalcButton>

          <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
          <CalcButton
            onClick={() => handleOperator("-")}
            className="bg-primary text-primary-foreground"
          >
            <Minus size={20} />
          </CalcButton>

          <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
          <CalcButton
            onClick={() => handleOperator("+")}
            className="bg-primary text-primary-foreground"
          >
            <Plus size={20} />
          </CalcButton>

          <CalcButton
            onClick={() => handleNumber("0")}
            className="col-span-2 text-left px-8 justify-start"
          >
            0
          </CalcButton>
          <CalcButton onClick={() => handleNumber(".")}>.</CalcButton>
          <CalcButton
            onClick={calculate}
            className="bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20"
          >
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
  className,
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
        className,
      )}
    >
      {children}
    </button>
  );
}
