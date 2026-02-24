"use client";

import dynamic from "next/dynamic";

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

export function GraphWorkspaceWrapper(props: GraphWorkspaceProps) {
  return <GraphWorkspace {...props} />;
}
