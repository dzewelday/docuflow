<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  tone?: 'accent' | 'success' | 'warn' | 'danger' | 'info' | 'neutral' | 'contrast'
}>(), {
  tone: 'neutral',
})

const severity = computed(() => {
  switch (props.tone) {
    case 'success':
      return 'success'
    case 'warn':
      return 'warn'
    case 'danger':
      return 'danger'
    case 'info':
      return 'info'
    case 'contrast':
      return 'contrast'
    case 'accent':
      return null
    default:
      return 'secondary'
  }
})

const customClass = computed(() => {
  if (props.tone === 'accent') {
    return '!bg-primary !text-primary-contrast'
  }

  if (props.tone === 'neutral') {
    return '!bg-white/70 !text-ink dark:!bg-white/10 dark:!text-white'
  }

  return ''
})
</script>

<template>
  <Tag
    :value="props.label"
    :severity="severity ?? undefined"
    rounded
    class="!px-3 !py-1.5 !text-[0.72rem] !font-bold !uppercase !tracking-[0.22em]"
    :class="customClass"
  />
</template>
