import { db } from "./index";
import { events } from "./schema";

const seedData = [
  {
    name: "Jakarta Music Festival 2026",
    description: "Festival musik tahunan terbesar di Jakarta dengan line-up artis lokal dan internasional.",
    venue: "Gelora Bung Karno, Jakarta",
    eventDate: new Date("2026-04-20T18:00:00"),
    price: "350000.00",
    totalSeats: 500,
    availableSeats: 500,
  },
  {
    name: "Tech Conference Indonesia",
    description: "Konferensi teknologi dengan pembicara dari Google, Meta, dan startup unicorn Indonesia.",
    venue: "ICE BSD, Tangerang",
    eventDate: new Date("2026-05-10T09:00:00"),
    price: "150000.00",
    totalSeats: 300,
    availableSeats: 300,
  },
  {
    name: "Stand-Up Comedy Night",
    description: "Malam komedi spesial bersama komika-komika terbaik Indonesia.",
    venue: "Balai Kartini, Jakarta",
    eventDate: new Date("2026-04-05T19:30:00"),
    price: "100000.00",
    totalSeats: 200,
    availableSeats: 200,
  },
  {
    name: "Workshop UI/UX Design",
    description: "Workshop intensif sehari penuh belajar Figma dan prinsip desain modern.",
    venue: "GoWork Coworking, Jakarta Selatan",
    eventDate: new Date("2026-05-25T10:00:00"),
    price: "250000.00",
    totalSeats: 50,
    availableSeats: 50,
  },
  {
    name: "Film Screening: Indie Indonesia",
    description: "Pemutaran film-film indie terbaik karya sineas muda Indonesia.",
    venue: "CGV Grand Indonesia, Jakarta",
    eventDate: new Date("2026-06-01T14:00:00"),
    price: "75000.00",
    totalSeats: 150,
    availableSeats: 150,
  },
];

async function seed() {
  console.log("Seeding event database...");

  const existing = await db.select().from(events);
  if (existing.length > 0) {
    console.log(`Events already has ${existing.length} records, skipping seed.`);
    process.exit(0);
  }

  await db.insert(events).values(seedData);
  console.log("Event seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
