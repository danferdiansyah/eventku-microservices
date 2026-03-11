import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { eventRoutes } from "./routes/event.routes";

const app = new Elysia()
  .use(cors())
  .use(eventRoutes)
  .get("/health", () => ({ status: "ok", service: "event-service" }))
  .listen(3001);

console.log("Event service running on http://localhost:3001");
