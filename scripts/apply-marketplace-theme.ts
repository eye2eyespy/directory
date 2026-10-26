import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows: Record<string, string> = {
  theme: "marketplace",
  paperColor: "#FFFFFF",
  paper2Color: "#F4F6F5",
  inkColor: "#1A1D21",
  inkSoftColor: "#5C6570",
  primaryColor: "#2F8F3A",
  secondaryColor: "#1F3A2E",
  accentColor: "#F5C518",
};

async function main() {
  for (const [key, value] of Object.entries(rows)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("Marketplace theme applied");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
