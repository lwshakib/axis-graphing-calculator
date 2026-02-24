import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ThreeDWorkspaceWrapper } from "@/components/three-d-workspace-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedThreeDPage({ params }: PageProps) {
  const { id } = await params;

  const savedSession = await prisma.savedSession.findUnique({
    where: { id },
  });

  if (!savedSession || savedSession.type !== "3d") {
    return notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = savedSession.data as any;

  return (
    <ThreeDWorkspaceWrapper
      sessionId={id}
      initialData={{
        vectors: data.vectors,
        surfaces: data.surfaces,
        title: savedSession.title,
      }}
    />
  );
}
