import type { DocumentStatusEvent } from '@docuflow/shared'

type Listener = (event: DocumentStatusEvent) => void

class DocumentEventBus {
  private listeners = new Map<string, Set<Listener>>()

  subscribe(documentId: string, listener: Listener) {
    const bucket = this.listeners.get(documentId) ?? new Set<Listener>()
    bucket.add(listener)
    this.listeners.set(documentId, bucket)

    return () => {
      const currentBucket = this.listeners.get(documentId)
      if (!currentBucket) {
        return
      }

      currentBucket.delete(listener)

      if (currentBucket.size === 0) {
        this.listeners.delete(documentId)
      }
    }
  }

  publish(event: DocumentStatusEvent) {
    const bucket = this.listeners.get(event.document.id)
    if (!bucket) {
      return
    }

    for (const listener of bucket) {
      listener(event)
    }
  }
}

export const documentEventBus = new DocumentEventBus()
