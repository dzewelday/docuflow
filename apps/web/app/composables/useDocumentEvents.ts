import { DocumentStatusEventSchema, type DocumentStatusEvent } from '@docuflow/shared'

interface UseDocumentEventsOptions {
  onEvent: (event: DocumentStatusEvent) => void | Promise<void>
}

export function useDocumentEvents(options: UseDocumentEventsOptions) {
  const config = useRuntimeConfig()
  const connectionState = ref<'idle' | 'connecting' | 'open' | 'error'>('idle')
  const source = shallowRef<EventSource | null>(null)

  function disconnect() {
    source.value?.close()
    source.value = null
    connectionState.value = 'idle'
  }

  function connect(documentId: string) {
    if (!import.meta.client) {
      return
    }

    disconnect()
    connectionState.value = 'connecting'

    const eventSource = new EventSource(`${config.public.apiBase}/documents/${documentId}/events`)

    eventSource.onopen = () => {
      connectionState.value = 'open'
    }

    eventSource.onmessage = (event) => {
      const payload = DocumentStatusEventSchema.parse(JSON.parse(event.data))
      options.onEvent(payload)
    }

    for (const eventName of ['snapshot', 'status_changed', 'heartbeat']) {
      eventSource.addEventListener(eventName, (event) => {
        const messageEvent = event as MessageEvent<string>
        const payload = DocumentStatusEventSchema.parse(JSON.parse(messageEvent.data))
        options.onEvent(payload)
      })
    }

    eventSource.onerror = () => {
      connectionState.value = 'error'
    }

    source.value = eventSource
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    connect,
    connectionState,
    disconnect,
  }
}
