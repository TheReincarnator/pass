import { create } from 'zustand'
// @ts-ignore
import deepClone from 'deep-clone'
import { decryptSafe, encryptSafe, getHashes } from './crypto'
import { updateSafe } from '@/actions/safe'

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

type Session = {
  email: string | null
  password: string | null
  version: number | null
  safe: Safe | null
  openFolders: number[]
  lastInteraction: number

  setSafe: (args: { email: string; password: string; version: number; encrypted: string }) => void
  touch: () => void
  logout: () => void
  persist: () => Promise<boolean>

  toggleFolder: (id: number) => void
  getParent: (id: number) => Folder | null
  getEntry: (id: number) => { entry: Entry; parentId: number | null } | null
  getFolder: (id: number) => { folder: Folder; parentId: number | null } | null
  generatePassword: () => string
  setEntry: (entry: Entry, parentId: number | null) => void
}

export const useSession = create<Session>((set, get) => ({
  email: null,
  password: null,
  version: null,
  safe: null,
  openFolders: [],
  lastInteraction: new Date().getTime(),

  setSafe: (args) => {
    const { email, password, version, encrypted } = args
    const safe = decryptSafe({ encrypted, email, password })
    // TODO: Remove
    // safe = {
    //   entries: [
    //     { type: 'folder', id: 1, name: 'Privat', created: 0, entries: [] },
    //     {
    //       type: 'folder',
    //       id: 2,
    //       name: 'Prämie Direkt',
    //       created: 0,
    //       entries: [
    //         {
    //           type: 'entry',
    //           id: 4,
    //           created: 0,
    //           name: 'Key 1',
    //           login: 'TheReincarnator',
    //           email: '',
    //           lastModified: 0,
    //           lastUsed: 0,
    //           url: '',
    //           notes: '',
    //           password: 'pass',
    //           oldPasswords: [],
    //         },
    //         {
    //           type: 'entry',
    //           id: 5,
    //           created: 0,
    //           name: 'Key 2',
    //           login: 'TheReincarnator',
    //           email: 'mail@',
    //           lastModified: 0,
    //           lastUsed: 0,
    //           url: '',
    //           notes: '',
    //           password: 'pass',
    //           oldPasswords: [],
    //         },
    //         {
    //           type: 'entry',
    //           id: 6,
    //           created: 0,
    //           name: 'Key 3',
    //           login: '',
    //           email: '',
    //           lastModified: 0,
    //           lastUsed: 0,
    //           url: '',
    //           notes: '',
    //           password: '',
    //           oldPasswords: [],
    //         },
    //       ],
    //     },
    //     { type: 'folder', id: 3, name: 'WTF', created: 0, entries: [] },
    //   ],
    // }
    set({ email, password, version, safe })
  },
  touch: () => set({ lastInteraction: new Date().getTime() }),
  logout: () => set({ email: null, password: null, version: null, safe: null }),
  persist: async () => {
    const { email, password, safe, version } = get()
    if (!email || !password || !safe || !version) {
      return false
    }
    const encrypted = encryptSafe({ email, password, safe })
    const { serverHash } = getHashes(email, password)
    const result = await updateSafe({ email, hash: serverHash, encrypted, version })
    return result.result === 'ok'
  },

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
    const generatorClasses = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      '!"§$%&/()={[]}\\?+*#\'-_.:,;<>|^',
    ]

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

export function bufferToBase64(buffer: ArrayBuffer | null | undefined): string | null {
  if (!buffer) {
    return null
  }
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
}
