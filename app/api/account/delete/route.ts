import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * DELETE /api/account/delete
 * 
 * The "Nuclear Option" of account management.
 * Permanently removes the authenticated user's profile and all associated data.
 * 
 * Logic:
 * 1. Checks for a valid session.
 * 2. Deletes the 'User' record from the database.
 * 3. Rely on Database-level Cascades: The Prisma schema is configured to 
 *    automatically remove all 'SavedSession', 'Account', and 'Session' records 
 *    linked to this User ID.
 */
export async function DELETE() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Execute the destructive deletion
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Internal persistence error." },
      { status: 500 },
    );
  }
}
