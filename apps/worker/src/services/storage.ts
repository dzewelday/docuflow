import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { env } from '../config/env.js'

export async function readStoredObject(storageKey: string) {
  const root = path.resolve(env.localStorageDir)
  const filePath = path.resolve(root, storageKey)

  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
    throw new Error('Storage key resolves outside the worker storage root.')
  }

  return readFile(filePath)
}
