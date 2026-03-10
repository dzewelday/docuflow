<script setup lang="ts">
import type { DocumentStatus } from '@docuflow/shared'

const props = defineProps<{
  currentStatus: DocumentStatus | null | undefined
  uploadPhaseLabel: string
  uploadProgress: number
}>()

const stages = [
  { label: 'Initiated', status: 'PENDING_UPLOAD', caption: 'Signed target created' },
  { label: 'Stored', status: 'UPLOADED', caption: 'Blob committed' },
  { label: 'Processing', status: 'PROCESSING', caption: 'Worker extraction live' },
  { label: 'Completed', status: 'COMPLETED', caption: 'Structured output ready' },
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
            <p class="text-sm font-semibold text-color">{{ item.status }}</p>
            <p class="text-xs leading-5 text-muted-color">
              {{ props.currentStatus === 'FAILED' && index === 2 ? 'Pipeline stopped before completion' : item.caption }}
            </p>
          </div>
        </template>
      </Timeline>
    </div>

    <div class="glass-panel-dark rounded-[1.75rem] p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="eyebrow !text-white/50">Upload transport</p>
          <p class="mt-2 font-display text-2xl font-semibold text-white">Live transfer</p>
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
        <span>Payload</span>
        <span>{{ props.uploadProgress }}%</span>
      </div>
    </div>
  </div>
</template>
