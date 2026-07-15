import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const users: { name: string; email: string; role: Role }[] = [
    { name: "Vibha Admin", email: "vibha@tasktracker.dev", role: Role.ADMIN },
    { name: "Neha Manager", email: "neha@tasktracker.dev", role: Role.MANAGER },
    { name: "Meghna Member", email: "meghna@tasktracker.dev", role: Role.MEMBER },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
  }

  console.log("Seeded users (all share the password: %s)", password);
  users.forEach((u) => console.log(` - ${u.role}: ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
