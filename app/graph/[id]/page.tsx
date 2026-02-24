import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { GraphWorkspaceWrapper } from "@/components/graph-workspace-wrapper";

/**
 * SavedGraphPage: Dynamic route for loading a specific graphing session.
 * Fetches session data from the database using Prisma and hydrates
 * the GraphWorkspace with the saved state (equations, viewport, title).
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedGraphPage({ params }: PageProps) {
  const { id } = await params;

  // Retrieve the session by its unique ID
  const savedSession = await prisma.savedSession.findUnique({
    where: { id },
  });

  // Verify session exists and is of the correct type (graph)
  if (!savedSession || savedSession.type !== "graph") {
    return notFound();
  }

  // Parse the JSON data stored in the database.
  // The data structure contains { equations, viewport }.
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
