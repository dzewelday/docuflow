import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

loadEnv({ path: fileURLToPath(new URL('../../../../.env', import.meta.url)) })

const EnvSchema = z.object({
  databaseUrl: z
    .string()
    .min(1)
    .refine((value) => value.startsWith('file:/'), {
      message: 'DATABASE_URL must be an absolute SQLite file URL like file:/tmp/docuflow/docuflow.db.',
    }),
  apiBaseUrl: z.string().url(),
  internalEventToken: z.string().min(8),
  localStorageDir: z.string().min(1),
  pollIntervalMs: z.number().int().positive(),
})

export const env = EnvSchema.parse({
  databaseUrl: process.env.DATABASE_URL ?? '',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001',
  internalEventToken: process.env.INTERNAL_EVENT_TOKEN ?? 'docuflow-internal-token',
  localStorageDir: process.env.LOCAL_STORAGE_DIR ?? '/tmp/docuflow-storage',
  pollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS ?? 2000),
})
