// Import the React-specific client creator from Better-Auth
import { createAuthClient } from "better-auth/react";

/**
 * The authClient instance manages individual client-side authentication states.
 * It provides hooks and methods to interact with the server-side Better-Auth session.
 */
export const authClient = createAuthClient({
  /**
   * The base URL of the authentication server.
   * On the client, this is used to reach the API routes (e.g., /api/auth).
   * Defaults to localhost:3000 if the environment variable isn't set.
   */
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

/**
 * Destructure and export frequently used methods and hooks for easier access
 * throughout the React application.
 */
export const {
  useSession, // Hook to get the current user and session status
  signIn, // Method to initiate sign-in (email/password or social)
  signUp, // Method to create a new user account
  signOut, // Method to terminate the current session
  updateUser, // Method to update user profile information
  listSessions, // Method to retrieve all active sessions for the current user
  revokeSession, // Method to invalidate a specific session by ID
} = authClient;
