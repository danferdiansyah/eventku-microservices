import { Elysia, t } from "elysia";
import { TicketService } from "../services/ticket.service";

export const ticketRoutes = new Elysia({ prefix: "/api/tickets" })
  .post("/", async ({ body, set }) => {
    try {
      const ticket = await TicketService.bookTicket(body);
      set.status = 201;
      return ticket;
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, {
    body: t.Object({
      eventId: t.String({ format: "uuid" }),
      customerName: t.String(),
      customerEmail: t.String({ format: "email" }),
      quantity: t.Number({ minimum: 1 }),
    }),
  })
  .get("/", async () => {
    return TicketService.getAllTickets();
  })
  .get("/:id", async ({ params, set }) => {
    const ticket = await TicketService.getTicketById(params.id);
    if (!ticket) {
      set.status = 404;
      return { error: "Ticket not found" };
    }
    return ticket;
  }, {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
  })
  .patch("/:id/cancel", async ({ params, set }) => {
    try {
      const ticket = await TicketService.cancelTicket(params.id);
      return ticket;
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
  });
