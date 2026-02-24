import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CalculatorWorkspace } from "@/components/calculator-workspace";

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

  const data = savedSession.data as any;

  return (
    <CalculatorWorkspace
      sessionId={id}
      initialData={{
        display: data.display,
        equation: data.equation,
        title: savedSession.title,
      }}
    />
  );
}
