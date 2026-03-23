<script setup lang="ts">
import type { DocumentSummary } from '@docuflow/shared'

const props = defineProps<{
  documents: DocumentSummary[]
  activeDocumentId?: string | null
}>()

const emit = defineEmits<{
  select: [documentId: string]
}>()

function formatStatus(status: DocumentSummary['status']) {
  switch (status) {
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
      return status
  }
}
</script>

<template>
  <div class="doc-listbox">
    <Listbox
      :model-value="props.activeDocumentId"
      :options="props.documents"
      option-label="filename"
      option-value="id"
      filter
      filter-placeholder="Search recent files"
      empty-message="Recent files show up here."
      class="w-full"
      :pt="{
        root: 'glass-panel rounded-[1.75rem] border-0 p-2',
        header: 'px-2 pb-3 pt-2',
        pcFilterContainer: { root: 'w-full rounded-full border border-black/6 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]' },
        pcFilter: { root: 'w-full rounded-full border-0 bg-transparent px-4 py-3 text-sm text-color shadow-none' },
        listContainer: 'rounded-[1.25rem]',
        option: 'rounded-[1.25rem] border border-transparent px-4 py-4 transition',
        emptyMessage: 'rounded-[1.25rem] px-4 py-6 text-sm text-muted-color',
      }"
      @update:model-value="emit('select', $event)"
    >
      <template #option="{ option, selected }">
        <div class="flex items-start justify-between gap-4" :class="selected ? 'text-primary-contrast' : 'text-color'">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ option.filename }}</p>
            <p class="mt-1 text-xs uppercase tracking-[0.22em]" :class="selected ? 'text-primary-contrast/70' : 'text-muted-color'">
              {{ formatStatus(option.status) }}
            </p>
            <p class="mt-3 text-xs" :class="selected ? 'text-primary-contrast/70' : 'text-muted-color'">
              {{ new Date(option.createdAt).toLocaleString() }}
            </p>
          </div>
          <i class="pi pi-arrow-up-right text-sm" :class="selected ? 'text-primary-contrast' : 'text-primary'" />
        </div>
      </template>
    </Listbox>
  </div>
</template>
