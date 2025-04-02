'use client'

import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from './common/react/Button'

export function HeaderButtons() {
  const router = useRouter()
  const { safe, lastInteraction, logout, touch } = useSafeStore((state) => state)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleInteraction = () => touch()

  useEffect(() => {
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    const timer = setInterval(() => {
      if (safe && new Date().getTime() > lastInteraction + 300_000) {
        // TODO: Reenable after development
        // handleLogout()
      }
    }, 1_000)

    return () => {
      clearInterval(timer)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [safe, lastInteraction])

  return (
    <div className="header-buttons">
      {safe && (
        <a onClick={handleLogout}>
          <Button type="button" variant="secondary" leftIcon="lock" text="Sperren" />
        </a>
      )}
    </div>
  )
}
