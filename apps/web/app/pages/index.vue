<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

import type { HelloResponse } from '@docuflow/shared'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'DocuFlow',
})

const config = useRuntimeConfig()
const toast = useToast()

const {
  activeDocument,
  loadDocument,
  loadRecentDocuments,
  recentDocuments,
  startUpload,
  upsertSummary,
  uploadError,
  uploadPhase,
  uploadProgress,
} = useDocumentUpload()

const { connect, connectionState, disconnect } = useDocumentEvents({
  async onEvent(event) {
    if (event.type === 'heartbeat') {
      return
    }

    upsertSummary(event.document)

    if (!activeDocument.value || activeDocument.value.id === event.document.id || event.document.status === 'COMPLETED' || event.document.status === 'FAILED') {
      await loadDocument(event.document.id)
    }
  },
})

const healthError = ref<string | null>(null)
const healthStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const lastToastStatusKey = ref<string | null>(null)

const formattedExtractedData = computed<string | null>(() => {
  const extractedData = activeDocument.value?.extractedData as unknown
  return extractedData ? JSON.stringify(extractedData, null, 2) : null
})

const uploadPhaseLabel = computed(() => {
  switch (uploadPhase.value) {
    case 'initiating':
      return 'Preparing upload'
    case 'uploading':
      return `Uploading (${uploadProgress.value}%)`
    case 'completing':
      return 'Finishing'
    default:
      return 'Ready'
  }
})

const healthTone = computed(() => {
  if (healthStatus.value === 'error') {
    return 'danger'
  }

  if (healthStatus.value === 'pending') {
    return 'info'
  }

  if (healthStatus.value === 'success') {
    return 'success'
  }

  return 'neutral'
})

const healthMessageSeverity = computed(() => {
  if (healthStatus.value === 'error') {
    return 'error'
  }

  if (healthStatus.value === 'pending') {
    return 'info'
  }

  if (healthStatus.value === 'success') {
    return 'success'
  }

  return 'secondary'
})

const healthLabel = computed(() => {
  switch (healthStatus.value) {
    case 'pending':
      return 'Checking'
    case 'success':
      return 'Ready'
    case 'error':
      return 'Unavailable'
    default:
      return 'Idle'
  }
})

const healthMessage = computed(() => {
  if (healthStatus.value === 'pending') {
    return 'Checking service availability.'
  }

  if (healthError.value) {
    return healthError.value
  }

  if (healthStatus.value === 'success') {
    return 'Everything is available.'
  }

  return 'Service status has not been checked yet.'
})

const streamTone = computed(() => {
  if (connectionState.value === 'error') {
    return 'danger'
  }

  if (connectionState.value === 'connecting') {
    return 'info'
  }

  if (connectionState.value === 'open') {
    return 'success'
  }

  return 'neutral'
})

const streamMessageSeverity = computed(() => {
  if (connectionState.value === 'error') {
    return 'error'
  }

  if (connectionState.value === 'connecting') {
    return 'info'
  }

  if (connectionState.value === 'open') {
    return 'success'
  }

  return 'secondary'
})

const connectionLabel = computed(() => {
  switch (connectionState.value) {
    case 'open':
      return 'Live'
    case 'connecting':
      return 'Connecting'
    case 'error':
      return 'Interrupted'
    default:
      return 'Standby'
  }
})

const connectionMessage = computed(() => {
  if (!activeDocument.value) {
    return 'Select a file to follow its updates.'
  }

  if (connectionState.value === 'open') {
    return 'Status updates are following the selected file.'
  }

  if (connectionState.value === 'connecting') {
    return 'Connecting to the selected file.'
  }

  if (connectionState.value === 'error') {
    return 'Updates paused. Try selecting the file again.'
  }

  return 'Waiting for the selected file.'
})

const activeDocumentTone = computed(() => {
  if (activeDocument.value?.status === 'FAILED') {
    return 'danger'
  }

  if (activeDocument.value?.status === 'COMPLETED') {
    return 'success'
  }

  if (activeDocument.value?.status === 'PROCESSING') {
    return 'warn'
  }

  if (activeDocument.value?.status) {
    return 'accent'
  }

  return 'neutral'
})

const activeDocumentLabel = computed(() => {
  switch (activeDocument.value?.status) {
    case 'PENDING_UPLOAD':
      return 'Queued'
    case 'UPLOADED':
      return 'Uploaded'
    case 'PROCESSING':
      return 'Processing'
    case 'COMPLETED':
      return 'Ready'
    case 'FAILED':
      return 'Failed'
    default:
      return uploadPhase.value !== 'idle' ? 'Starting' : 'Waiting'
  }
})

const activeDocumentTime = computed(() => (
  activeDocument.value
    ? new Date(activeDocument.value.createdAt).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : null
))

const recentDocumentsCount = computed(() => recentDocuments.value.length)

async function refreshHealth() {
  healthStatus.value = 'pending'
  healthError.value = null

  try {
    await $fetch<HelloResponse>('/health', {
      baseURL: config.public.apiBase,
    })
    healthStatus.value = 'success'
  } catch (error) {
    healthStatus.value = 'error'
    healthError.value = error instanceof Error ? error.message : 'Health check failed.'
  }
}

