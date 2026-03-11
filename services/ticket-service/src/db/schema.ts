import { pgTable, pgEnum, uuid, varchar, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const ticketStatusEnum = pgEnum("ticket_status", [
  "confirmed",
  "cancelled",
]);

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  status: ticketStatusEnum("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
