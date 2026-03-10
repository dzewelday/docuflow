<script setup lang="ts">
const props = withDefaults(defineProps<{
  eyebrow: string
  title: string
  body?: string
  icon?: string
  variant?: 'glass' | 'dark'
}>(), {
  body: undefined,
  icon: undefined,
  variant: 'glass',
})

const rootClass = computed(() => (
  props.variant === 'dark'
    ? 'glass-panel-dark'
    : 'glass-panel'
))
</script>

<template>
  <Card class="prime-glass-card h-full">
    <template #content>
      <article :class="rootClass" class="h-full rounded-[1.75rem] p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div v-if="props.icon" class="metric-orb">
                <i :class="props.icon" />
              </div>
              <span class="eyebrow" :class="props.variant === 'dark' ? '!text-white/60' : ''">{{ props.eyebrow }}</span>
            </div>
            <div>
              <h3 class="font-display text-2xl font-semibold tracking-[-0.03em]" :class="props.variant === 'dark' ? 'text-white' : 'text-ink dark:text-white'">
                {{ props.title }}
              </h3>
              <p v-if="props.body" class="mt-2 text-sm leading-6" :class="props.variant === 'dark' ? 'text-white/70' : 'text-muted-color'">
                {{ props.body }}
              </p>
            </div>
          </div>

          <slot name="actions" />
        </div>

        <div class="mt-5">
          <slot />
        </div>
      </article>
    </template>
  </Card>
</template>
