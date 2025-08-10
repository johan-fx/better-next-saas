import { c15tInstance } from "@c15t/backend";
import { drizzleAdapter } from "@c15t/backend/pkgs/db-adapters/adapters/drizzle-adapter";
import type { DB } from "better-auth/adapters/drizzle";
import * as schema from "@/lib/db/schema";
import { db } from "./db";
import { env } from "./env";
import { getTrustedOrigins } from "./server-utils";

export const instance = c15tInstance({
	appName: env.APP_NAME,
	basePath: "/api/c15t",
	database: drizzleAdapter(db as DB, { provider: "pg", schema: { ...schema } }),
	trustedOrigins: getTrustedOrigins(),
});
