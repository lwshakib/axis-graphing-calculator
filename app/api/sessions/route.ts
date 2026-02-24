import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * POST /api/sessions
 *
 * An idempotent endpoint for persisting mathematical workspaces.
 * Supports both creating new sessions and updating existing ones based on the presence of an 'id'.
 *
 * Request Body:
 * - id: Optional UUID (if provided, triggers an update)
 * - type: 'graph' | 'calculator' | 'scientific' | '3d'
 * - title: Display name for the session
 * - data: JSON payload representing the workspace state
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, type, title, data } = await req.json();

  if (!type || !data) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    if (id) {
      /**
       * Update Logic:
       * Ensures the user owns the record before allowing mutation (RBAC).
       */
      const updated = await prisma.savedSession.update({
        where: { id, userId: session.user.id },
        data: {
          title: title || "Untitled",
          data,
        },
      });
      return NextResponse.json(updated);
    } else {
      /**
       * Initialization Logic:
       * Creates a new persistent record linked to the authenticated user.
       */
      const created = await prisma.savedSession.create({
        data: {
          userId: session.user.id,
          type,
          title: title || "Untitled",
          data,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/sessions
 *
 * Multi-purpose retrieval endpoint.
 * Returns a list of sessions owned by the authenticated user,
 * optionally filtered by workspace type.
 *
 * Query Parameters:
 * - type (Optional): Filter by 'graph', 'calculator', etc.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const sessions = await prisma.savedSession.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
      },
      orderBy: { updatedAt: "desc" }, // Most recent first
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}
