import { create } from 'zustand'

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
  setSafe: (newSafe: Safe | null) => void
}

export const useSafeStore = create<SafeState>((set) => ({
  safe: null,
  setSafe: (newSafe) => set({ safe: newSafe }),
}))