async function handleFileSelected(file: File) {
  toast.add({
    severity: 'info',
    summary: 'Upload started',
    detail: file.name,
    life: 2200,
  })

  const document = await startUpload(file)

  if (document) {
    toast.add({
      severity: 'success',
      summary: 'Upload complete',
      detail: `${document.filename} is ready to review.`,
      life: 2800,
    })
  }
}

onMounted(() => {
  refreshHealth()
  loadRecentDocuments()
})

watch(
  () => activeDocument.value?.id,
  (documentId) => {
    if (documentId) {
      connect(documentId)
      return
    }

    disconnect()
  },
  { immediate: true },
)

watch(
  () => uploadError.value,
  (error, previousError) => {
    if (error && error !== previousError) {
      toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: error,
        life: 4000,
      })
    }
  },
)

watch(
  () => activeDocument.value ? `${activeDocument.value.id}:${activeDocument.value.status}` : null,
  (statusKey, previousStatusKey) => {
    if (!statusKey || statusKey === previousStatusKey || statusKey === lastToastStatusKey.value) {
      return
    }

    lastToastStatusKey.value = statusKey

    if (activeDocument.value?.status === 'COMPLETED') {
      toast.add({
        severity: 'success',
        summary: 'Result ready',
        detail: activeDocument.value.filename,
        life: 3200,
      })
    }

    if (activeDocument.value?.status === 'FAILED') {
      toast.add({
        severity: 'warn',
        summary: 'Processing stopped',
        detail: activeDocument.value.errorMessage ?? activeDocument.value.filename,
        life: 4200,
      })
    }
  },
)
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_22rem]">
      <UploadPanel
        :key="`${activeDocument?.id ?? 'empty'}-${uploadPhase}-${uploadError ?? 'ok'}`"
        :disabled="uploadPhase !== 'idle'"
        :upload-phase-label="uploadPhaseLabel"
        :upload-progress="uploadProgress"
        :upload-error="uploadError"
        @select="handleFileSelected"
      />

      <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
        <StatCard eyebrow="Service" title="Availability" icon="pi pi-server">
          <template #actions>
            <Button
              label="Check"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :loading="healthStatus === 'pending'"
              @click="refreshHealth()"
            />
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <StatusTag :label="healthLabel" :tone="healthTone" />
            </div>
            <Message :severity="healthMessageSeverity" :closable="false">
              {{ healthMessage }}
            </Message>
          </div>
        </StatCard>

        <StatCard eyebrow="Current file" title="In focus" icon="pi pi-wave-pulse" variant="dark">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <StatusTag :label="activeDocumentLabel" :tone="activeDocumentTone" />
              <span v-if="activeDocumentTime" class="text-xs uppercase tracking-[0.24em] text-white/50">
                {{ activeDocumentTime }}
              </span>
            </div>

            <template v-if="activeDocument">
              <p class="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
                {{ activeDocument.filename }}
              </p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-[1.2rem] bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/50">Format</p>
                  <p class="mt-2 text-sm font-semibold text-white/80">{{ activeDocument.mimeType }}</p>
                </div>
                <div class="rounded-[1.2rem] bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/50">Size</p>
                  <p class="mt-2 text-sm font-semibold text-white/80">{{ Math.ceil(activeDocument.sizeBytes / 1024) }} KB</p>
                </div>
              </div>
            </template>

            <template v-else-if="uploadPhase !== 'idle'">
              <div class="space-y-3">
                <Skeleton width="75%" height="2.6rem" class="!rounded-2xl" />
                <Skeleton width="100%" height="4.5rem" class="!rounded-[1.2rem]" />
              </div>
            </template>

            <Message v-else severity="secondary" :closable="false">
              Start with one file and it will appear here.
            </Message>
          </div>
        </StatCard>

        <StatCard eyebrow="Updates" title="Live status" icon="pi pi-bolt">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <StatusTag :label="connectionLabel" :tone="streamTone" />
              <span class="truncate text-sm text-muted-color">{{ activeDocument ? activeDocument.filename : 'No file selected' }}</span>
            </div>
            <Message :severity="streamMessageSeverity" :closable="false">
              {{ connectionMessage }}
            </Message>
          </div>
        </StatCard>
      </div>
    </section>

    <DocumentStageRail
      :current-status="activeDocument?.status"
      :upload-phase-label="uploadPhaseLabel"
      :upload-progress="uploadProgress"
    />

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_20rem]">
      <ExtractedOutputViewer
        :extracted-text="activeDocument?.extractedText"
        :formatted-extracted-data="formattedExtractedData"
        :error-message="activeDocument?.errorMessage"
      />

      <div class="space-y-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Recent</p>
            <h2 class="section-title mt-2">Open a recent file</h2>
          </div>
          <StatusTag :label="`${recentDocumentsCount}`" tone="accent" />
        </div>

        <RecentDocumentsList
          :documents="recentDocuments"
          :active-document-id="activeDocument?.id ?? null"
          @select="loadDocument"
        />
      </div>
    </section>
  </div>
</template>
