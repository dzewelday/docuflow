import { z } from 'zod'

import { JsonValueSchema } from './json'

export const DocumentStatusSchema = z.enum([
  'PENDING_UPLOAD',
  'UPLOADED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
])

export const StorageProviderSchema = z.enum(['local', 's3'])
export const UploadMethodSchema = z.enum(['PUT', 'POST'])

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  status: DocumentStatusSchema,
  storageProvider: StorageProviderSchema,
  storageKey: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  uploadedAt: z.string().datetime().nullable(),
  processingStartedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
  extractedText: z.string().nullable(),
  extractedData: JsonValueSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const DocumentSummarySchema = DocumentSchema.omit({
  extractedText: true,
  extractedData: true,
})

export const HelloResponseSchema = z.object({
  message: z.string().min(1),
})

export const UploadTargetSchema = z.object({
  objectKey: z.string().min(1),
  uploadUrl: z.string().url(),
  method: UploadMethodSchema,
  headers: z.record(z.string(), z.string()),
  expiresAt: z.string().datetime(),
})

export const UploadInitiateRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
})

export const UploadInitiateResponseSchema = z.object({
  document: DocumentSummarySchema,
  upload: UploadTargetSchema,
})

export const UploadCompleteRequestSchema = z.object({}).strict()

export const UploadCompleteResponseSchema = z.object({
  document: DocumentSummarySchema,
})

export const GetDocumentResponseSchema = z.object({
  document: DocumentSchema,
})

export const DocumentListResponseSchema = z.object({
  documents: z.array(DocumentSummarySchema),
})

export const DocumentStatusEventTypeSchema = z.enum(['snapshot', 'status_changed', 'heartbeat'])

export const DocumentStatusEventSchema = z.object({
  type: DocumentStatusEventTypeSchema,
  document: DocumentSummarySchema,
  at: z.string().datetime(),
  message: z.string().nullable().optional(),
})

export const ApiErrorSchema = z.object({
  error: z.string().min(1),
  details: z.unknown().optional(),
})

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>
export type StorageProvider = z.infer<typeof StorageProviderSchema>
export type UploadMethod = z.infer<typeof UploadMethodSchema>
export type Document = z.infer<typeof DocumentSchema>
export type DocumentSummary = z.infer<typeof DocumentSummarySchema>
export type HelloResponse = z.infer<typeof HelloResponseSchema>
export type UploadTarget = z.infer<typeof UploadTargetSchema>
export type UploadInitiateRequest = z.infer<typeof UploadInitiateRequestSchema>
export type UploadInitiateResponse = z.infer<typeof UploadInitiateResponseSchema>
export type UploadCompleteRequest = z.infer<typeof UploadCompleteRequestSchema>
export type UploadCompleteResponse = z.infer<typeof UploadCompleteResponseSchema>
export type GetDocumentResponse = z.infer<typeof GetDocumentResponseSchema>
export type DocumentListResponse = z.infer<typeof DocumentListResponseSchema>
export type DocumentStatusEvent = z.infer<typeof DocumentStatusEventSchema>
export type ApiError = z.infer<typeof ApiErrorSchema>
