<script setup lang="ts">
import { Activity, FileSearch, RefreshCw, Server, Sparkles, TriangleAlert, Upload, Waves } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import type { DocumentStatus, HelloResponse } from '@docuflow/shared'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'DocuFlow Dashboard',
})

const config = useRuntimeConfig()
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

const connectionTone = computed(() => {
  if (healthStatus.value === 'pending') {
    return 'border-sage/50 bg-sage/30 text-ink'
  }

  if (healthStatus.value === 'error') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
})

const apiHost = computed(() => config.public.apiBase.replace(/^https?:\/\//, ''))
const streamTone = computed(() => {
  if (connectionState.value === 'open') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (connectionState.value === 'error') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (connectionState.value === 'connecting') {
    return 'border-sage/50 bg-sage/30 text-ink'
  }

  return 'border-ink/10 bg-sand/70 text-ink/70'
})
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
const currentStageIndex = computed(() => {
  const status = activeDocument.value?.status
  const order: DocumentStatus[] = ['PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'COMPLETED']
  const index = status ? order.indexOf(status) : -1
  return index === -1 && status === 'FAILED' ? 2 : index
})
const stageSteps = [
  { label: 'Initiated', status: 'PENDING_UPLOAD' },
  { label: 'Stored', status: 'UPLOADED' },
  { label: 'Processing', status: 'PROCESSING' },
  { label: 'Completed', status: 'COMPLETED' },
] as const

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
  const document = await startUpload(file)
  if (document) {
    await loadDocument(document.id)
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
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
    <section class="space-y-6">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
          <Sparkles class="h-4 w-4 text-ember" />
          Automated intake
        </div>
        <div class="space-y-3">
          <h2 class="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Turn raw files into structured document workflows.
          </h2>
          <p class="max-w-2xl text-base leading-7 text-ink/72">
            This bootstrap proves the full path: Nuxt talks to Hono over CORS, Prisma records the upload, and shared Zod contracts keep both sides aligned.
          </p>
        </div>
      </div>

      <UploadDropzone :disabled="uploadPhase !== 'idle'" @select="handleFileSelected" />

      <div class="grid gap-4 md:grid-cols-2">
        <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
          <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
            <Server class="h-4 w-4" />
            API Link
          </div>
          <div class="mt-5 flex items-start justify-between gap-4">
            <div class="space-y-2">
              <p class="text-sm text-ink/60">Target</p>
              <p class="text-lg font-semibold text-ink">{{ apiHost }}</p>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-ink hover:text-white"
              type="button"
              @click="refreshHealth()"
            >
              <RefreshCw class="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div class="mt-5 rounded-[1.5rem] border px-4 py-3 text-sm" :class="connectionTone">
            <template v-if="healthStatus === 'pending'">
              Checking direct browser connection to the API...
            </template>
            <template v-else-if="healthError">
              {{ healthError }}
            </template>
            <template v-else>
              {{ health?.message ?? 'No response received yet.' }}
            </template>
          </div>
        </article>

        <article class="rounded-[2rem] border border-white/60 bg-ink p-6 text-white shadow-panel">
          <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
            <Activity class="h-4 w-4" />
            Active Document
          </div>
          <div class="mt-5 space-y-3">
            <template v-if="activeDocument">
              <p class="text-xl font-semibold">{{ activeDocument.filename }}</p>
              <p class="text-sm text-white/70">Status: {{ activeDocument.status }}</p>
              <p class="text-sm text-white/70">
                Created {{ new Date(activeDocument.createdAt).toLocaleString() }}
              </p>
            </template>
            <template v-else-if="uploadPhase !== 'idle'">
              <p class="text-xl font-semibold">Pipeline starting…</p>
              <p class="text-sm text-white/70">The API is issuing a signed upload target and waiting for the file.</p>
            </template>
            <template v-else>
              <p class="text-xl font-semibold">No uploads yet</p>
              <p class="text-sm text-white/70">Drop a file to create the first pipeline job.</p>
            </template>
          </div>
        </article>
      </div>

      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          <Waves class="h-4 w-4" />
          Pipeline Progress
        </div>
        <div class="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div class="grid gap-3 md:grid-cols-4">
            <div
              v-for="(step, index) in stageSteps"
              :key="step.status"
              class="rounded-[1.5rem] border px-4 py-4 transition"
              :class="{
                'border-emerald-200 bg-emerald-50 text-emerald-700': index <= currentStageIndex && activeDocument?.status !== 'FAILED',
                'border-red-200 bg-red-50 text-red-700': activeDocument?.status === 'FAILED' && index === 2,
                'border-ink/10 bg-sand/70 text-ink/60': index > currentStageIndex || !activeDocument,
              }"
            >
              <p class="text-xs uppercase tracking-[0.2em]">{{ step.label }}</p>
              <p class="mt-2 text-sm font-medium">{{ step.status }}</p>
            </div>
          </div>
          <div class="rounded-[1.5rem] border border-ink/10 bg-sand/70 px-4 py-4 text-sm text-ink/72">
            <p class="font-semibold text-ink">Upload Transport</p>
            <p class="mt-2">{{ uploadPhaseLabel }}</p>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div class="h-full rounded-full bg-ink transition-all" :style="{ width: `${uploadProgress}%` }" />
            </div>
          </div>
        </div>
      </article>
    </section>

    <aside class="space-y-4">
      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          <Upload class="h-4 w-4" />
          Upload Status
        </div>
        <div class="mt-4 space-y-4 text-sm text-ink/72">
          <p>
            The browser now follows a staged flow: initiate upload, send the file to a signed local target, mark the upload complete, then wait for processing updates over SSE.
          </p>
          <p v-if="uploadError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span class="inline-flex items-center gap-2 font-medium">
              <TriangleAlert class="h-4 w-4" />
              {{ uploadError }}
            </span>
          </p>
          <p v-else class="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3">
            The worker promotes documents from <strong>PENDING_UPLOAD</strong> through <strong>PROCESSING</strong> to either <strong>COMPLETED</strong> or <strong>FAILED</strong>.
          </p>
        </div>
      </article>

      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          <FileSearch class="h-4 w-4" />
          Recent Documents
        </div>
        <div class="mt-4 space-y-3">
          <button
            v-for="document in recentDocuments"
            :key="document.id"
            class="w-full rounded-[1.5rem] border px-4 py-3 text-left transition"
            :class="{
              'border-ink bg-ink text-white': activeDocument?.id === document.id,
              'border-ink/10 bg-sand/70 text-ink hover:border-ink/30': activeDocument?.id !== document.id,
            }"
            type="button"
            @click="loadDocument(document.id)"
          >
            <p class="font-semibold">{{ document.filename }}</p>
            <p class="mt-1 text-sm opacity-75">{{ document.status }}</p>
          </button>
          <p v-if="recentDocuments.length === 0" class="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink/72">
            Uploaded documents will appear here and can be reopened after refresh.
          </p>
        </div>
      </article>

      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          <Server class="h-4 w-4" />
          Live Stream
        </div>
        <div class="mt-4 rounded-[1.5rem] border px-4 py-3 text-sm" :class="streamTone">
          <template v-if="activeDocument">
            SSE state: {{ connectionState }}
          </template>
          <template v-else>
            Select or upload a document to open a status stream.
          </template>
        </div>
      </article>

      <article v-if="activeDocument" class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Extracted Output</h3>
        <div class="mt-4 space-y-4 text-sm text-ink/72">
          <div class="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3">
            <p class="font-semibold text-ink">Text Preview</p>
            <p class="mt-2 whitespace-pre-wrap break-words">{{ activeDocument.extractedText || 'No extracted text yet.' }}</p>
          </div>
          <pre v-if="formattedExtractedData" class="overflow-x-auto rounded-2xl border border-ink/10 bg-ink p-4 text-xs text-white">{{ formattedExtractedData }}</pre>
        </div>
      </article>
    </aside>
  </div>
</template>
