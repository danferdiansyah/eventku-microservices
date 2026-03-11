import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { ticketRoutes } from "./routes/ticket.routes";

const app = new Elysia()
  .use(cors())
  .use(ticketRoutes)
  .get("/health", () => ({ status: "ok", service: "ticket-service" }))
  .listen(3002);

console.log("Ticket service running on http://localhost:3002");
