"use client";

import dynamic from "next/dynamic";

const ScientificWorkspace = dynamic(
  () => import("./scientific-workspace").then((mod) => mod.ScientificWorkspace),
  { ssr: false },
);

interface ScientificWorkspaceProps {
  initialData?: {
    variables: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    history: { expr: string; res: any }[];
    title: string;
  };
  sessionId?: string;
}

export function ScientificWorkspaceWrapper(props: ScientificWorkspaceProps) {
  return <ScientificWorkspace {...props} />;
}
