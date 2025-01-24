'use client'

import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'

export default function HeaderButtons() {
  const router = useRouter()
  const { safe, setSafe } = useSafeStore((state) => state)

  const handleLogout = () => {
    setSafe(null)
    router.push('/')
  }

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
