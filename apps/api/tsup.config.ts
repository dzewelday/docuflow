import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ['@docuflow/shared'],
  external: ['@prisma/client'],
})
