'use client'

import { Message } from '@/components/common/react/Message'
import { getFolder, useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  id: number
}

export function FolderForm({ id }: Props) {
  const router = useRouter()
  const { safe } = useSafeStore((state) => state)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe) {
      router.push('/')
    }
  }, [])

  if (!safe) {
    return null
  }

  const folder = getFolder(safe, id)
  if (!folder) {
    return null
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Ordner bearbeiten</h1>
      </header>

      <div className="page-content">
        <form></form>

        {loading && 'Loading...'}
        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}
      </div>
    </article>
  )
}
