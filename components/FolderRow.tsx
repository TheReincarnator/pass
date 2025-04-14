import { useSession, type Folder } from '@/lib/session'
import { EntryRow } from './EntryRow'
import { useRouter } from 'next/navigation'
import { Button } from './common/react/Button'

type Props = {
  folder: Folder
  indentation: number
}

export function FolderRow({ folder, indentation }: Props) {
  const router = useRouter()
  const { openFolders, toggleFolder } = useSession((state) => state)
  const isOpen = openFolders.includes(folder.id)

  const handleAddEntry = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    router.push(`/entry/new?folderId=${folder.id}`)
  }

  const handleEdit = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    router.push(`/folder/${folder.id}`)
  }

  return (
    <>
      <tr className="selectable" onClick={() => toggleFolder(folder.id)}>
        <td className="align-left">
          <i
            className={`fa fa-chevron-${isOpen ? 'down' : 'right'} ml-${indentation * 5} mr-2`}
          ></i>
          {folder.name}
        </td>

        <td className="align-right">
          <Button
            type="button"
            variant="secondary"
            leftIcon="plus"
            className="ml-2"
            onClick={handleAddEntry}
          />
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
