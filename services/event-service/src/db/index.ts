import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://eventdb:eventdb@localhost:5433/eventdb";
const client = postgres(connectionString);
export const db = drizzle(client);
