"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MoveLeft,
  Grid3X3,
  Variable,
  Equal,
  Settings2,
  History,
  Info,
  Sigma,
  Edit3,
} from "lucide-react";
import { evaluateMath, formatResult, setVariable } from "@/lib/math-parser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveSessionButton } from "@/components/save-session-button";
import { useRouter } from "next/navigation";

// MathLive for Natural Display Input
import "mathlive";
import { MathfieldElement } from "mathlive";

const MathField = React.forwardRef<MathfieldElement, Record<string, unknown>>(
  (props, ref) => {
    // @ts-expect-error math-field is a web component from MathLive
    return <math-field {...props} ref={ref} />;
  },
);
MathField.displayName = "MathField";

function MatrixRenderer({
  data,
}: {
  data: unknown[][] | { isMatrix?: boolean; toArray?: () => unknown[][] };
}) {
  const matrix: unknown[][] = Array.isArray(data)
    ? data
    : (data as { toArray?: () => unknown[][] }).toArray
      ? (data as { toArray: () => unknown[][] }).toArray()
      : [data as unknown[]];

  return (
    <div className="inline-flex items-stretch gap-2 my-2 py-1">
      {/* Left Bracket */}
      <div className="w-2.5 border-l-2 border-t-2 border-b-2 border-zinc-400 dark:border-zinc-500 rounded-l-md" />

      <div
        className="grid gap-x-6 gap-y-3 p-2 items-center"
        style={{
          gridTemplateColumns: `repeat(${Array.isArray(matrix[0]) ? matrix[0].length : 1}, auto)`,
        }}
      >
        {matrix.flat().map((cell: unknown, i: number) => (
          <div
            key={i}
            className="text-center font-mono text-base md:text-lg px-2 font-bold text-zinc-800 dark:text-zinc-200"
          >
            {typeof cell === "number" ? Number(cell.toFixed(4)) : String(cell)}
          </div>
        ))}
      </div>

      {/* Right Bracket */}
      <div className="w-2.5 border-r-2 border-t-2 border-b-2 border-zinc-400 dark:border-zinc-500 rounded-r-md" />
    </div>
  );
}

interface ScientificWorkspaceProps {
  initialData?: {
    variables: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    history: { expr: string; res: any }[];
    title: string;
  };
  sessionId?: string;
}

