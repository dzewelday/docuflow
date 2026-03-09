import type { StorageProvider as StorageProviderName, UploadMethod, UploadTarget } from '@docuflow/shared'

export interface CreateUploadTargetInput {
  documentId: string
  filename: string
  mimeType: string
  sizeBytes: number
  objectKey: string
}

export interface SignedUploadPayload {
  documentId: string
  objectKey: string
  mimeType: string
  sizeBytes: number
  expiresAt: string
  signature: string
}

export interface StorageProvider {
  readonly name: StorageProviderName
  readonly uploadMethod: UploadMethod
  createObjectKey(documentId: string, filename: string): string
  createUploadTarget(input: CreateUploadTargetInput): Promise<UploadTarget>
  validateSignedUpload(payload: SignedUploadPayload): SignedUploadPayload
  writeObject(objectKey: string, buffer: Buffer): Promise<void>
  readObject(objectKey: string): Promise<Buffer>
  objectExists(objectKey: string): Promise<boolean>
  getObjectSize(objectKey: string): Promise<number | null>
}
