import type { PrismaClient } from "@prisma/client/extension"

declare global {
  var prisma: PrismaClient
}
