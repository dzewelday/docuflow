<script setup lang="ts">
import { CloudUpload, FileText } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [file: File]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function handleFiles(fileList: FileList | null) {
  const file = fileList?.[0]

  if (!file || props.disabled) {
    return
  }

  emit('select', file)
}

function openPicker() {
  if (props.disabled) {
    return
  }

  inputRef.value?.click()
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  handleFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <section
    class="rounded-[2rem] border border-dashed border-ink/20 bg-white/80 p-6 shadow-panel transition sm:p-8"
    :class="{
      'border-ember bg-white': isDragging,
      'cursor-not-allowed opacity-70': disabled,
      'cursor-pointer': !disabled,
    }"
    role="button"
    tabindex="0"
    @click="openPicker"
    @keyup.enter="openPicker"
    @keyup.space.prevent="openPicker"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="inputRef"
      class="hidden"
      type="file"
      accept=".pdf,.png,.jpg,.jpeg,.txt"
      @change="handleFiles(($event.target as HTMLInputElement).files)"
    >

    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-4">
        <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/40 text-ink">
          <CloudUpload class="h-7 w-7" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-semibold text-ink">Drop a document to start the pipeline</h2>
          <p class="max-w-2xl text-sm leading-6 text-ink/70 sm:text-base">
            Accepts a single file for the initial bootstrap flow. Manual selection works as a fallback if drag and drop is unavailable.
          </p>
        </div>
      </div>

      <div class="rounded-[1.5rem] border border-ink/10 bg-sand/80 p-4 text-sm text-ink/75">
        <div class="flex items-center gap-3">
          <FileText class="h-5 w-5 text-ember" />
          <span>PDF, PNG, JPEG, or plain text</span>
        </div>
      </div>
    </div>
  </section>
</template>
