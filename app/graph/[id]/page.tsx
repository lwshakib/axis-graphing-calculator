import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { GraphWorkspaceWrapper } from "@/components/graph-workspace-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedGraphPage({ params }: PageProps) {
  const { id } = await params;

  const savedSession = await prisma.savedSession.findUnique({
    where: { id },
  });

  if (!savedSession || savedSession.type !== "graph") {
    return notFound();
  }

  // Type safe parsing of data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = savedSession.data as any;

  return (
    <GraphWorkspaceWrapper
      sessionId={id}
      initialData={{
        equations: data.equations,
        viewport: data.viewport,
        title: savedSession.title,
      }}
    />
  );
}
