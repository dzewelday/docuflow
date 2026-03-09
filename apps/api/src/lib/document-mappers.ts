import type { Document as PrismaDocument } from '@prisma/client'

import type { Document, DocumentStatusEvent, DocumentSummary, StorageProvider } from '@docuflow/shared'

function mapStorageProvider(value: string): StorageProvider {
  return value.toLowerCase() as StorageProvider
}

function mapCommonFields(record: PrismaDocument) {
  return {
    id: record.id,
    filename: record.filename,
    status: record.status,
    storageProvider: mapStorageProvider(record.storageProvider),
    storageKey: record.storageKey,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    uploadedAt: record.uploadedAt?.toISOString() ?? null,
    processingStartedAt: record.processingStartedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

export function toDocumentSummary(record: PrismaDocument): DocumentSummary {
  return {
    ...mapCommonFields(record),
  }
}

export function toDocument(record: PrismaDocument): Document {
  return {
    ...mapCommonFields(record),
    extractedText: record.extractedText,
    extractedData: (record.extractedData as Document['extractedData']) ?? null,
  }
}

export function createDocumentEvent(
  type: DocumentStatusEvent['type'],
  document: DocumentSummary,
  message?: string | null,
): DocumentStatusEvent {
  return {
    type,
    document,
    at: new Date().toISOString(),
    message: message ?? null,
  }
}
