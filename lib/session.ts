import { create } from 'zustand'
// @ts-ignore
import deepClone from 'deep-clone'
import { decryptSafe, encryptSafe, getHashes } from './crypto'
import { updateSafe } from '@/actions/safe'
import { persist, createJSONStorage } from 'zustand/middleware'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Entry = {
  type: 'entry'
  id: number
  created: number
  lastModified: number
  lastUsed: number
  name: string
  login: string
  email: string
  password: string
  url: string
  oldPasswords: string[]
  notes: string
}
export type PartialEntry = PartialBy<
  Entry,
  'id' | 'oldPasswords' | 'created' | 'lastModified' | 'lastUsed'
>

export type Folder = {
  type: 'folder'
  id: number
  created: number
  name: string
  entries: (Entry | Folder)[]
}
export type PartialFolder = PartialBy<Folder, 'id' | 'entries' | 'created'>

export type Safe = { entries: (Entry | Folder)[] }

type Session = {
  email: string | null
  password: string | null
  isPasskeyLogin: boolean
  version: number | null
  safe: Safe | null
  nextId: number
  openFolders: number[]
  lastInteraction: number

  setSafe: (args: {
    email: string
    password: string
    version: number
    encrypted: string
    isPasskeyLogin: boolean
  }) => void
  setPasskeyLogin: (isPasskeyLogin: boolean) => void
  touch: () => void
  logout: () => void
  persist: () => Promise<boolean>

  deleteEntry: (id: number) => void
  generateId: () => number
  generatePassword: () => string
  getEntry: (id: number) => { entry: Entry; parentId: number | null } | null
  getFolder: (id: number) => { folder: Folder; parentId: number | null } | null
  getFolders: (args?: { excludeAncestorsOf?: number }) => Folder[]
  getParent: (id: number) => Folder | null
  setEntry: (partialEntry: PartialEntry | PartialFolder, parentId: number | null) => Entry | Folder
  toggleFolder: (id: number) => void
}

export const useSession = create<Session>()(
  persist(
    (set, get) => ({
      email: null,
      password: null,
      isPasskeyLogin: false,
      version: null,
      safe: null,
      nextId: 0,
      openFolders: [],
      lastInteraction: new Date().getTime(),

      setSafe: (args) => {
        const { email, password, isPasskeyLogin, version, encrypted } = args
        const safe = decryptSafe({ encrypted, email, password })
        set({ email, password, isPasskeyLogin, version, safe })
      },
      setPasskeyLogin: (isPasskeyLogin: boolean) => {
        set({ isPasskeyLogin })
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
        if (result.result === 'ok') {
          set({ version: version + 1 })
        }
        return result.result === 'ok'
      },

      deleteEntry: (id: number) => {
        const safe = deepClone(get().safe!)
        const parent = getParent(safe, id)
        if (parent) {
          parent.entries = parent.entries.filter((candidate) => candidate.id !== id)
          set({ safe })
        }
      },
      generateId: () => {
        const result = get().nextId
        set({ nextId: result + 1 })
        return result
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
      getEntry: (id: number) => {
        return getEntry(get().safe, id)
      },
      getFolder: (id: number) => {
        return getFolder(get().safe, id)
      },
      getFolders: (args) => {
        const { excludeAncestorsOf } = args || {}
        return getFolders(get().safe?.entries, excludeAncestorsOf)
      },
      getParent: (id: number) => {
        return getParent(get().safe, id)
      },
      setEntry: (partialEntry: PartialEntry | PartialFolder, parentId: number | null) => {
        const safe = deepClone(get().safe!) as Safe
        const now = new Date().getTime()
        const entry =
          partialEntry.type === 'entry'
            ? {
                ...partialEntry,
                id: partialEntry.id || get().generateId(),
                created: partialEntry.created || now,
                lastModified: partialEntry.lastModified || now,
                lastUsed: partialEntry.lastUsed || now,
                oldPasswords: partialEntry.oldPasswords || [],
              }
            : {
                ...partialEntry,
                id: partialEntry.id || get().generateId(),
                created: partialEntry.created || now,
                entries: partialEntry.entries || [],
              }

        const previousParent = partialEntry.id ? (getParent(safe, partialEntry.id) ?? safe) : safe
        previousParent.entries = previousParent.entries.filter(
          (candidate) => candidate.id !== partialEntry.id,
        )

        const newParent = parentId ? (getFolder(safe, parentId)?.folder ?? safe) : safe
        newParent.entries.push(entry)
        newParent.entries.sort((a, b) => {
          if (a.type !== b.type) {
            return b.type.localeCompare(a.type)
          }
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        })

        set({ safe })
        return entry
      },
      toggleFolder: (id: number) => {
        const openFolders = get().openFolders
        if (openFolders.includes(id)) {
          set({ openFolders: openFolders.filter((candidate) => candidate !== id) })
        } else {
          set({ openFolders: [...openFolders, id] })
        }
      },
    }),
    { name: 'pass-safe-session', storage: createJSONStorage(() => sessionStorage) },
  ),
)

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

function getFolders(
  entries: (Entry | Folder)[] | undefined | null,
  excludeAncestorsOf?: number,
): Folder[] {
  if (!entries) {
    return []
  }
  return entries
    .filter((entry) => entry.type === 'folder')
    .filter((entry) => !excludeAncestorsOf || entry.id !== excludeAncestorsOf)
    .flatMap((folder) => [folder, ...getFolders(folder.entries, excludeAncestorsOf)])
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
