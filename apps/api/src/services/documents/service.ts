import { Prisma } from '@prisma/client'
import { HTTPException } from 'hono/http-exception'

import {
  DocumentListResponseSchema,
  DocumentStatusEventSchema,
  DocumentSummarySchema,
  GetDocumentResponseSchema,
  type DocumentStatusEvent,
  type UploadInitiateRequest,
} from '@docuflow/shared'

import { env } from '../../config/env.js'
import { createDocumentEvent, toDocument, toDocumentSummary } from '../../lib/document-mappers.js'
import { documentEventBus } from '../../lib/event-bus.js'
import { prisma } from '../../lib/prisma.js'
import { storageProvider } from '../storage/index.js'

export function validateUploadMetadata(input: UploadInitiateRequest) {
  if (!env.allowedUploadMimeTypes.includes(input.mimeType)) {
    throw new HTTPException(400, {
      message: `Unsupported file type: ${input.mimeType}`,
    })
  }

  if (input.sizeBytes > env.maxUploadSizeBytes) {
    throw new HTTPException(400, {
      message: `File exceeds the ${env.maxUploadSizeBytes}-byte upload limit.`,
    })
  }
}

export async function createPendingUpload(input: UploadInitiateRequest) {
  validateUploadMetadata(input)

  const objectKey = storageProvider.createObjectKey(crypto.randomUUID(), input.filename)
  const documentRecord = await prisma.document.create({
    data: {
      filename: input.filename,
      status: 'PENDING_UPLOAD',
      storageProvider: 'LOCAL',
      storageKey: objectKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      extractedData: Prisma.JsonNull,
      extractedText: null,
    },
  })

  const upload = await storageProvider.createUploadTarget({
    documentId: documentRecord.id,
    filename: documentRecord.filename,
    mimeType: documentRecord.mimeType,
    sizeBytes: documentRecord.sizeBytes,
    objectKey: documentRecord.storageKey,
  })

  return {
    document: DocumentSummarySchema.parse(toDocumentSummary(documentRecord)),
    upload,
  }
}

export async function getDocumentOrThrow(documentId: string) {
  const documentRecord = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!documentRecord) {
    throw new HTTPException(404, {
      message: 'Document not found.',
    })
  }

  return documentRecord
}

export async function getDocumentResponse(documentId: string) {
  const documentRecord = await getDocumentOrThrow(documentId)
  return GetDocumentResponseSchema.parse({
    document: toDocument(documentRecord),
  })
}

export async function listRecentDocuments(limit = 8) {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return DocumentListResponseSchema.parse({
    documents: documents.map((documentRecord) => toDocumentSummary(documentRecord)),
  })
}

export async function completeUpload(documentId: string) {
  const documentRecord = await getDocumentOrThrow(documentId)

  if (documentRecord.status !== 'PENDING_UPLOAD') {
    return DocumentSummarySchema.parse(toDocumentSummary(documentRecord))
  }

  const fileExists = await storageProvider.objectExists(documentRecord.storageKey)
  if (!fileExists) {
    throw new HTTPException(400, {
      message: 'The file has not been uploaded yet.',
    })
  }

  const storedSize = await storageProvider.getObjectSize(documentRecord.storageKey)
  if (storedSize !== documentRecord.sizeBytes) {
    throw new HTTPException(400, {
      message: 'Uploaded file size does not match the initiated metadata.',
    })
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'UPLOADED',
      uploadedAt: new Date(),
      errorMessage: null,
    },
  })

  const summary = DocumentSummarySchema.parse(toDocumentSummary(updated))
  publishDocumentEvent(createDocumentEvent('status_changed', summary, 'Upload completed'))

  return summary
}

export function publishDocumentEvent(event: DocumentStatusEvent) {
  documentEventBus.publish(DocumentStatusEventSchema.parse(event))
}
