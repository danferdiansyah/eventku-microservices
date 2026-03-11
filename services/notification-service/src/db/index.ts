import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://notifdb:notifdb@localhost:5435/notifdb";
const client = postgres(connectionString);
export const db = drizzle(client);
