import { create } from 'zustand'
import crypto from 'crypto'
// @ts-ignore
import deepClone from 'deep-clone'

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
  openFolders: number[]
  lastInteraction: number

  storeLogin: (args: {
    email: string
    password: string
    version: number
    encrypted: string
  }) => void
  touch: () => void
  logout: () => void

  toggleFolder: (id: number) => void
  getParent: (id: number) => Folder | null
  getEntry: (id: number) => { entry: Entry; parentId: number | null } | null
  getFolder: (id: number) => { folder: Folder; parentId: number | null } | null
  generatePassword: () => string
  setEntry: (entry: Entry, parentId: number | null) => void
}

const generatorClasses = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  '!"§$%&/()={[]}\\?+*#\'-_.:,;<>|^°´`',
]

export const useSafeStore = create<SafeState>((set, get) => ({
  email: null,
  password: null,
  version: null,
  safe: null,
  openFolders: [],
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

  toggleFolder: (id: number) => {
    const openFolders = get().openFolders
    if (openFolders.includes(id)) {
      set({ openFolders: openFolders.filter((candidate) => candidate !== id) })
    } else {
      set({ openFolders: [...openFolders, id] })
    }
  },
  getParent: (id: number) => {
    return getParent(get().safe, id)
  },
  getEntry: (id: number) => {
    return getEntry(get().safe, id)
  },
  getFolder: (id: number) => {
    return getFolder(get().safe, id)
  },
  generatePassword: () => {
    const characters = []
    generatorClasses.forEach((generatorClass) => characters.push(pickCharacter(generatorClass)))
    while (characters.length < 16) {
      characters.push(pickCharacter(generatorClasses[randomInt(generatorClasses.length)]))
    }
    shuffle(characters)
    return characters.join('')
  },
  setEntry: (entry: Entry | Folder, parentId: number | null) => {
    const safe = deepClone(get().safe!)
    const previousParent = getParent(safe, entry.id)
    if (previousParent && previousParent.id !== parentId) {
      previousParent.entries = previousParent.entries.filter(
        (candidate) => candidate.id !== entry.id,
      )
    }
    if (!previousParent || previousParent.id !== parentId) {
      const newParent = parentId ? getParent(safe, parentId) : null
      const newParentEntries = newParent?.entries || safe.entries
      newParentEntries.push(entry)
    } else {
      const position = previousParent.entries.findIndex((predicate) => predicate.id === entry.id)
      previousParent.entries[position] = entry
    }
    set({ safe })
  },
}))

function shuffle(array: unknown[]) {
  let currentIndex = array.length
  while (currentIndex > 0) {
    const randomIndex = randomInt(currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
}

function pickCharacter(generatorClass: string): string {
  return generatorClass.charAt(randomInt(generatorClass.length))
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function getParent(safe: Safe | null | undefined, id: number): Folder | null {
  const result = getEntryOrFolder(safe?.entries, null, id)
  return result?.parent ?? null
}

function getEntry(
  safe: Safe | null | undefined,
  id: number,
): { entry: Entry; parentId: number | null } | null {
  const result = getEntryOrFolder(safe?.entries, null, id)
  return result?.match?.type === 'entry'
    ? { entry: result.match, parentId: result.parent?.id || null }
    : null
}

function getFolder(
  safe: Safe | null | undefined,
  id: number,
): { folder: Folder; parentId: number | null } | null {
  const result = getEntryOrFolder(safe?.entries, null, id)
  return result?.match?.type === 'folder'
    ? { folder: result.match, parentId: result.parent?.id || null }
    : null
}

function getEntryOrFolder(
  entries: (Entry | Folder)[] | undefined | null,
  parent: Folder | null,
  id: number,
): { match: Entry | Folder; parent: Folder | null } | null {
  let result: { match: Entry | Folder; parent: Folder | null } | null = null
  entries?.forEach((candidate) => {
    if (candidate.id === id) {
      result = { match: candidate, parent }
    } else if (candidate.type === 'folder') {
      const subResult = getEntryOrFolder(candidate.entries, candidate, id)
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
