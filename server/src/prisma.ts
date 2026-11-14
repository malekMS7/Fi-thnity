import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { env } from './config/index.js'
import { PrismaClient } from './generated/prisma/client.js'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// Évite de créer une instance à chaque hot-reload en développement (tsx watch).
export const prisma = global.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}