"use client"

import { createSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"
import Button from "@/components/library/Button"
import PasswordField from "@/components/library/PasswordField"
import TextField from "@/components/library/TextField"
import Link from "next/link"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCreate: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      await createSafe(email, password)
      setSuccessMessage("Safe created")
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Für Pass registrieren.</h1>

      <form className="block" onSubmit={handleCreate}>
        <TextField label="Email" value={email} onUpdate={(value) => setEmail(value)} />
        <PasswordField label="Password" value={password} onUpdate={(value) => setPassword(value)} />

        {!loading && (
          <p className="text-red-700">
            Achtung! Merke dir dein Passwort gut, oder schreibe es dir auf. Du kannst dein Passwort
            nicht zurücksetzen, und niemand kann den Safe retten, wenn du es vergessen solltest.
          </p>
        )}

        {loading && <div className="text-blue-700 mt-2">Creating...</div>}
        {Boolean(errorMessage) && <div className="text-red-700 mt-2">{errorMessage}</div>}
        {Boolean(successMessage) && <div className="text-green-700 mt-2">{successMessage}</div>}

        <Button type="submit" className="mt-4">
          Login
        </Button>
      </form>

      <p>
        <Link href="/">Oder möchtest du dich einloggen?</Link>
      </p>
    </div>
  )
}
