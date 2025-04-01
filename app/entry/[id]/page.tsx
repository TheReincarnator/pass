'use client'

import Message from '@/components/common/react/Message'
import { getEntry, useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Entry({ params }: Props) {
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

  const id = parseInt((await params).slug, 10)
  const entry = getEntry(safe, id)

  if (!entry) {
    router.push('/')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">
        <h2>Eintrag </h2>

        {loading && 'Loading...'}
        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}
      </div>
    </article>
  )
}
