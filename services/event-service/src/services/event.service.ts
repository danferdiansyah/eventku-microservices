import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { events } from "../db/schema";

export const EventService = {
  async getAllEvents() {
    return db.select().from(events);
  },

  async getEventById(id: string) {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0] || null;
  },

  async reserveSeats(eventId: string, quantity: number) {
    const result = await db
      .update(events)
      .set({
        availableSeats: sql`${events.availableSeats} - ${quantity}`,
      })
      .where(
        sql`${events.id} = ${eventId} AND ${events.availableSeats} >= ${quantity}`
      )
      .returning();

    return result[0] || null;
  },

  async releaseSeats(eventId: string, quantity: number) {
    const result = await db
      .update(events)
      .set({
        availableSeats: sql`LEAST(${events.availableSeats} + ${quantity}, ${events.totalSeats})`,
      })
      .where(eq(events.id, eventId))
      .returning();

    return result[0] || null;
  },
};
