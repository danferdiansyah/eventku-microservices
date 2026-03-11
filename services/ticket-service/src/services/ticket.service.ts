import { eq } from "drizzle-orm";
import { db } from "../db";
import { tickets } from "../db/schema";
import { publishEvent } from "./rabbitmq";

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || "http://localhost:3001";

interface BookTicketInput {
  eventId: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
}

export const TicketService = {
  async bookTicket(input: BookTicketInput) {
    // Fetch event details from event-service (sync HTTP)
    const eventRes = await fetch(`${EVENT_SERVICE_URL}/api/events/${input.eventId}`);
    if (!eventRes.ok) {
      throw new Error("Event tidak ditemukan");
    }
    const event = (await eventRes.json()) as any;

    // Reserve seats via event-service (sync HTTP)
    const reserveRes = await fetch(`${EVENT_SERVICE_URL}/api/events/${input.eventId}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: input.quantity }),
    });

    if (reserveRes.status === 409) {
      throw new Error("Kursi tidak tersedia untuk jumlah yang diminta");
    }
    if (!reserveRes.ok) {
      throw new Error("Gagal mereservasi kursi");
    }

    const totalPrice = (input.quantity * parseFloat(event.price)).toFixed(2);

    // Insert ticket
    let ticket;
    try {
      const [inserted] = await db
        .insert(tickets)
        .values({
          eventId: input.eventId,
          eventName: event.name,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          quantity: input.quantity,
          totalPrice,
        })
        .returning();
      ticket = inserted;
    } catch (dbErr) {
      // Compensating action: release seats if DB insert fails
      console.error("Ticket insert failed, releasing seats:", dbErr);
      await fetch(`${EVENT_SERVICE_URL}/api/events/${input.eventId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: input.quantity }),
      }).catch(() => {});
      throw new Error("Gagal membuat tiket");
    }

    // Publish ticket.booked event to RabbitMQ (async)
    await publishEvent("eventku.events", "ticket.booked", {
      ticketId: ticket.id,
      eventId: ticket.eventId,
      eventName: ticket.eventName,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      createdAt: ticket.createdAt,
    });

    return ticket;
  },

  async getAllTickets() {
    return db.select().from(tickets);
  },

  async getTicketById(id: string) {
    const result = await db.select().from(tickets).where(eq(tickets.id, id));
    return result[0] || null;
  },

  async cancelTicket(id: string) {
    const ticket = await this.getTicketById(id);
    if (!ticket) throw new Error("Tiket tidak ditemukan");
    if (ticket.status === "cancelled") throw new Error("Tiket sudah dibatalkan");

    const [updated] = await db
      .update(tickets)
      .set({ status: "cancelled" })
      .where(eq(tickets.id, id))
      .returning();

    // Release seats back via event-service
    await fetch(`${EVENT_SERVICE_URL}/api/events/${updated.eventId}/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: updated.quantity }),
    }).catch((err) => {
      console.error("Failed to release seats:", err);
    });

    // Publish ticket.cancelled event to RabbitMQ (async)
    await publishEvent("eventku.events", "ticket.cancelled", {
      ticketId: updated.id,
      eventId: updated.eventId,
      eventName: updated.eventName,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      quantity: updated.quantity,
    });

    return updated;
  },
};
