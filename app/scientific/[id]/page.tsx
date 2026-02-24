import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ScientificWorkspaceWrapper } from "@/components/scientific-workspace-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedScientificPage({ params }: PageProps) {
  const { id } = await params;

  const savedSession = await prisma.savedSession.findUnique({
    where: { id },
  });

  if (!savedSession || savedSession.type !== "scientific") {
    return notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = savedSession.data as any;

  return (
    <ScientificWorkspaceWrapper
      sessionId={id}
      initialData={{
        variables: data.variables,
        history: data.history,
        title: savedSession.title,
      }}
    />
  );
}
