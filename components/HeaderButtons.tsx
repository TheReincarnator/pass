'use client'

import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HeaderButtons() {
  const router = useRouter()
  const { safe, lastInteraction, setSafe, touch } = useSafeStore((state) => state)

  const handleLogout = () => {
    setSafe(null)
    router.push('/')
  }

  const handleInteraction = () => touch()

  useEffect(() => {
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    const timer = setInterval(() => {
      if (safe && new Date().getTime() > lastInteraction + 300_000) {
        handleLogout()
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
          <button type="button" className="button-secondary">
            <i className="fa fa-lock"></i>
            <span className="header-button-text">&nbsp;Sperren</span>
          </button>
        </a>
      )}
    </div>
  )
}
