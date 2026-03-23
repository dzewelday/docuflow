<script setup lang="ts">
const { isDark, toggleThemeMode } = useThemeMode()

const themeLabel = computed(() => (isDark.value ? 'Dark' : 'Light'))
const themeIcon = computed(() => (isDark.value ? 'pi pi-moon' : 'pi pi-sun'))
</script>

<template>
  <div class="app-shell">
    <div class="shell-noise pointer-events-none absolute inset-0 opacity-50" />
    <div class="relative mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Toast position="top-right" />

      <header class="glass-panel-strong flex flex-col gap-6 rounded-[2rem] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <Tag value="DocuFlow" rounded class="!bg-primary !text-primary-contrast !font-bold !px-4 !py-2" />
            <span class="eyebrow">Workspace</span>
          </div>
          <div class="space-y-2">
            <p class="font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.045em] text-ink sm:text-[2.5rem] dark:text-white">
              Bring in a file. Keep the latest result in view.
            </p>
            <p class="max-w-2xl text-sm leading-6 text-muted-color sm:text-base">
              The screen stays focused on uploading, checking progress, and reviewing the output.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <Button
            :label="themeLabel"
            :icon="themeIcon"
            severity="secondary"
            outlined
            @click="toggleThemeMode()"
          />
          <Button as="a" href="#upload-panel" label="Upload file" icon="pi pi-arrow-up-right" />
        </div>
      </header>

      <main class="flex-1 py-6 sm:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
