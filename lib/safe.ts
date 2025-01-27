import { create } from 'zustand'
import crypto from 'crypto'

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
  email: string | null
  password: string | null
  version: number | null
  safe: Safe | null
  lastInteraction: number

  onLogin: (args: { email: string; password: string; version: number; encrypted: string }) => void
  touch: () => void
  logout: () => void
}

export const useSafeStore = create<SafeState>((set) => ({
  email: null,
  password: null,
  version: null,
  safe: null,
  lastInteraction: new Date().getTime(),

  onLogin: (args) => {
    const { email, password, version, encrypted } = args
    set({ email, password, version, safe: decrypt(encrypted, email, password) })
  },
  touch: () => set({ lastInteraction: new Date().getTime() }),
  logout: () => set({ email: null, password: null, version: null, safe: null }),
}))

export function encrypt(
  safe: Safe | null,
  email: string,
  password: string,
): { encrypted: string; hash: string } {
  const json = JSON.stringify(safe || { type: 'pass-safe', entries: [] })
  const iv = getIv(email)
  const singleHash = hashString(password)
  const doubleHash = hashString(singleHash + email)
  const cipher = crypto.createCipheriv('aes-256-cbc', singleHash, iv)
  const encrypted = cipher.update(json, 'utf8', 'base64') + cipher.final('base64')
  return { encrypted, hash: doubleHash }
}

export function decrypt(encrypted: string, email: string, password: string): Safe {
  const iv = getIv(email)
  const singleHash = hashString(password)
  const decipher = crypto.createDecipheriv('aes-256-cbc', singleHash, Buffer.from(iv, 'base64'))
  const json = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
  return JSON.parse(json)
}

export function hashString(password: string): string {
  const hash = crypto.createHash('sha256')
  return hash.update(password).digest('hex').substring(0, 32)
}

export function getIv(email: string) {
  return hashString(email).split('').reverse().join('').substring(0, 16)
}
