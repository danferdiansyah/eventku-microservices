import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});
