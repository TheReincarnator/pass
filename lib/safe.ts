import { create } from 'zustand'
import crypto from 'crypto-js'

export type Entry = {
  type: 'entry'
  id: number
  name: string
  login: string
  email: string
  password: string
  url: string
  oldPasswords: string[]
  notes: string
  created: number
  lastModified: number
  lastUsed: number
}

export type Folder = {
  type: 'folder'
  id: number
  name: string
  created: number
  entries: (Entry | Folder)[]
}

export type Safe = { entries: (Entry | Folder)[] }

type SafeState = {
  safe: Safe | null
  lastInteraction: number
  touch: () => void
  setSafe: (newSafe: Safe | null) => void
}

export const useSafeStore = create<SafeState>((set) => ({
  safe: null,
  lastInteraction: new Date().getTime(),
  setSafe: (newSafe) => set({ safe: newSafe, lastInteraction: new Date().getTime() }),
  touch: () => set({ lastInteraction: new Date().getTime() }),
}))

export function hashPassword(password: string): string {
  return crypto.SHA256(password).toString(crypto.enc.Hex)
}
