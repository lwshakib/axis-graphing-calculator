import { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Plotter | AXIS",
  description:
    "Visualize vectors and surfaces in a high-performance 3D coordinate system.",
};

export default function ThreeDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
