import type { DocumentStatusEvent } from '@docuflow/shared'

import { env } from '../config/env.js'

export async function publishDocumentEvent(documentId: string, event: DocumentStatusEvent) {
  const response = await fetch(`${env.apiBaseUrl}/internal/documents/${documentId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-docuflow-internal-token': env.internalEventToken,
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Failed to publish document event: ${response.status} ${body}`)
  }
}
