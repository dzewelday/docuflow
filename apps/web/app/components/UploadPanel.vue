<script setup lang="ts">
import type { FileUploadSelectEvent, FileUploadUploaderEvent } from 'primevue/fileupload'

const props = defineProps<{
  disabled?: boolean
  uploadPhaseLabel: string
  uploadProgress: number
  uploadError?: string | null
}>()

const emit = defineEmits<{
  select: [file: File]
}>()

const queuedFile = ref<File | null>(null)

function toSingleFile(files: File | File[] | null | undefined) {
  if (!files) {
    return null
  }

  return Array.isArray(files) ? files[0] ?? null : files
}

function handleSelect(event: FileUploadSelectEvent) {
  queuedFile.value = toSingleFile(event.files)
}

function handleUploader(event: FileUploadUploaderEvent) {
  const file = toSingleFile(event.files)

  if (!file || props.disabled) {
    return
  }

  emit('select', file)
}

function handleClear() {
  queuedFile.value = null
}

const phaseTone = computed(() => {
  if (props.uploadError) {
    return 'danger'
  }

  if (props.disabled) {
    return 'contrast'
  }

  return 'info'
})
</script>

<template>
  <div id="upload-panel" class="doc-fileupload glass-panel-strong rounded-[2rem] p-4 sm:p-6">
    <FileUpload
      mode="advanced"
      name="document"
      accept=".pdf,.png,.jpg,.jpeg,.txt"
      :multiple="false"
      :disabled="props.disabled"
      :custom-upload="true"
      :auto="true"
      choose-label="Choose document"
      :show-upload-button="false"
      :show-cancel-button="false"
      :max-file-size="104857600"
      class="w-full"
      :pt="{
        root: 'border-0 bg-transparent shadow-none',
        header: 'border-0 bg-transparent p-0',
        content: 'border-0 bg-transparent p-0',
      }"
      @select="handleSelect"
      @uploader="handleUploader"
      @clear="handleClear"
      @remove="handleClear"
    >
      <template #header="{ chooseCallback, clearCallback }">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="metric-orb">
                <i class="pi pi-cloud-upload" />
              </div>
              <StatusTag :label="props.uploadError ? 'Attention required' : props.disabled ? 'Transfer in flight' : 'Ready for intake'" :tone="phaseTone" />
            </div>
            <div class="space-y-3">
              <h2 class="hero-title !text-4xl sm:!text-5xl lg:!text-[3.7rem]">
                Drag a file into the glass lane and let the pipeline take over.
              </h2>
              <p class="max-w-3xl text-sm leading-7 text-muted-color sm:text-base">
                PrimeVue now drives the interaction surface while the existing signed-upload flow and SSE lifecycle stay exactly as they are.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <Button :disabled="props.disabled" label="Choose file" icon="pi pi-plus" @click="chooseCallback()" />
            <Button
              :disabled="!queuedFile || props.disabled"
              label="Reset queue"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="clearCallback()"
            />
          </div>
        </div>
      </template>

      <template #content="{ files, removeFileCallback }">
        <div class="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div class="rounded-[1.75rem] border border-dashed border-white/70 bg-white/60 p-6 backdrop-blur-xl transition dark:border-white/10 dark:bg-white/5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="eyebrow">Accepted payloads</p>
                <p class="mt-3 font-display text-2xl font-semibold text-color">PDF, PNG, JPEG, and plain text</p>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-color">
                  Single-file ingestion for the bootstrap flow. Drop directly onto this panel or use the chooser to trigger the custom uploader.
                </p>
              </div>
              <div class="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-color dark:border-white/10 dark:bg-white/5">
                Single file
              </div>
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.25rem] bg-white/70 p-4 dark:bg-white/5">
                <p class="text-xs uppercase tracking-[0.22em] text-muted-color">Transport</p>
                <p class="mt-2 text-sm font-semibold text-color">{{ props.uploadPhaseLabel }}</p>
              </div>
              <div class="rounded-[1.25rem] bg-white/70 p-4 dark:bg-white/5">
                <p class="text-xs uppercase tracking-[0.22em] text-muted-color">Current progress</p>
                <p class="mt-2 text-sm font-semibold text-color">{{ props.uploadProgress }}%</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-if="files.length > 0"
              class="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <div
                v-for="(file, index) in files"
                :key="`${file.name}-${file.size}-${index}`"
                class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-white/80 px-4 py-4 dark:bg-white/5"
              >
                <div class="min-w-0">
                  <p class="truncate font-semibold text-color">{{ file.name }}</p>
                  <p class="mt-1 text-xs uppercase tracking-[0.2em] text-muted-color">{{ Math.ceil(file.size / 1024) }} KB</p>
                </div>
                <Button text rounded severity="danger" icon="pi pi-times" @click="removeFileCallback(index)" />
              </div>
            </div>

            <Message
              v-if="props.uploadError"
              severity="error"
              :closable="false"
            >
              {{ props.uploadError }}
            </Message>
            <Message
              v-else
              severity="secondary"
              :closable="false"
            >
              The browser initiates the upload target, streams bytes to storage, and waits for worker events over SSE.
            </Message>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="mt-8 rounded-[1.75rem] border border-dashed border-white/80 bg-white/60 px-6 py-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/75 text-4xl text-primary shadow-glow dark:bg-white/10">
            <i class="pi pi-file-arrow-up" />
          </div>
          <p class="mt-6 font-display text-3xl font-semibold text-color">Drop a document here</p>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-color sm:text-base">
            The upload queue stays intentionally simple: one file in, one live document stream out.
          </p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
