import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env files or .env.local files
dotenv.config({ path: ".env.local" });

/**
 * Drizzle Configuration
 *
 * This configuration enables:
 * - Database migrations
 * - Schema management
 * - Database introspection
 * - SQL generation
 */
export default defineConfig({
	// Database schema location
	schema: "./src/lib/db/schema.ts",

	// Database connection
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},

	// Database dialect
	dialect: "postgresql",

	// Migration settings
	migrations: {
		prefix: "timestamp",
		table: "__drizzle_migrations__",
		schema: "public",
	},

	// Output directory for migrations
	out: "./src/lib/db/migrations",

	// Enable verbose logging
	verbose: true,

	// Enable strict mode for better type safety
	strict: true,
});
