<script setup lang="ts">
const props = defineProps<{
  eyebrow: string
  title: string
  body?: string
  icon?: string
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <div v-if="props.icon" class="metric-orb">
        <i :class="props.icon" />
      </div>
      <span class="eyebrow">{{ props.eyebrow }}</span>
    </div>
    <div class="space-y-3">
      <h2 class="section-title">{{ props.title }}</h2>
      <p v-if="props.body" class="max-w-3xl text-sm leading-7 text-muted-color sm:text-base">
        {{ props.body }}
      </p>
    </div>
  </div>
</template>
