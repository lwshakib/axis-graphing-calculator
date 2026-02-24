import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Main Auth API Handler
 * 
 * Routes all incoming authentication-related requests (e.g., /api/auth/sign-in, 
 * /api/auth/session, /api/auth/sign-out) to the Better-Auth engine.
 * This file serves as the core bridge between Next.js routing and the auth library.
 */
export const { GET, POST } = toNextJsHandler(auth);
