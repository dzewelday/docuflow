import { createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { StorageProvider } from '@docuflow/shared'

import { env } from '../../config/env.js'
import type { CreateUploadTargetInput, SignedUploadPayload, StorageProvider as StorageProviderContract } from './types.js'

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function encodeSignature(input: Omit<SignedUploadPayload, 'signature'>) {
  return createHmac('sha256', env.uploadSigningSecret)
    .update([input.documentId, input.objectKey, input.mimeType, String(input.sizeBytes), input.expiresAt].join(':'))
    .digest('hex')
}

export class LocalStorageProvider implements StorageProviderContract {
  readonly name: StorageProvider = 'local'

  readonly uploadMethod = 'PUT' as const

  createObjectKey(documentId: string, filename: string) {
    return `${documentId}/${Date.now()}-${sanitizeFilename(filename)}`
  }

  async createUploadTarget(input: CreateUploadTargetInput) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const basePayload = {
      documentId: input.documentId,
      objectKey: input.objectKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      expiresAt,
    }
    const signature = encodeSignature(basePayload)
    const uploadUrl = new URL(`${env.apiBaseUrl}/storage/upload/${input.documentId}`)

    uploadUrl.searchParams.set('key', input.objectKey)
    uploadUrl.searchParams.set('mimeType', input.mimeType)
    uploadUrl.searchParams.set('sizeBytes', String(input.sizeBytes))
    uploadUrl.searchParams.set('expiresAt', expiresAt)
    uploadUrl.searchParams.set('signature', signature)

    return {
      objectKey: input.objectKey,
      uploadUrl: uploadUrl.toString(),
      method: this.uploadMethod,
      headers: {
        'Content-Type': input.mimeType,
      },
      expiresAt,
    }
  }

  validateSignedUpload(payload: SignedUploadPayload) {
    const expectedSignature = encodeSignature({
      documentId: payload.documentId,
      objectKey: payload.objectKey,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
      expiresAt: payload.expiresAt,
    })

    const provided = Buffer.from(payload.signature)
    const expected = Buffer.from(expectedSignature)

    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      throw new Error('Upload signature is invalid.')
    }

    if (Date.parse(payload.expiresAt) < Date.now()) {
      throw new Error('Upload URL has expired.')
    }

    return payload
  }

  async writeObject(objectKey: string, buffer: Buffer) {
    const destination = this.resolvePath(objectKey)
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, buffer)
  }

  async readObject(objectKey: string) {
    return readFile(this.resolvePath(objectKey))
  }

  async objectExists(objectKey: string) {
    try {
      await stat(this.resolvePath(objectKey))
      return true
    } catch {
      return false
    }
  }

  async getObjectSize(objectKey: string) {
    try {
      const metadata = await stat(this.resolvePath(objectKey))
      return metadata.size
    } catch {
      return null
    }
  }

  private resolvePath(objectKey: string) {
    const resolvedBase = path.resolve(env.localStorageDir)
    const resolvedPath = path.resolve(resolvedBase, objectKey)

    if (!resolvedPath.startsWith(`${resolvedBase}${path.sep}`) && resolvedPath !== resolvedBase) {
      throw new Error('Storage key resolves outside the local storage directory.')
    }

    return resolvedPath
  }
}
