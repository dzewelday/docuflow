<script setup lang="ts">
import type { DocumentStatus } from '@docuflow/shared'

const props = defineProps<{
  currentStatus: DocumentStatus | null | undefined
  uploadPhaseLabel: string
  uploadProgress: number
}>()

const stages = [
  { label: 'Queued', status: 'PENDING_UPLOAD', caption: 'File received' },
  { label: 'Saved', status: 'UPLOADED', caption: 'Stored successfully' },
  { label: 'Reading', status: 'PROCESSING', caption: 'Working through content' },
  { label: 'Ready', status: 'COMPLETED', caption: 'Result available' },
] as const satisfies Array<{ label: string; status: DocumentStatus; caption: string }>

const currentStageIndex = computed(() => {
  const status = props.currentStatus
  const order: DocumentStatus[] = ['PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'COMPLETED']
  const index = status ? order.indexOf(status) : -1

  return index === -1 && status === 'FAILED' ? 2 : index
})

function stageTone(index: number) {
  if (props.currentStatus === 'FAILED' && index === 2) {
    return 'bg-danger text-white'
  }

  if (index <= currentStageIndex.value) {
    return 'bg-primary text-primary-contrast shadow-glow'
  }

  return 'bg-white/75 text-muted-color dark:bg-white/10 dark:text-white/60'
}

function connectorTone(index: number) {
  if (props.currentStatus === 'FAILED' && index < 2) {
    return 'bg-danger/50'
  }

  if (index < currentStageIndex.value) {
    return 'bg-primary/60'
  }

  return 'bg-white/60 dark:bg-white/10'
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.5fr_0.72fr]">
    <div class="glass-panel rounded-[1.75rem] p-5 sm:p-6">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="eyebrow">Progress</p>
          <p class="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-color">Track the current file</p>
        </div>
        <StatusTag
          :label="props.currentStatus === 'FAILED' ? 'Stopped' : props.currentStatus === 'COMPLETED' ? 'Ready' : props.currentStatus ? 'In progress' : 'Waiting'"
          :tone="props.currentStatus === 'FAILED' ? 'danger' : props.currentStatus === 'COMPLETED' ? 'success' : props.currentStatus ? 'info' : 'neutral'"
        />
      </div>

      <Timeline
        :value="stages"
        align="top"
        layout="horizontal"
        class="overflow-x-auto"
        :pt="{
          root: 'min-w-[42rem]',
          event: 'min-w-[9.5rem]',
          eventSeparator: 'mx-0',
          eventConnector: 'h-[2px] rounded-full',
          eventContent: 'pt-4',
          eventOpposite: 'hidden',
        }"
      >
        <template #marker="{ index }">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition" :class="stageTone(index)">
            {{ index + 1 }}
          </div>
        </template>

        <template #connector="{ index }">
          <div class="h-[2px] w-full rounded-full" :class="connectorTone(index)" />
        </template>

        <template #content="{ item, index }">
          <div class="space-y-2 pr-4">
            <p class="eyebrow">{{ item.label }}</p>
            <p class="text-sm font-semibold text-color">
              {{ props.currentStatus === item.status ? 'Current step' : index < currentStageIndex ? 'Done' : 'Up next' }}
            </p>
            <p class="text-xs leading-5 text-muted-color">
              {{ props.currentStatus === 'FAILED' && index === 2 ? 'Stopped before the result was ready.' : item.caption }}
            </p>
          </div>
        </template>
      </Timeline>
    </div>

    <div class="glass-panel-dark rounded-[1.75rem] p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="eyebrow !text-white/50">Transfer</p>
          <p class="mt-2 font-display text-2xl font-semibold text-white">Upload status</p>
        </div>
        <i class="pi pi-wave-pulse text-2xl text-primary" />
      </div>

      <p class="mt-5 text-sm leading-6 text-white/70">{{ props.uploadPhaseLabel }}</p>
      <ProgressBar
        :value="props.uploadProgress"
        class="mt-5 overflow-hidden rounded-full"
        :pt="{
          root: 'h-3 rounded-full bg-white/10',
          value: 'rounded-full bg-primary',
          label: 'hidden',
        }"
      />
      <div class="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/50">
        <span>Current file</span>
        <span>{{ props.uploadProgress }}%</span>
      </div>
    </div>
  </div>
</template>
