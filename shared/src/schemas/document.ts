import { z } from 'zod'

import { JsonValueSchema } from './json'

export const DocumentStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED'])

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  status: DocumentStatusSchema,
  extractedData: JsonValueSchema.nullable(),
  createdAt: z.string().datetime(),
})

export const HelloResponseSchema = z.object({
  message: z.string().min(1),
})

export const UploadResponseSchema = z.object({
  document: DocumentSchema,
})

export const ApiErrorSchema = z.object({
  error: z.string().min(1),
  details: z.unknown().optional(),
})

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>
export type Document = z.infer<typeof DocumentSchema>
export type HelloResponse = z.infer<typeof HelloResponseSchema>
export type UploadResponse = z.infer<typeof UploadResponseSchema>
export type ApiError = z.infer<typeof ApiErrorSchema>
