import { HTTPException } from 'hono/http-exception'
import { Hono } from 'hono'

import {
  UploadCompleteRequestSchema,
  UploadCompleteResponseSchema,
  UploadInitiateRequestSchema,
  UploadInitiateResponseSchema,
} from '@docuflow/shared'

import { getDocumentOrThrow, completeUpload, createPendingUpload } from '../services/documents/service.js'
import { storageProvider } from '../services/storage/index.js'

export const uploadRoutes = new Hono()

uploadRoutes.post('/uploads/initiate', async (c) => {
  const payload = UploadInitiateRequestSchema.parse(await c.req.json())
  const response = await createPendingUpload(payload)
  return c.json(UploadInitiateResponseSchema.parse(response), 201)
})

uploadRoutes.put('/storage/upload/:documentId', async (c) => {
  const documentId = c.req.param('documentId')
  const documentRecord = await getDocumentOrThrow(documentId)
  const key = c.req.query('key')
  const mimeType = c.req.query('mimeType')
  const expiresAt = c.req.query('expiresAt')
  const signature = c.req.query('signature')
  const sizeBytes = Number(c.req.query('sizeBytes'))

  if (!key || !mimeType || !expiresAt || !signature || !Number.isFinite(sizeBytes)) {
    throw new HTTPException(400, {
      message: 'Signed upload parameters are incomplete.',
    })
  }

  if (documentRecord.storageKey !== key) {
    throw new HTTPException(400, {
      message: 'Upload target does not match the requested document.',
    })
  }

  storageProvider.validateSignedUpload({
    documentId,
    objectKey: key,
    mimeType,
    sizeBytes,
    expiresAt,
    signature,
  })

  if (documentRecord.status !== 'PENDING_UPLOAD') {
    throw new HTTPException(409, {
      message: 'This upload target can no longer accept data.',
    })
  }

  const contentType = c.req.header('content-type')
  if (contentType !== mimeType) {
    throw new HTTPException(400, {
      message: 'Content-Type does not match the initiated upload.',
    })
  }

  const buffer = Buffer.from(await c.req.arrayBuffer())
  if (buffer.byteLength !== sizeBytes) {
    throw new HTTPException(400, {
      message: 'Uploaded payload size does not match the initiated metadata.',
    })
  }

  await storageProvider.writeObject(key, buffer)

  return c.body(null, 204)
})

uploadRoutes.post('/uploads/:documentId/complete', async (c) => {
  const documentId = c.req.param('documentId')
  const payload = await c.req.json().catch(() => ({}))
  UploadCompleteRequestSchema.parse(payload)

  const document = await completeUpload(documentId)

  return c.json(
    UploadCompleteResponseSchema.parse({
      document,
    }),
  )
})
