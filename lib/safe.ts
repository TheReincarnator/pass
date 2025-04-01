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

  storeLogin: (args: {
    email: string
    password: string
    version: number
    encrypted: string
  }) => void
  touch: () => void
  logout: () => void
}

export const useSafeStore = create<SafeState>((set) => ({
  email: null,
  password: null,
  version: null,
  safe: null,
  lastInteraction: new Date().getTime(),

  storeLogin: (args) => {
    const { email, password, version, encrypted } = args
    let safe = decryptSafe({ encrypted, email, password })
    // TODO: Remove
    safe = {
      entries: [
        { type: 'folder', id: 1, name: 'Privat', created: 0, entries: [] },
        {
          type: 'folder',
          id: 2,
          name: 'Prämie Direkt',
          created: 0,
          entries: [
            {
              type: 'entry',
              id: 4,
              created: 0,
              name: 'Key 1',
              login: 'TheReincarnator',
              email: '',
              lastModified: 0,
              lastUsed: 0,
              url: '',
              notes: '',
              password: 'pass',
              oldPasswords: [],
            },
            {
              type: 'entry',
              id: 5,
              created: 0,
              name: 'Key 2',
              login: 'TheReincarnator',
              email: 'mail@',
              lastModified: 0,
              lastUsed: 0,
              url: '',
              notes: '',
              password: 'pass',
              oldPasswords: [],
            },
            {
              type: 'entry',
              id: 6,
              created: 0,
              name: 'Key 3',
              login: '',
              email: '',
              lastModified: 0,
              lastUsed: 0,
              url: '',
              notes: '',
              password: '',
              oldPasswords: [],
            },
          ],
        },
        { type: 'folder', id: 3, name: 'WTF', created: 0, entries: [] },
      ],
    }
    set({ email, password, version, safe })
  },
  touch: () => set({ lastInteraction: new Date().getTime() }),
  logout: () => set({ email: null, password: null, version: null, safe: null }),
}))

export function getEntry(safe: Safe, id: number): Entry | null {
  const result = getEntryOrFolder(safe.entries, id)
  return result?.type === 'entry' ? result : null
}

export function getFolder(safe: Safe, id: number): Folder | null {
  const result = getEntryOrFolder(safe.entries, id)
  return result?.type === 'folder' ? result : null
}

function getEntryOrFolder(entries: (Entry | Folder)[], id: number): Entry | Folder | null {
  let result: Entry | Folder | null = null
  entries.forEach((candidate) => {
    if (candidate.id === id) {
      result = candidate
    } else if (candidate.type === 'folder') {
      const subResult = getEntryOrFolder(candidate.entries, id)
      if (subResult) {
        result = subResult
      }
    }
  })
  return result
}

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
}): string {
  const { encrypted, email, clientKey } = arsg
  const iv = getIv(email)
  const decipher = crypto.createDecipheriv('aes-256-cbc', clientKey, iv)
  return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
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
