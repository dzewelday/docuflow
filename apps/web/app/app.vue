<script setup lang="ts">
const { isDark, themeMode } = useThemeMode()

useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : undefined)),
    style: computed(() => `color-scheme:${themeMode.value};`),
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
