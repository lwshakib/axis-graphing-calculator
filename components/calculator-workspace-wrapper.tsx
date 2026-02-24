"use client";

import dynamic from "next/dynamic";

const CalculatorWorkspace = dynamic(
  () => import("./calculator-workspace").then((mod) => mod.CalculatorWorkspace),
  { ssr: false },
);

interface CalculatorWorkspaceProps {
  initialData?: {
    display: string;
    equation: string;
    title: string;
  };
  sessionId?: string;
}

export function CalculatorWorkspaceWrapper(props: CalculatorWorkspaceProps) {
  return <CalculatorWorkspace {...props} />;
}
