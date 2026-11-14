import { PrismaPg } from '@prisma/adapter-pg'
import { env } from './config/index.js'
import { PrismaClient } from './generated/prisma/client.js'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma 7 : le client se connecte via un « driver adapter » (ici PostgreSQL).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

// Évite de créer une instance à chaque hot-reload en développement (tsx watch).
export const prisma = global.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
