"use client"

import { useSafeStore } from "@/lib/safe"
import Button from "@/components/common/react/Button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const safe = useSafeStore((state) => state.safe)
  const setSafe = useSafeStore((state) => state.setSafe)

  const handleLogout = () => {
    setSafe(null)
    router.push("/")
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">
        TODO
      </div>
    </article>
  )
}
