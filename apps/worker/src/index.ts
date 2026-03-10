import { Prisma } from '@prisma/client'

import { DocumentSummarySchema } from '@docuflow/shared'

import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { extractDocument } from './services/extraction.js'
import { publishDocumentEvent } from './services/events.js'
import { readStoredObject } from './services/storage.js'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function claimNextDocument() {
  while (true) {
    const nextDocument = await prisma.document.findFirst({
      where: { status: 'UPLOADED' },
      orderBy: [{ uploadedAt: 'asc' }, { createdAt: 'asc' }],
    })

    if (!nextDocument) {
      return null
    }

    const claimedAt = new Date()
    const result = await prisma.document.updateMany({
      where: {
        id: nextDocument.id,
        status: 'UPLOADED',
      },
      data: {
        status: 'PROCESSING',
        processingStartedAt: claimedAt,
        errorMessage: null,
      },
    })

    if (result.count !== 1) {
      continue
    }

    return prisma.document.findUnique({
      where: { id: nextDocument.id },
    })
  }
}

async function emitCurrentState(documentId: string, message: string | null = null) {
  const documentRecord = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!documentRecord) {
    return
  }

  const summary = DocumentSummarySchema.parse({
    id: documentRecord.id,
    filename: documentRecord.filename,
    status: documentRecord.status,
    storageProvider: documentRecord.storageProvider.toLowerCase(),
    storageKey: documentRecord.storageKey,
    mimeType: documentRecord.mimeType,
    sizeBytes: documentRecord.sizeBytes,
    uploadedAt: documentRecord.uploadedAt?.toISOString() ?? null,
    processingStartedAt: documentRecord.processingStartedAt?.toISOString() ?? null,
    completedAt: documentRecord.completedAt?.toISOString() ?? null,
    errorMessage: documentRecord.errorMessage,
    createdAt: documentRecord.createdAt.toISOString(),
    updatedAt: documentRecord.updatedAt.toISOString(),
  })

  await publishDocumentEvent(documentId, {
    type: 'status_changed',
    document: summary,
    at: new Date().toISOString(),
    message,
  })
}

async function processDocument(documentId: string) {
  const documentRecord = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!documentRecord) {
    return
  }

  await emitCurrentState(documentId, 'Processing started')

  try {
    const buffer = await readStoredObject(documentRecord.storageKey)
    const result = await extractDocument({
      filename: documentRecord.filename,
      mimeType: documentRecord.mimeType,
      sizeBytes: documentRecord.sizeBytes,
      buffer,
    })

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        extractedText: result.extractedText,
        extractedData: result.extractedData as Prisma.InputJsonValue,
        errorMessage: null,
      },
    })

    await emitCurrentState(documentId, 'Processing completed')
  } catch (error) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Extraction failed.',
      },
    })

    await emitCurrentState(documentId, error instanceof Error ? error.message : 'Extraction failed.')
  }
}

let keepRunning = true

async function main() {
  console.log(`DocuFlow worker polling every ${env.pollIntervalMs}ms`)

  while (keepRunning) {
    try {
      const documentRecord = await claimNextDocument()

      if (!documentRecord) {
        await sleep(env.pollIntervalMs)
        continue
      }

      await processDocument(documentRecord.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown worker error.'
      console.error(`Worker cycle failed: ${message}`)
      await sleep(env.pollIntervalMs)
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    keepRunning = false
  })
}

await main()