export function ScientificWorkspace({
  initialData,
  sessionId,
}: ScientificWorkspaceProps) {
  const mfRef = useRef<MathfieldElement>(null);
  const [mounted, setMounted] = useState(false);
  const [equation, setEquation] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariablesList] = useState<Record<string, string>>(
    initialData?.variables || {},
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistoryList] = useState<{ expr: string; res: any }[]>(
    initialData?.history || [],
  );
  const [title, setTitle] = useState(
    initialData?.title || "Untitled Scientific",
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    sessionId,
  );
  const router = useRouter();

  // Matrix Editor State
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);
  const [matrixData, setMatrixData] = useState<string[][]>([
    ["0", "0"],
    ["0", "0"],
  ]);
  const [matrixVarName, setMatrixVarName] = useState("A");

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (mfRef.current) {
      const mf = mfRef.current;
      mf.mathVirtualKeyboardPolicy = "manual";
      mf.addEventListener("input", () => {
        setError(null);
      });
      mf.value = "";
    }
  }, []);

  const insertAtCursor = (content: string) => {
    if (mfRef.current) {
      mfRef.current.insert(content, { focus: true });
      setError(null);
    }
  };

  const handleCalculate = () => {
    if (!mfRef.current) return;

    // Use LaTeX output for robust parsing of commands like \text{abc}, \left|, etc.
    const latex = mfRef.current.value;
    const expression = latex;

    try {
      // Check for assignment: "A = 10"
      const assignmentMatch = expression.match(
        /^([a-z][a-z0-9]*)\s*=\s*(.*)$/i,
      );

      if (assignmentMatch) {
        const name = assignmentMatch[1];
        const expr = assignmentMatch[2];

        if (expr.trim()) {
          const val = evaluateMath(expr);
          setVariable(name, val);
          setVariablesList((prev) => ({ ...prev, [name]: formatResult(val) }));
          setEquation(latex);
          setResult(val);
          setHistoryList((prev) =>
            [{ expr: latex, res: val }, ...prev].slice(0, 5),
          );
          setError(null);
          return;
        }
      }

      // If it ends with '=', strip it before evaluation
      const evalExpr = expression.endsWith("=")
        ? expression.slice(0, -1).trim()
        : expression.trim();

      if (!evalExpr) {
        setResult(null);
        return;
      }

      const res = evaluateMath(evalExpr);
      setEquation(latex + (latex.includes("=") ? "" : " ="));
      setResult(res);
      setHistoryList((prev) =>
        [{ expr: latex, res: res }, ...prev].slice(0, 5),
      );
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Math Error";
      setError(message);
      setResult(null);
    }
  };

  const clear = () => {
    if (mfRef.current) {
      mfRef.current.value = "";
    }
    setEquation("");
    setResult(null);
    setError(null);
  };

  const deleteLast = () => {
    if (mfRef.current) {
      mfRef.current.executeCommand("deleteBackward");
    }
  };

  const createMatrix = () => {
    // Generate LaTeX bmatrix for visual consistency in MathLive
    const latexRows = matrixData.map((row) => row.join(" & ")).join(" \\\\ ");
    const matrixStr = `\\begin{bmatrix} ${latexRows} \\end{bmatrix}`;

    // We insert it as LaTeX
    if (mfRef.current) {
      // If it's an assignment, we should include the variable name
      const content = matrixVarName
        ? `${matrixVarName} = ${matrixStr}`
        : matrixStr;
      mfRef.current.insert(content, { focus: true });
    }

    setIsDialogOpen(false);
  };

  const updateMatrixCell = (r: number, c: number, val: string) => {
    const newData = [...matrixData];
    newData[r][c] = val;
    setMatrixData(newData);
  };

  const resizeMatrix = (rows: number, cols: number) => {
    setMatrixRows(rows);
    setMatrixCols(cols);
    const newData = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => matrixData[r]?.[c] || "0"),
    );
    setMatrixData(newData);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300 overflow-x-hidden pt-8">
      {/* Dynamic Title and Save Button */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Edit3 size={20} className="text-primary" />
          <h1 className="text-xl font-black tracking-tight">{title}</h1>
        </div>
        <SaveSessionButton
          type="scientific"
          data={{ variables, history }}
          currentSessionId={currentSessionId}
          onSaveSuccess={(id, newTitle) => {
            setCurrentSessionId(id);
            setTitle(newTitle);
            router.replace(`/scientific/${id}`);
          }}
        />
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row transition-all duration-500">
        <div className="lg:w-1/4 bg-zinc-50 dark:bg-zinc-900/50 p-6 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col gap-8">
          <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Variable size={14} className="text-indigo-500" /> Variables
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {Object.keys(variables).length === 0 ? (
                <div className="bg-zinc-100/50 dark:bg-zinc-800/30 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                  <p className="text-zinc-400 text-[10px] text-center italic">
                    Type &quot;A = 10&quot; to save
                  </p>
                </div>
              ) : (
                Object.entries(variables).map(([name, val]) => (
                  <button
                    key={name}
                    className="w-full flex justify-between items-center bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:ring-2 hover:ring-indigo-500/20 transition-all text-left"
                    onClick={() => insertAtCursor(name)}
                  >
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {name}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate ml-2 max-w-[80px] font-mono">
                      {val}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <History size={14} className="text-emerald-500" /> Recent
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="group p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 transition-all cursor-pointer"
                  onClick={() => {
                    if (mfRef.current) mfRef.current.value = item.expr;
                  }}
                >
                  <p className="text-[10px] text-zinc-400 truncate mb-0.5">
                    {item.expr}
                  </p>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate">
                    {formatResult(item.res)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-2xl h-12 border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600/50 transition-all"
                >
                  <Grid3X3 size={18} /> Define Matrix
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 rounded-[2rem] border-none shadow-2xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white">
                    Create Matrix
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                        Variable Name
                      </label>
                      <Input
                        placeholder="A"
                        value={matrixVarName}
                        onChange={(e) =>
                          setMatrixVarName(e.target.value.toUpperCase())
                        }
                        className="h-12 rounded-xl text-center font-black text-xl text-indigo-600 border-2 focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                        Dimensions
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={matrixRows}
                          onChange={(e) =>
                            resizeMatrix(
                              parseInt(e.target.value) || 1,
                              matrixCols,
                            )
                          }
                          className="w-16 h-12 text-center rounded-xl font-bold"
                        />
                        <span className="text-zinc-300 font-bold">×</span>
                        <Input
                          type="number"
                          value={matrixCols}
                          onChange={(e) =>
                            resizeMatrix(
                              matrixRows,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 h-12 text-center rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="grid gap-2 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 max-h-64 overflow-auto custom-scrollbar"
                    style={{
                      gridTemplateColumns: `repeat(${matrixCols}, 1fr)`,
                    }}
                  >
                    {matrixData.map((row, r) =>
                      row.map((val, c) => (
                        <Input
                          key={`${r}-${c}`}
                          value={val}
                          onChange={(e) =>
                            updateMatrixCell(r, c, e.target.value)
                          }
                          className="h-10 text-center text-sm p-1 rounded-lg border-zinc-200"
                        />
                      )),
                    )}
                  </div>
                  <Button
                    onClick={createMatrix}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Insert Matrix
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Input Equation
              </span>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-zinc-400 hover:text-indigo-500 transition-colors">
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-xl">
                      <p className="text-xs">
                        Usa <b>LaTeX</b> or natural math. <br />
                        Click symbols below to insert.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-zinc-900 rounded-[1.8rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[140px] flex flex-col p-6">
                <div className="text-zinc-400 text-right text-xs font-mono mb-2 h-4 truncate opacity-60 italic">
                  {equation}
                </div>
                {mounted ? (
                  <MathField
                    ref={mfRef}
                    className="w-full text-2xl md:text-3xl font-medium outline-none text-zinc-800 dark:text-zinc-100 bg-transparent min-h-[40px]"
                  />
                ) : (
                  <div className="w-full h-[40px] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
                )}
                <div className="mt-auto pt-4 flex items-center justify-end gap-3 min-h-[60px]">
                  {error ? (
                    <div className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-xl animate-shake">
                      {error}
                    </div>
                  ) : result !== null ? (
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-right-4">
                      {result && (result.isMatrix || Array.isArray(result)) ? (
                        <MatrixRenderer data={result} />
                      ) : (
                        <>
                          <span className="text-3xl font-black tracking-tight">
                            {formatResult(result)}
                          </span>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Sigma size={14} className="text-purple-500" /> Functions
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                <SciFuncButton onClick={() => insertAtCursor("\\sin(#?)")}>
                  sin
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\cos(#?)")}>
                  cos
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\tan(#?)")}>
                  tan
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\arcsin(#?)")}>
                  asin
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\arccos(#?)")}>
                  acos
                </SciFuncButton>

                <SciFuncButton onClick={() => insertAtCursor("\\sinh(#?)")}>
                  sinh
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\cosh(#?)")}>
                  cosh
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\tanh(#?)")}>
                  tanh
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\arctan(#?)")}>
                  atan
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("abs(#?)")}>
                  abs
                </SciFuncButton>

                <SciFuncButton onClick={() => insertAtCursor("\\log(#?)")}>
                  log
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\ln(#?)")}>
                  ln
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\sqrt{#@}")}>
                  √
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\frac{d}{dx}(#?)")}
                  className="text-indigo-600 font-bold"
                >
                  d/dx
                </SciFuncButton>

                <SciFuncButton
                  onClick={() => insertAtCursor("\\int_{#?}^{#?}(#?)dx")}
                  className="text-emerald-600 font-bold"
                >
                  ∫ dx
                </SciFuncButton>

                <SciFuncButton onClick={() => insertAtCursor("e")}>
                  e
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("\\pi")}>
                  π
                </SciFuncButton>
                <SciFuncButton onClick={() => insertAtCursor("^{2}")}>
                  x²
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{simplify}(#?)")}
                  className="text-indigo-600 font-bold"
                >
                  simp
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{transpose}(#?)")}
                  className="text-indigo-600"
                >
                  T
                </SciFuncButton>

                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{inv}(#?)")}
                  className="text-indigo-600"
                >
                  inv
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{det}(#?)")}
                  className="text-indigo-600"
                >
                  det
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{trace}(#?)")}
                  className="text-indigo-600"
                >
                  tr
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{dot}(#?,#?)")}
                  className="text-indigo-600"
                >
                  dot
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{cross}(#?,#?)")}
                  className="text-indigo-600"
                >
                  cross
                </SciFuncButton>

                <SciFuncButton
                  onClick={() => insertAtCursor("(")}
                  className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-black"
                >
                  (
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor(")")}
                  className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-black"
                >
                  )
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("^")}
                  className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-black"
                >
                  ^
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor(",")}
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-black"
                >
                  ,
                </SciFuncButton>
                <SciFuncButton
                  onClick={() => insertAtCursor("\\text{norm}(#?)")}
                  className="text-indigo-600"
                >
                  norm
                </SciFuncButton>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Settings2 size={14} className="text-zinc-500" /> Keypad
              </h3>
              <div className="grid grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
                <CalcButton
                  onClick={clear}
                  className="text-red-500 bg-red-50/50 dark:bg-red-950/10 border-red-100 hover:bg-red-100 hover:text-red-600"
                >
                  AC
                </CalcButton>
                <CalcButton
                  onClick={deleteLast}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                >
                  <MoveLeft size={20} />
                </CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("%")}
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                >
                  %
                </CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("/")}
                  className="bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-none hover:bg-indigo-700"
                >
                  ÷
                </CalcButton>

                <CalcButton onClick={() => insertAtCursor("7")}>7</CalcButton>
                <CalcButton onClick={() => insertAtCursor("8")}>8</CalcButton>
                <CalcButton onClick={() => insertAtCursor("9")}>9</CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("*")}
                  className="bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-none hover:bg-indigo-700"
                >
                  ×
                </CalcButton>

                <CalcButton onClick={() => insertAtCursor("4")}>4</CalcButton>
                <CalcButton onClick={() => insertAtCursor("5")}>5</CalcButton>
                <CalcButton onClick={() => insertAtCursor("6")}>6</CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("-")}
                  className="bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-none hover:bg-indigo-700"
                >
                  -
                </CalcButton>

                <CalcButton onClick={() => insertAtCursor("1")}>1</CalcButton>
                <CalcButton onClick={() => insertAtCursor("2")}>2</CalcButton>
                <CalcButton onClick={() => insertAtCursor("3")}>3</CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("+")}
                  className="bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-none hover:bg-indigo-700"
                >
                  +
                </CalcButton>

                <CalcButton
                  onClick={() => insertAtCursor("0")}
                  className="col-span-1"
                >
                  0
                </CalcButton>
                <CalcButton onClick={() => insertAtCursor(".")}>.</CalcButton>
                <CalcButton
                  onClick={() => insertAtCursor("=")}
                  className="bg-zinc-200 dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-black text-2xl border-none hover:bg-zinc-300"
                >
                  =
                </CalcButton>
                <CalcButton
                  onClick={handleCalculate}
                  className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none hover:bg-emerald-600"
                >
                  <Equal size={28} />
                </CalcButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
          animation-iteration-count: 2;
        }

        math-field {
          --caret-color: #4f46e5;
          --selection-background-color: #4f46e530;
          --text-font-family: "Outfit", sans-serif;
          border: none;
          background: transparent;
          color: inherit;
        }
        math-field:focus-within {
          outline: none;
        }
        math-field::part(virtual-keyboard-toggle) {
          display: none;
        }
      `}</style>
    </div>
  );
}

function CalcButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-14 w-full rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SciFuncButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-11 w-full rounded-[1.1rem] flex items-center justify-center text-xs font-bold transition-all active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-700",
        "bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400",
        className,
      )}
    >
      {children}
    </button>
  );
}
