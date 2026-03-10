import { config as loadEnv } from 'dotenv'
import docuFlowPreset from './app/theme/docuflow-preset'

loadEnv({ path: '../../.env' })

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-12-01',
  modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module'],
  css: ['primeicons/primeicons.css', '~/assets/css/tailwind.css'],
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: docuFlowPreset,
        options: {
          darkModeSelector: 'system',
          cssLayer: {
            name: 'primevue',
            order: 'base, primevue, components, utilities',
          },
        },
      },
    },
  },
  build: {
    transpile: ['@docuflow/shared'],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001',
    },
  },
})
