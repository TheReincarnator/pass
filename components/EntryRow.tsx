import type { Entry } from '@/lib/session'
import { useRouter } from 'next/navigation'
import { Button } from './common/react/Button'

type Props = {
  entry: Entry
  indentation: number
}

export function EntryRow({ entry, indentation }: Props) {
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
          <Button
            type="button"
            variant="secondary"
            leftIcon="font"
            className="ml-2"
            onClick={handleCopyLogin}
          />
        )}

        {entry.email && (
          <Button
            type="button"
            variant="secondary"
            leftIcon="at"
            className="ml-2"
            onClick={handleCopyEmail}
          />
        )}

        {entry.password && (
          <Button
            type="button"
            variant="secondary"
            leftIcon="asterisk"
            className="ml-2"
            onClick={handleCopyPassword}
          />
        )}

        <Button type="button" leftIcon="pencil" className="ml-2" onClick={handleEdit} />
      </td>
    </tr>
  )
}
