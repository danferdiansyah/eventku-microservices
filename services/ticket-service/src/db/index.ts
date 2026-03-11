import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://ticketdb:ticketdb@localhost:5434/ticketdb";
const client = postgres(connectionString);
export const db = drizzle(client);
