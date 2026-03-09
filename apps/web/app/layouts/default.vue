<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent" />
    <div class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
      <header class="flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-panel backdrop-blur">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-ink/55">DocuFlow</p>
          <h1 class="text-lg font-semibold text-ink">Document Intelligence</h1>
        </div>
        <div class="rounded-full border border-ink/10 bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Bootstrap
        </div>
      </header>

      <main class="flex-1 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
