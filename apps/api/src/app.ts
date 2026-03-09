import { HTTPException } from 'hono/http-exception'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { ZodError } from 'zod'

import { ApiErrorSchema } from '@docuflow/shared'

import { env } from './config/env.js'
import { documentRoutes } from './routes/documents.js'
import { healthRoutes } from './routes/health.js'
import { internalRoutes } from './routes/internal.js'
import { uploadRoutes } from './routes/uploads.js'

export const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: env.corsOrigin,
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.onError((error, c) => {
  const status =
    error instanceof HTTPException
      ? error.status
      : error instanceof ZodError
        ? 400
        : 500

  const payload = ApiErrorSchema.parse({
    error:
      error instanceof HTTPException
        ? error.message
        : error instanceof ZodError
          ? 'Validation failed.'
          : 'Internal Server Error',
    details:
      error instanceof ZodError
        ? error.flatten()
        : process.env.NODE_ENV === 'development'
          ? { cause: error.cause ?? null, message: error.message }
          : undefined,
  })

  return c.json(payload, status)
})

app.route('/', healthRoutes)
app.route('/', uploadRoutes)
app.route('/', documentRoutes)
app.route('/', internalRoutes)
