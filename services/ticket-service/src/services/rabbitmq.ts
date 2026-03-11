import amqplib, { type Channel, type Connection } from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      connection = await amqplib.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.log(`RabbitMQ connection attempt ${i + 1}/${maxRetries} failed, retrying in 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after retries");
}

export async function publishEvent(exchange: string, routingKey: string, payload: object) {
  const ch = await getChannel();
  await ch.assertExchange(exchange, "topic", { durable: true });
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
  console.log(`Published event [${routingKey}]:`, payload);
}
