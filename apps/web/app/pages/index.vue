<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

import type { HelloResponse } from '@docuflow/shared'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'DocuFlow Command Center',
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

const health = ref<HelloResponse | null>(null)
const healthError = ref<string | null>(null)
const healthStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const lastToastStatusKey = ref<string | null>(null)

const apiHost = computed(() => config.public.apiBase.replace(/^https?:\/\//, ''))
const formattedExtractedData = computed<string | null>(() => {
  const extractedData = activeDocument.value?.extractedData as unknown
  return extractedData ? JSON.stringify(extractedData, null, 2) : null
})
const uploadPhaseLabel = computed(() => {
  switch (uploadPhase.value) {
    case 'initiating':
      return 'Creating signed upload target'
    case 'uploading':
      return `Uploading file (${uploadProgress.value}%)`
    case 'completing':
      return 'Finalizing upload'
    default:
      return 'Ready for the next document'
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

const recentDocumentsCount = computed(() => recentDocuments.value.length)

async function refreshHealth() {
  healthStatus.value = 'pending'
  healthError.value = null

  try {
    health.value = await $fetch<HelloResponse>('/health', {
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
      summary: 'Upload queued',
      detail: `${document.filename} is now ${document.status}.`,
      life: 2800,
    })
  }
}

onMounted(() => {
  void refreshHealth()
  void loadRecentDocuments()
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
        summary: 'Extraction completed',
        detail: activeDocument.value.filename,
        life: 3200,
      })
    }

    if (activeDocument.value?.status === 'FAILED') {
      toast.add({
        severity: 'warn',
        summary: 'Pipeline failed',
        detail: activeDocument.value.errorMessage ?? activeDocument.value.filename,
        life: 4200,
      })
    }
  },
)
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
      <div class="space-y-6">
        <SectionHeader
          eyebrow="Automated intake"
          title="Turn raw uploads into a live, inspectable document pipeline."
          body="Nuxt, Hono, Prisma, and shared Zod contracts still power the workflow. PrimeVue now gives the surface a clearer hierarchy, stronger states, and a more deliberate command center feel."
          icon="pi pi-sparkles"
        />

        <UploadPanel
          :key="`${activeDocument?.id ?? 'empty'}-${uploadPhase}-${uploadError ?? 'ok'}`"
          :disabled="uploadPhase !== 'idle'"
          :upload-phase-label="uploadPhaseLabel"
          :upload-progress="uploadProgress"
          :upload-error="uploadError"
          @select="handleFileSelected"
        />
      </div>

      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
        <StatCard eyebrow="API link" title="Direct browser health" icon="pi pi-server">
          <template #actions>
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :loading="healthStatus === 'pending'"
              @click="refreshHealth()"
            />
          </template>

          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <StatusTag :label="healthStatus === 'success' ? 'Connected' : healthStatus === 'pending' ? 'Checking' : healthStatus === 'error' ? 'Unavailable' : 'Idle'" :tone="healthTone" />
              <span class="text-sm font-semibold text-color">{{ apiHost }}</span>
            </div>
            <Message :severity="healthMessageSeverity" :closable="false">
              <template v-if="healthStatus === 'pending'">
                Checking direct browser connection to the API...
              </template>
              <template v-else-if="healthError">
                {{ healthError }}
              </template>
              <template v-else>
                {{ health?.message ?? 'No response received yet.' }}
              </template>
            </Message>
          </div>
        </StatCard>

        <StatCard eyebrow="Active document" title="Pipeline focus" icon="pi pi-wave-pulse" variant="dark">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <StatusTag
                :label="activeDocument?.status ?? (uploadPhase !== 'idle' ? 'STARTING' : 'EMPTY')"
                :tone="activeDocumentTone"
              />
              <span v-if="activeDocument" class="text-xs uppercase tracking-[0.24em] text-white/50">
                {{ new Date(activeDocument.createdAt).toLocaleString() }}
              </span>
            </div>

            <template v-if="activeDocument">
              <p class="font-display text-3xl font-semibold tracking-[-0.03em] text-white">
                {{ activeDocument.filename }}
              </p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-[1.2rem] bg-white/5 p-4">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/50">Type</p>
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
              No active upload yet. Start with a single document to open the live event stream.
            </Message>
          </div>
        </StatCard>

        <StatCard eyebrow="Live stream" title="SSE activity channel" icon="pi pi-bolt">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <StatusTag :label="connectionState.toUpperCase()" :tone="streamTone" />
              <span class="text-sm text-muted-color">
                {{ activeDocument ? 'Bound to the selected document.' : 'Waiting for a selected document.' }}
              </span>
            </div>
            <Message :severity="streamMessageSeverity" :closable="false">
              <template v-if="activeDocument">
                SSE state: {{ connectionState }}
              </template>
              <template v-else>
                Select or upload a document to open the status stream.
              </template>
            </Message>
          </div>
        </StatCard>
      </div>
    </section>

    <section class="space-y-5">
      <SectionHeader
        eyebrow="Pipeline progress"
        title="Every stage stays visible from signed target to structured output."
        body="The browser handles the upload transport while worker events move the document through storage, processing, and completion."
        icon="pi pi-sitemap"
      />
      <DocumentStageRail
        :current-status="activeDocument?.status"
        :upload-phase-label="uploadPhaseLabel"
        :upload-progress="uploadProgress"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <div class="space-y-5">
        <div class="flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Recent documents"
            title="Reopen the latest runs instantly."
            body="The dashboard keeps the newest summaries hot so you can bounce between uploads without refreshing context."
            icon="pi pi-folder-open"
          />
          <StatusTag :label="`${recentDocumentsCount} loaded`" tone="accent" />
        </div>

        <RecentDocumentsList
          :documents="recentDocuments"
          :active-document-id="activeDocument?.id ?? null"
          @select="loadDocument"
        />
      </div>

      <ExtractedOutputViewer
        :extracted-text="activeDocument?.extractedText"
        :formatted-extracted-data="formattedExtractedData"
        :error-message="activeDocument?.errorMessage"
      />
    </section>
  </div>
</template>
