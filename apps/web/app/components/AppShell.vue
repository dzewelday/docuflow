<template>
  <div class="app-shell">
    <div class="shell-noise pointer-events-none absolute inset-0 opacity-70" />
    <div class="relative mx-auto flex min-h-screen w-full max-w-[92rem] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Toast position="top-right" />

      <header class="glass-panel-strong flex flex-col gap-5 rounded-[2rem] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <Tag value="DocuFlow" rounded class="!bg-primary !text-primary-contrast !font-bold !px-4 !py-2" />
            <span class="eyebrow">PrimeVue design system</span>
          </div>
          <div>
            <p class="font-display text-2xl font-semibold tracking-[-0.04em] text-ink dark:text-white">
              Document intelligence with a clearer command surface.
            </p>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-muted-color">
              Upload, monitor, and inspect extraction results in a single glass-layered dashboard built for live pipeline feedback.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <Tag severity="contrast" rounded value="System dark mode" class="!px-4 !py-2 !font-semibold" />
          <Button as="a" href="#upload-panel" label="Start upload" icon="pi pi-arrow-up-right" />
        </div>
      </header>

      <main class="flex-1 py-6 sm:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
