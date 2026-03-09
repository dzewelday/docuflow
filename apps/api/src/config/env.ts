import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

loadEnv({ path: fileURLToPath(new URL('../../../../.env', import.meta.url)) })

const EnvSchema = z.object({
  port: z.number().int().positive(),
  corsOrigin: z.string().min(1),
  apiBaseUrl: z.string().url(),
  maxUploadSizeBytes: z.number().int().positive(),
  allowedUploadMimeTypes: z.array(z.string().min(1)).min(1),
  uploadSigningSecret: z.string().min(16),
  internalEventToken: z.string().min(8),
  localStorageDir: z.string().min(1),
})

export const env = EnvSchema.parse({
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001',
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 10 * 1024 * 1024),
  allowedUploadMimeTypes: (process.env.ALLOWED_UPLOAD_MIME_TYPES ??
    'application/pdf,image/png,image/jpeg,text/plain')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  uploadSigningSecret: process.env.UPLOAD_SIGNING_SECRET ?? 'docuflow-local-signing-secret',
  internalEventToken: process.env.INTERNAL_EVENT_TOKEN ?? 'docuflow-internal-token',
  localStorageDir: process.env.LOCAL_STORAGE_DIR ?? '/tmp/docuflow-storage',
})
