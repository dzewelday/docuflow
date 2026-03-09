import { config as loadEnv } from 'dotenv'

loadEnv({ path: '../../.env' })

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-12-01',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],
  build: {
    transpile: ['@docuflow/shared'],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001',
    },
  },
})
