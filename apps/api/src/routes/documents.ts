import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'

import { DocumentStatusEventSchema } from '@docuflow/shared'

import { createDocumentEvent, toDocumentSummary } from '../lib/document-mappers.js'
import { documentEventBus } from '../lib/event-bus.js'
import { getDocumentOrThrow, getDocumentResponse, listRecentDocuments } from '../services/documents/service.js'

export const documentRoutes = new Hono()

documentRoutes.get('/documents', async (c) => {
  const limit = Number(c.req.query('limit') ?? 8)
  return c.json(await listRecentDocuments(Number.isFinite(limit) ? limit : 8))
})

documentRoutes.get('/documents/:documentId', async (c) => {
  return c.json(await getDocumentResponse(c.req.param('documentId')))
})

documentRoutes.get('/documents/:documentId/events', async (c) => {
  const documentId = c.req.param('documentId')
  const documentRecord = await getDocumentOrThrow(documentId)
  const initialEvent = DocumentStatusEventSchema.parse(
    createDocumentEvent('snapshot', toDocumentSummary(documentRecord), 'Initial snapshot'),
  )

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: initialEvent.type,
      data: JSON.stringify(initialEvent),
    })

    const unsubscribe = documentEventBus.subscribe(documentId, (event) => {
      void stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event),
      })
    })

    const heartbeat = setInterval(() => {
      const event = DocumentStatusEventSchema.parse(
        createDocumentEvent('heartbeat', initialEvent.document, 'keepalive'),
      )
      void stream.writeSSE({
        event: event.type,
        data: JSON.stringify(event),
      })
    }, 15_000)

    await new Promise<void>((resolve) => {
      c.req.raw.signal.addEventListener(
        'abort',
        () => {
          resolve()
        },
        { once: true },
      )
    })

    clearInterval(heartbeat)
    unsubscribe()
  })
})
