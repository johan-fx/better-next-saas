import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL ?? "";

// Create database connection
export const db = drizzleHttp(neon(dbUrl), { schema });
export const dbPg = drizzlePg(dbUrl, { schema });
