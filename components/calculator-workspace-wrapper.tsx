"use client";

/**
 * SSR-safe wrapper for the CalculatorWorkspace component.
 * Ensures the calculator logic and UI are only initialized on the client-side.
 */

import dynamic from "next/dynamic";

// Dynamically import the CalculatorWorkspace to avoid SSR issues
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

/** 
 * Wrapper component that provides the client-side only 
 * CalculatorWorkspace instance. 
 */
export function CalculatorWorkspaceWrapper(props: CalculatorWorkspaceProps) {
  return <CalculatorWorkspace {...props} />;
}
