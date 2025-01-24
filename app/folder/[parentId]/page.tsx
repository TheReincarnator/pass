'use client'

import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { safe, setSafe } = useSafeStore((state) => state)

  useEffect(() => {
    if (!safe) {
      router.push('/')
    }
  }, [])

  if (!safe) {
    return null
  }

  const handleLogout = () => {
    setSafe(null)
    router.push('/')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">TODO</div>
    </article>
  )
}
