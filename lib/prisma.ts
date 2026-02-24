// Load environment variables from .env file
import "dotenv/config";
// Import the PostgreSQL adapter for Prisma
import { PrismaPg } from "@prisma/adapter-pg";
// Import the generated Prisma Client
import { PrismaClient } from "@/generated/prisma/client";

// Retrieve the database connection string from environment variables
const connectionString = `${process.env.DATABASE_URL}`;

/**
 * Initialize the Prisma Client with the PostgreSQL adapter.
 * We use a global variable to prevent multiple instances of Prisma Client from being created
 * during development (Hot Module Replacement), which would exhaust database connections.
 */
const adapter = new PrismaPg({ connectionString });
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use existing global instance if available, otherwise create a new one
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// In development mode, save the instance to the global object
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export the singleton Prisma instance
export default prisma;
