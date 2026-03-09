import { HTTPException } from 'hono/http-exception'
import { Hono } from 'hono'

import { DocumentStatusEventSchema } from '@docuflow/shared'

import { env } from '../config/env.js'
import { publishDocumentEvent } from '../services/documents/service.js'

export const internalRoutes = new Hono()

internalRoutes.post('/internal/documents/:documentId/events', async (c) => {
  const token = c.req.header('x-docuflow-internal-token')

  if (token !== env.internalEventToken) {
    throw new HTTPException(401, {
      message: 'Unauthorized internal event publish attempt.',
    })
  }

  const event = DocumentStatusEventSchema.parse(await c.req.json())
  publishDocumentEvent(event)

  return c.json({ ok: true })
})
