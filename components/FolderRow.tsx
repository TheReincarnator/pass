import { useSafeStore, type Folder } from '@/lib/safe'
import { EntryRow } from './EntryRow'
import { useRouter } from 'next/navigation'
import { Button } from './common/react/Button'

type Props = {
  folder: Folder
  indentation: number
}

export function FolderRow({ folder, indentation }: Props) {
  const router = useRouter()
  const { openFolders, toggleFolder } = useSafeStore((state) => state)
  const isOpen = openFolders.includes(folder.id)

  const handleEdit = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    router.push(`/folder/${folder.id}`)
  }

  return (
    <>
      <tr className="selectable" onClick={() => toggleFolder(folder.id)}>
        <td className="align-left">
          <i
            className={`fa fa-chevron-${isOpen ? 'down' : 'right'} ml-${indentation * 3} mr-2`}
          ></i>
          {folder.name}
        </td>

        <td className="align-right">
          <Button type="button" leftIcon="pencil" className="ml-2" onClick={handleEdit} />
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
