"use client";

/**
 * SSR-safe wrapper for GraphWorkspace.
 * The canvas-based graph component uses browser APIs (Canvas, window)
 * that aren't available during server-side rendering. This wrapper uses
 * Next.js `dynamic()` with `ssr: false` to ensure the component is only
 * loaded and rendered on the client.
 */

import dynamic from "next/dynamic";

// Dynamically import GraphWorkspace, disabling SSR
const GraphWorkspace = dynamic(
  () => import("./graph-workspace").then((mod) => mod.GraphWorkspace),
  { ssr: false },
);

interface Equation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface GraphWorkspaceProps {
  initialData?: {
    equations: Equation[];
    viewport: { x: number; y: number; zoom: number };
    title: string;
  };
  sessionId?: string;
}

/** Thin forwarding wrapper that passes all props to the dynamically loaded component. */
export function GraphWorkspaceWrapper(props: GraphWorkspaceProps) {
  return <GraphWorkspace {...props} />;
}
