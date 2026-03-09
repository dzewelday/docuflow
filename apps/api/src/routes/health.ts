import { Hono } from 'hono'

import { HelloResponseSchema } from '@docuflow/shared'

export const healthRoutes = new Hono()

healthRoutes.get('/health', (c) => {
  return c.json(
    HelloResponseSchema.parse({
      message: 'Hello from DocuFlow API',
    }),
  )
})
