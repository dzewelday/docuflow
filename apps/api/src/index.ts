import { config as loadEnv } from 'dotenv'
import { Prisma } from '@prisma/client'
import { serve } from '@hono/node-server'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { Hono } from 'hono'
import { fileURLToPath } from 'node:url'

import {
  ApiErrorSchema,
  DocumentStatusSchema,
  HelloResponseSchema,
  UploadResponseSchema,
} from '@docuflow/shared'

import { prisma } from './lib/prisma.js'

loadEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.onError((error, c) => {
  const status = error instanceof HTTPException ? error.status : 500

  const payload = ApiErrorSchema.parse({
    error: error instanceof HTTPException ? error.message : 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? { cause: error.cause ?? null } : undefined,
  })

  return c.json(payload, status)
})

app.get('/health', (c) => {
  const payload = HelloResponseSchema.parse({
    message: 'Hello from DocuFlow API',
  })

  return c.json(payload)
})

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const uploaded = Array.isArray(body.file) ? body.file[0] : body.file

  if (!(uploaded instanceof File)) {
    throw new HTTPException(400, {
      message: 'A multipart file field named "file" is required.',
    })
  }

  const documentRecord = await prisma.document.create({
    data: {
      filename: uploaded.name,
      status: DocumentStatusSchema.enum.PENDING,
      extractedData: Prisma.JsonNull,
    },
  })

  const payload = UploadResponseSchema.parse({
    document: {
      id: documentRecord.id,
      filename: documentRecord.filename,
      status: DocumentStatusSchema.parse(documentRecord.status),
      extractedData: documentRecord.extractedData,
      createdAt: documentRecord.createdAt.toISOString(),
    },
  })

  return c.json(payload, 201)
})

const port = Number(process.env.PORT ?? 3001)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`DocuFlow API listening on http://localhost:${info.port}`)
  },
)
