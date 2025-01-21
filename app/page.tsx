"use client"

import { loadSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"
import Button from "@/components/library/Button"
import PasswordField from "@/components/library/PasswordField"
import TextField from "@/components/library/TextField"
import Link from "next/link"
import { useSafeStore } from "@/lib/safe"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const safe = useSafeStore((state) => state.safe)
  const setSafe = useSafeStore((state) => state.setSafe)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      setSafe(JSON.parse(await loadSafe(email, password)))
      router.push("/entries")
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>
        Pass.
        <br />
        Für deine Passwörter und sensiblen Daten.
      </h1>

      <form className="block" onSubmit={handleSubmit}>
        <p>Log dich ein mit deinem Pass-Safe-Passwort.</p>
        <TextField label="Email" value={email} onUpdate={(value) => setEmail(value)} />
        <PasswordField label="Password" value={password} onUpdate={(value) => setPassword(value)} />
        {loading && <div className="text-blue-700 mt-2">Loading...</div>}
        {Boolean(errorMessage) && <div className="text-red-700 mt-2">{errorMessage}</div>}
        {Boolean(successMessage) && <div className="text-green-700 mt-2">{successMessage}</div>}
        Safe: {JSON.stringify(safe)}
        <Button type="submit" className="mt-4">
          Login
        </Button>
      </form>

      <p>
        <Link href="/register">Oder möchtest du dich registrieren?</Link>
      </p>
    </div>
  )
}
