import type { Folder } from '@/lib/safe'
import { createContext, useContext } from 'react'
import EntryRow from './EntryRow'
import { useRouter } from 'next/navigation'

export type ToggleApi = {
  openFolders: number[]
  open: (id: number) => void
  close: (id: number) => void
}

export const ToggleContext = createContext<ToggleApi>({
  openFolders: [],
  open: () => {},
  close: () => {},
})

export default function FolderRow(props: { folder: Folder; indentation: number }) {
  const { folder, indentation } = props

  const router = useRouter()
  const { openFolders, open, close } = useContext(ToggleContext)

  const isOpen = openFolders.includes(folder.id)

  const handleEdit = () => {
    router.push(`/folder/${folder.id}`)
  }

  return (
    <>
      <tr className="selectable">
        <td className="align-left" onClick={() => (isOpen ? close(folder.id) : open(folder.id))}>
          <i
            className={`fa fa-chevron-${isOpen ? 'down' : 'right'} ml-${indentation * 3} mr-2`}
          ></i>
          {folder.name}
        </td>
        <td className="align-right">
          <button type="button" className="button-icon-only ml-2" onClick={handleEdit}>
            <i className="fa fa-pencil"></i>
          </button>
        </td>
      </tr>
      {isOpen &&
        folder.entries.map((child) =>
          child.type === 'folder' ? (
            <FolderRow key={child.id} folder={child} indentation={indentation + 1} />
          ) : (
            <EntryRow key={child.id} entry={child} indentation={indentation + 1} />
          ),
        )}
    </>
  )
}
