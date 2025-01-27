'use client'

import EntryRow from '@/components/EntryRow'
import type { ToggleApi } from '@/components/FolderRow'
import FolderRow, { ToggleContext } from '@/components/FolderRow'
import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function List() {
  const router = useRouter()
  const { safe } = useSafeStore((state) => state)
  // const safe: Safe = {
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

  const [openFolders, setOpenFolders] = useState<number[]>([])

  const toggleApi: ToggleApi = {
    openFolders,
    open: (id: number) => {
      const copy = openFolders.filter((candidate) => candidate !== id)
      setOpenFolders([...copy, id])
    },
    close: (id: number) => {
      const copy = openFolders.filter((candidate) => candidate !== id)
      setOpenFolders(copy)
    },
  }

  useEffect(() => {
    if (!safe) {
      router.push('/')
    }
  }, [])

  if (!safe) {
    return null
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title mx-n2">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">
        <div className="table-wrapper mx-n2">
          <table>
            <tbody>
              <ToggleContext.Provider value={toggleApi}>
                {safe.entries.map((child) =>
                  child.type === 'folder' ? (
                    <FolderRow key={child.id} folder={child} indentation={0} />
                  ) : (
                    <EntryRow key={child.id} entry={child} indentation={0} />
                  ),
                )}
              </ToggleContext.Provider>
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}
