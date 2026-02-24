"use client";

import dynamic from "next/dynamic";

const ThreeDWorkspace = dynamic(
  () => import("./three-d-workspace").then((mod) => mod.ThreeDWorkspace),
  { ssr: false },
);

interface ThreeDWorkspaceProps {
  initialData?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vectors: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    surfaces: any[];
    title: string;
  };
  sessionId?: string;
}

export function ThreeDWorkspaceWrapper(props: ThreeDWorkspaceProps) {
  return <ThreeDWorkspace {...props} />;
}
