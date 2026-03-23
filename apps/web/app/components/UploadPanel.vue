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
  <div id="upload-panel" class="doc-fileupload glass-panel-strong rounded-[2rem] p-5 sm:p-7">
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
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <StatusTag :label="props.uploadError ? 'Needs attention' : props.disabled ? 'Uploading' : 'Ready'" :tone="phaseTone" />
                <span class="eyebrow">Upload</span>
              </div>
              <div class="space-y-3">
                <h2 class="hero-title !text-[2.7rem] sm:!text-[3.6rem] lg:!text-[4.4rem]">
                  Drop a file and review the result.
                </h2>
                <p class="max-w-2xl text-sm leading-7 text-muted-color sm:text-base">
                  Keep it simple: one file at a time, with progress and output always visible.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <Button :disabled="props.disabled" label="Choose file" icon="pi pi-plus" @click="chooseCallback()" />
              <Button
                :disabled="!queuedFile || props.disabled"
                label="Clear"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="clearCallback()"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-[1.4rem] border border-black/5 bg-white/72 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-muted-color">Accepted</p>
              <p class="mt-2 text-sm font-semibold text-color">PDF, images, and text</p>
            </div>
            <div class="rounded-[1.4rem] border border-black/5 bg-white/72 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-muted-color">Status</p>
              <p class="mt-2 text-sm font-semibold text-color">{{ props.uploadPhaseLabel }}</p>
            </div>
            <div class="rounded-[1.4rem] border border-black/5 bg-white/72 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-muted-color">Progress</p>
              <p class="mt-2 text-sm font-semibold text-color">{{ props.uploadProgress }}%</p>
            </div>
          </div>
        </div>
      </template>

      <template #content="{ files, removeFileCallback }">
        <div class="mt-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div class="rounded-[1.75rem] border border-dashed border-black/10 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
            <div class="space-y-3">
              <p class="eyebrow">Queue</p>
              <p class="font-display text-2xl font-semibold tracking-[-0.04em] text-color">
                {{ files.length > 0 ? 'Ready to send' : 'Waiting for a file' }}
              </p>
              <p class="max-w-xl text-sm leading-6 text-muted-color">
                {{ files.length > 0 ? 'Your selected file is below. Upload starts automatically.' : 'Drag a file here or choose one from your device.' }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-if="files.length > 0"
              class="rounded-[1.75rem] border border-black/6 bg-white/78 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div
                v-for="(file, index) in files"
                :key="`${file.name}-${file.size}-${index}`"
                class="flex items-center justify-between gap-4 rounded-[1.25rem] border border-black/5 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]"
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
              Uploads run one file at a time.
            </Message>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="mt-8 rounded-[1.85rem] border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-black/5 bg-white/80 text-4xl text-primary shadow-[0_16px_40px_rgba(201,122,16,0.16)] dark:border-white/10 dark:bg-white/[0.06]">
            <i class="pi pi-file-arrow-up" />
          </div>
          <p class="mt-6 font-display text-3xl font-semibold tracking-[-0.04em] text-color">Drop a document here</p>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-color sm:text-base">
            Choose one file to start, then stay on this page while the result fills in.
          </p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
