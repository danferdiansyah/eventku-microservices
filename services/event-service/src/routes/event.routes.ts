import { Elysia, t } from "elysia";
import { EventService } from "../services/event.service";

export const eventRoutes = new Elysia({ prefix: "/api/events" })
  .get("/", async () => {
    return EventService.getAllEvents();
  })
  .get("/:id", async ({ params, set }) => {
    const event = await EventService.getEventById(params.id);
    if (!event) {
      set.status = 404;
      return { error: "Event not found" };
    }
    return event;
  }, {
    params: t.Object({
      id: t.String({ format: "uuid" }),
    }),
  })
  .post("/:id/reserve", async ({ params, body, set }) => {
    const result = await EventService.reserveSeats(params.id, body.quantity);
    if (!result) {
      set.status = 409;
      return { error: "Kursi tidak tersedia atau jumlah melebihi stok" };
    }
    return { message: "Seats reserved", event: result };
  }, {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
    body: t.Object({ quantity: t.Number({ minimum: 1 }) }),
  })
  .post("/:id/release", async ({ params, body, set }) => {
    const result = await EventService.releaseSeats(params.id, body.quantity);
    if (!result) {
      set.status = 404;
      return { error: "Event not found" };
    }
    return { message: "Seats released", event: result };
  }, {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
    body: t.Object({ quantity: t.Number({ minimum: 1 }) }),
  });
