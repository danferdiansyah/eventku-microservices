import { pgTable, uuid, varchar, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  venue: varchar("venue", { length: 255 }).notNull(),
  eventDate: timestamp("event_date").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
