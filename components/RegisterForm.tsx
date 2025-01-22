"use client"

import { createSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"
import Button from "@/components/common/react/Button"
import TextField from "@/components/common/react/TextField"
import { useRouter } from "next/navigation"
import Message from "./common/react/Message"

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      await createSafe(email, password)
      router.push("/entries")
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <div className="form__row">
        <TextField label="Email" value={email} onUpdate={(value) => setEmail(value)} />
        <TextField
          type="password"
          label="Password"
          value={password}
          onUpdate={(value) => setPassword(value)}
        />
      </div>

      {!loading && password && !successMessage && !errorMessage && (
        <Message
          type="warning"
          text="Achtung! Merke dir dein Passwort gut, oder schreibe es dir auf. Du kannst dein Passwort
          nicht zurücksetzen, und niemand kann den Safe retten, wenn du es vergessen solltest."
        />
      )}

      {errorMessage && <Message type="error" text={errorMessage} />}
      {successMessage && <Message type="ok" text={successMessage} />}

      <div className="buttons">
        <div className="buttons__right">
          <Button type="submit" text="Registrieren" loading={loading} />
        </div>
      </div>
    </form>
  )
}
