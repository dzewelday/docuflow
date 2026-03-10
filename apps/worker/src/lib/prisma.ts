import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

import { env } from '../config/env.js'

const databasePath = fileURLToPath(new URL(env.databaseUrl))
const adapter = new PrismaBetterSqlite3({ url: databasePath })

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
