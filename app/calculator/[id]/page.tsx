import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalculatorWorkspaceWrapper } from "@/components/calculator-workspace-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedCalculatorPage({ params }: PageProps) {
  const { id } = await params;

  const savedSession = await prisma.savedSession.findUnique({
    where: { id },
  });

  if (!savedSession || savedSession.type !== "calculator") {
    return notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = savedSession.data as any;

  return (
    <CalculatorWorkspaceWrapper
      sessionId={id}
      initialData={{
        display: data.display,
        equation: data.equation,
        title: savedSession.title,
      }}
    />
  );
}
