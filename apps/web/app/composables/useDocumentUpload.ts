import {
  DocumentListResponseSchema,
  GetDocumentResponseSchema,
  UploadCompleteResponseSchema,
  UploadInitiateResponseSchema,
  type Document,
  type DocumentSummary,
} from '@docuflow/shared'

type UploadPhase = 'idle' | 'initiating' | 'uploading' | 'completing'
type DocumentView = Omit<Document, 'extractedData'> & {
  extractedData: unknown
}

export function useDocumentUpload() {
  const config = useRuntimeConfig()

  const recentDocuments = ref<DocumentSummary[]>([])
  const activeDocument = ref<DocumentView | null>(null)
  const uploadPhase = ref<UploadPhase>('idle')
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)

  function toDocumentView(document: Document): DocumentView {
    return {
      ...document,
      extractedData: document.extractedData as unknown,
    }
  }

  function toSummary(document: DocumentView): DocumentSummary {
    return {
      id: document.id,
      filename: document.filename,
      status: document.status,
      storageProvider: document.storageProvider,
      storageKey: document.storageKey,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt,
      processingStartedAt: document.processingStartedAt,
      completedAt: document.completedAt,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }
  }

  function upsertSummary(summary: DocumentSummary) {
    const current = recentDocuments.value.filter((item) => item.id !== summary.id)
    recentDocuments.value = [summary, ...current].slice(0, 8)
  }

  async function uploadToSignedTarget(
    url: string,
    method: 'PUT' | 'POST',
    headers: Record<string, string>,
    file: File,
  ) {
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open(method, url)

      for (const [header, value] of Object.entries(headers)) {
        request.setRequestHeader(header, value)
      }

      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      }

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          uploadProgress.value = 100
          resolve()
          return
        }

        reject(new Error(request.responseText || `Upload failed with status ${request.status}`))
      }

      request.onerror = () => {
        reject(new Error('Upload request failed.'))
      }

      request.send(file)
    })
  }

  async function loadRecentDocuments() {
    const response = DocumentListResponseSchema.parse(
      await $fetch('/documents', {
        baseURL: config.public.apiBase,
      }),
    )

    recentDocuments.value = response.documents

    if (!activeDocument.value && response.documents[0]) {
      await loadDocument(response.documents[0].id)
    }
  }

  async function loadDocument(documentId: string) {
    const response = GetDocumentResponseSchema.parse(
      await $fetch(`/documents/${documentId}`, {
        baseURL: config.public.apiBase,
      }),
    )

    activeDocument.value = toDocumentView(response.document)
    upsertSummary(toSummary(activeDocument.value))

    return activeDocument.value
  }

  async function startUpload(file: File) {
    uploadError.value = null
    uploadProgress.value = 0

    try {
      uploadPhase.value = 'initiating'
      const initiateResponse = UploadInitiateResponseSchema.parse(
        await $fetch('/uploads/initiate', {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: {
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
          },
        }),
      )

      upsertSummary(initiateResponse.document)

      uploadPhase.value = 'uploading'
      await uploadToSignedTarget(
        initiateResponse.upload.uploadUrl,
        initiateResponse.upload.method,
        initiateResponse.upload.headers,
        file,
      )

      uploadPhase.value = 'completing'
      const completeResponse = UploadCompleteResponseSchema.parse(
        await $fetch(`/uploads/${initiateResponse.document.id}/complete`, {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: {},
        }),
      )

      upsertSummary(completeResponse.document)
      return await loadDocument(completeResponse.document.id)
    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : 'Upload failed.'
      return null
    } finally {
      uploadPhase.value = 'idle'
    }
  }

  return {
    activeDocument,
    loadDocument,
    loadRecentDocuments,
    recentDocuments,
    startUpload,
    upsertSummary,
    uploadError,
    uploadPhase,
    uploadProgress,
  }
}
