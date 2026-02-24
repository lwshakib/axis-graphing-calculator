import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ThreeDWorkspace } from "@/components/three-d-workspace";

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

  const data = savedSession.data as any;

  return (
    <ThreeDWorkspace
      sessionId={id}
      initialData={{
        vectors: data.vectors,
        surfaces: data.surfaces,
        title: savedSession.title,
      }}
    />
  );
}
