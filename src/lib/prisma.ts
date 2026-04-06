import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getRequiredServerEnvironmentValue } from "@/config/env";

declare global {
  var __navagrahaPrisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = getRequiredServerEnvironmentValue("DATABASE_URL");

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (!globalThis.__navagrahaPrisma__) {
    globalThis.__navagrahaPrisma__ = createPrismaClient();
  }

  return globalThis.__navagrahaPrisma__;
}
