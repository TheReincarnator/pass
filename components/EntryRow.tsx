import type { Entry } from '@/lib/safe'
import { useRouter } from 'next/navigation'

export function EntryRow(props: { entry: Entry; indentation: number }) {
  const { entry, indentation } = props

  const router = useRouter()

  const handleCopyLogin = () => {
    navigator.clipboard.writeText(entry.login)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(entry.email)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(entry.password)
  }

  const handleEdit = () => {
    router.push(`/entry/${entry.id}`)
  }

  return (
    <tr className="selectable">
      <td className="align-left">
        <i className={`fa fa-key ml-${indentation * 3} mr-2`}></i>
        {entry.name}
      </td>
      <td className="align-right">
        {entry.login && (
          <button
            type="button"
            className="button-secondary button-icon-only ml-2"
            onClick={handleCopyLogin}
          >
            <i className="fa fa-font"></i>
          </button>
        )}
        {entry.email && (
          <button
            type="button"
            className="button-secondary button-icon-only ml-2"
            onClick={handleCopyEmail}
          >
            <i className="fa fa-at"></i>
          </button>
        )}
        {entry.password && (
          <button
            type="button"
            className="button-secondary button-icon-only ml-2"
            onClick={handleCopyPassword}
          >
            <i className="fa fa-asterisk"></i>
          </button>
        )}
        <button type="button" className="button-icon-only ml-2" onClick={handleEdit}>
          <i className="fa fa-pencil"></i>
        </button>
      </td>
    </tr>
  )
}
