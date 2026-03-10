import { config as loadEnv } from 'dotenv'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

loadEnv({ path: fileURLToPath(new URL('../../../../.env', import.meta.url)) })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured.')
}

if (!connectionString.startsWith('file:/')) {
  throw new Error('DATABASE_URL must be an absolute SQLite file URL like file:/tmp/docuflow/docuflow.db.')
}

const databasePath = fileURLToPath(new URL(connectionString))
const adapter = new PrismaBetterSqlite3({ url: databasePath })

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
