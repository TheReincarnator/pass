"use client"

import { useSafeStore } from "@/lib/safe"
import Button from "@/components/library/Button"
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
    <div>
      <h1>Dein Pass-Safe.</h1>

      {JSON.stringify(safe)}

      <Button className="mt-4" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}
