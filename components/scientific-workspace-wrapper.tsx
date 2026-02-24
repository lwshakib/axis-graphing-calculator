"use client";

/**
 * SSR-safe wrapper for the ScientificWorkspace component.
 * MathLive and its custom elements interact with the DOM directly,
 * so this component must be hydrated exclusively on the client-side.
 */

import dynamic from "next/dynamic";

// Dynamically import the scientific workspace with SSR disabled
const ScientificWorkspace = dynamic(
  () => import("./scientific-workspace").then((mod) => mod.ScientificWorkspace),
  { ssr: false },
);

interface ScientificWorkspaceProps {
  initialData?: {
    variables: Record<string, string>;
    history: { input: string; output: string; timestamp: number }[];
    title: string;
  };
  sessionId?: string;
}

/**
 * Forwarding wrapper that ensures ScientificWorkspace is only client-rendered.
 */
export function ScientificWorkspaceWrapper(props: ScientificWorkspaceProps) {
  return <ScientificWorkspace {...props} />;
}
