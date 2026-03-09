<script setup lang="ts">
import { Activity, RefreshCw, Server, Sparkles, TriangleAlert, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import type { HelloResponse, UploadResponse } from '@docuflow/shared'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'DocuFlow Dashboard',
})

const config = useRuntimeConfig()

const health = ref<HelloResponse | null>(null)
const healthError = ref<string | null>(null)
const healthStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const uploadedDocument = ref<UploadResponse['document'] | null>(null)

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
  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<UploadResponse>('/upload', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: formData,
    })

    uploadedDocument.value = response.document
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload failed.'
  } finally {
    isUploading.value = false
  }
}

onMounted(() => {
  void refreshHealth()
})
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

      <UploadDropzone :disabled="isUploading" @select="handleFileSelected" />

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
            Latest Upload
          </div>
          <div class="mt-5 space-y-3">
            <template v-if="uploadedDocument">
              <p class="text-xl font-semibold">{{ uploadedDocument.filename }}</p>
              <p class="text-sm text-white/70">Status: {{ uploadedDocument.status }}</p>
              <p class="text-sm text-white/70">
                Created {{ new Date(uploadedDocument.createdAt).toLocaleString() }}
              </p>
            </template>
            <template v-else-if="isUploading">
              <p class="text-xl font-semibold">Uploading…</p>
              <p class="text-sm text-white/70">The API is persisting a placeholder document record.</p>
            </template>
            <template v-else>
              <p class="text-xl font-semibold">No uploads yet</p>
              <p class="text-sm text-white/70">Drop a file to create the first `Document` row.</p>
            </template>
          </div>
        </article>
      </div>
    </section>

    <aside class="space-y-4">
      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          <Upload class="h-4 w-4" />
          Upload Status
        </div>
        <div class="mt-4 space-y-4 text-sm text-ink/72">
          <p>
            The backend expects a multipart field named <code class="rounded bg-ink/5 px-1.5 py-0.5 text-xs">file</code> and responds with a typed document payload.
          </p>
          <p v-if="uploadError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span class="inline-flex items-center gap-2 font-medium">
              <TriangleAlert class="h-4 w-4" />
              {{ uploadError }}
            </span>
          </p>
          <p v-else class="rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3">
            Documents begin in <strong>PENDING</strong> while extraction is still out of scope for this bootstrap.
          </p>
        </div>
      </article>

      <article class="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Shared Contract</h3>
        <ul class="mt-4 space-y-3 text-sm text-ink/72">
          <li>Shared Zod schemas live in <code class="rounded bg-ink/5 px-1.5 py-0.5 text-xs">@docuflow/shared</code>.</li>
          <li>The dashboard and API both consume the same upload and health response types.</li>
          <li>Prisma stores the canonical document state in PostgreSQL.</li>
        </ul>
      </article>
    </aside>
  </div>
</template>
