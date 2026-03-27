import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cowork.com" },
    update: {},
    create: {
      email: "admin@cowork.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "John Doe",
      role: "USER",
    },
  });

  // Create spaces
  const spaces = await Promise.all([
    prisma.space.create({
      data: {
        name: "Desk A1",
        type: "DESK",
        capacity: 1,
        pricePerHour: 10.0,
        amenities: ["WiFi", "Power Outlet", "Ergonomic Chair"],
      },
    }),
    prisma.space.create({
      data: {
        name: "Desk A2",
        type: "DESK",
        capacity: 1,
        pricePerHour: 10.0,
        amenities: ["WiFi", "Power Outlet"],
      },
    }),
    prisma.space.create({
      data: {
        name: "Private Pod B1",
        type: "PRIVATE_POD",
        capacity: 4,
        pricePerHour: 25.0,
        amenities: ["WiFi", "Whiteboard", "Monitor", "Conference Phone"],
      },
    }),
    prisma.space.create({
      data: {
        name: "Private Pod B2",
        type: "PRIVATE_POD",
        capacity: 6,
        pricePerHour: 35.0,
        amenities: ["WiFi", "Whiteboard", "Dual Monitors", "Projector"],
      },
    }),
  ]);

  console.log("Seeded:", { admin: admin.email, user: user.email, spaces: spaces.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
