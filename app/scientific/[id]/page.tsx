import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ScientificWorkspace } from "@/components/scientific-workspace";

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

  const data = savedSession.data as any;

  return (
    <ScientificWorkspace
      sessionId={id}
      initialData={{
        variables: data.variables,
        history: data.history,
        title: savedSession.title,
      }}
    />
  );
}
