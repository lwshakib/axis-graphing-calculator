import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/sessions/[id]
 *
 * Retrieves a single session by its unique ID.
 * Note: This endpoint is currently public to allow users to share their mathematical
 * creations via link. Security relies on the UUID's unguessability.
 *
 * @param params Object containing the session UUID from the URL path.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const savedSession = await prisma.savedSession.findUnique({
      where: { id },
    });

    if (!savedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(savedSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 *
 * Destructive endpoint to remove a saved session.
 * Requires the user to be authenticated AND to be the original owner of the session.
 *
 * @param params Object containing the session UUID to delete.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    /**
     * Constraint: id AND userId
     * This prevents users from deleting sessions they don't own by just guessing IDs.
     */
    await prisma.savedSession.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
