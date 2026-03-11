import amqplib from "amqplib";
import { db } from "./db";
import { notifications } from "./db/schema";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = "eventku.events";
const QUEUE_BOOKED = "notification.ticket.booked";
const QUEUE_CANCELLED = "notification.ticket.cancelled";

async function startConsumer() {
  let connection;
  const maxRetries = 10;

  for (let i = 0; i < maxRetries; i++) {
    try {
      connection = await amqplib.connect(RABBITMQ_URL);
      break;
    } catch (err) {
      console.log(`RabbitMQ connection attempt ${i + 1}/${maxRetries} failed, retrying in 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!connection) {
    throw new Error("Failed to connect to RabbitMQ after retries");
  }

  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  await channel.assertQueue(QUEUE_BOOKED, { durable: true });
  await channel.bindQueue(QUEUE_BOOKED, EXCHANGE, "ticket.booked");

  await channel.assertQueue(QUEUE_CANCELLED, { durable: true });
  await channel.bindQueue(QUEUE_CANCELLED, EXCHANGE, "ticket.cancelled");

  console.log(`Notification service listening on queues: ${QUEUE_BOOKED}, ${QUEUE_CANCELLED}`);

  // Handle ticket.booked
  channel.consume(QUEUE_BOOKED, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log("Received ticket.booked event:", event);

      await db.insert(notifications).values({
        ticketId: event.ticketId,
        type: "ticket_booked",
        recipient: event.customerEmail,
        message: `Halo ${event.customerName}, tiket Anda untuk "${event.eventName}" (${event.quantity} kursi) telah dikonfirmasi. Total: Rp ${Number(event.totalPrice).toLocaleString("id-ID")}. Terima kasih!`,
      });

      console.log(`Notification saved for ticket ${event.ticketId}`);
      channel.ack(msg);
    } catch (err) {
      console.error("Error processing ticket.booked message:", err);
      channel.nack(msg, false, true);
    }
  });

  // Handle ticket.cancelled
  channel.consume(QUEUE_CANCELLED, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log("Received ticket.cancelled event:", event);

      await db.insert(notifications).values({
        ticketId: event.ticketId,
        type: "ticket_cancelled",
        recipient: event.customerEmail,
        message: `Halo ${event.customerName}, tiket Anda untuk "${event.eventName}" (${event.quantity} kursi) telah dibatalkan. Kursi telah dikembalikan.`,
      });

      console.log(`Cancellation notification saved for ticket ${event.ticketId}`);
      channel.ack(msg);
    } catch (err) {
      console.error("Error processing ticket.cancelled message:", err);
      channel.nack(msg, false, true);
    }
  });
}

startConsumer().catch((err) => {
  console.error("Notification service failed to start:", err);
  process.exit(1);
});
