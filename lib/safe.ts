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
    set({ email, password, version, safe: decryptSafe({ encrypted, email, password }) })
  },
  touch: () => set({ lastInteraction: new Date().getTime() }),
  logout: () => set({ email: null, password: null, version: null, safe: null }),
}))

export function encryptSafe(args: { safe?: Safe; email: string; password: string }): string {
  const { safe, email, password } = args
  const json = JSON.stringify(safe || { type: 'pass-safe', entries: [] })
  const iv = getIv(email)
  const { clientHash } = getHashes(email, password)
  const cipher = crypto.createCipheriv('aes-256-cbc', clientHash, iv)
  return cipher.update(json, 'utf8', 'base64') + cipher.final('base64')
}

export function decryptSafe(args: { encrypted: string; email: string; password: string }): Safe {
  const { encrypted, email, password } = args
  const iv = getIv(email)
  const singleHash = hashString(password)
  const decipher = crypto.createDecipheriv('aes-256-cbc', singleHash, iv)
  const json = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
  return JSON.parse(json)
}

export function encryptPassword(args: {
  email: string
  password: string
  clientKey: string
}): string {
  const { email, password, clientKey } = args
  const iv = getIv(email)
  const cipher = crypto.createCipheriv('aes-256-cbc', clientKey, iv)
  return cipher.update(password, 'utf8', 'base64') + cipher.final('base64')
}

export function decryptPassword(arsg: {
  encrypted: string
  email: string
  clientKey: string
}): Safe {
  const { encrypted, email, clientKey } = arsg
  const iv = getIv(email)
  const decipher = crypto.createDecipheriv('aes-256-cbc', clientKey, iv)
  const json = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
  return JSON.parse(json)
}

export function getHashes(
  email: string,
  password: string,
): { clientHash: string; serverHash: string } {
  const clientHash = hashString(password)
  const serverHash = hashString(clientHash + email)
  return { clientHash, serverHash }
}

export function getIv(email: string) {
  return Buffer.from(hashString(email).split('').reverse().join(''), 'hex')
}

export function bufferToBase64(buffer: ArrayBuffer | null | undefined): string | null {
  if (!buffer) {
    return null
  }
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
}

function hashString(password: string): string {
  const hash = crypto.createHash('sha256')
  return hash.update(password).digest('hex').substring(0, 32)
}
