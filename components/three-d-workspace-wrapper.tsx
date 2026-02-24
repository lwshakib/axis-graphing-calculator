"use client";

/**
 * SSR-safe wrapper for the ThreeDWorkspace component.
 * Three.js and WebGL require the 'window' and 'document' objects,
 * so this component must only be loaded and executed in the browser.
 */

import dynamic from "next/dynamic";

// Dynamically import the 3D workspace with SSR disabled
const ThreeDWorkspace = dynamic(
  () => import("./three-d-workspace").then((mod) => mod.ThreeDWorkspace),
  { ssr: false },
);

interface Vector3D {
  id: string;
  x: string;
  y: string;
  z: string;
  color: string;
  visible: boolean;
  label: string;
}

interface Surface3D {
  id: string;
  equation: string;
  color: string;
  visible: boolean;
}

interface ThreeDWorkspaceProps {
  initialData?: {
    vectors: Vector3D[];
    surfaces: Surface3D[];
    title: string;
  };
  sessionId?: string;
}

/**
 * Forwarding wrapper that ensures ThreeDWorkspace is only client-rendered.
 */
export function ThreeDWorkspaceWrapper(props: ThreeDWorkspaceProps) {
  return <ThreeDWorkspace {...props} />;
}
