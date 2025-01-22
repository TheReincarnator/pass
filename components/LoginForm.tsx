"use client"

import { loadSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"
import Button from "@/components/common/react/Button"
import TextField from "@/components/common/react/TextField"
import { useSafeStore } from "@/lib/safe"
import Message from "./common/react/Message"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const { setSafe } = useSafeStore((state) => state)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
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
    <form onSubmit={handleLogin}>
      <p>Log dich ein mit deinem Pass-Safe-Passwort.</p>

      <div className="form__row">
        <TextField label="Email" value={email} cols={6} onUpdate={(value) => setEmail(value)} />
        <TextField
          type="password"
          label="Password"
          value={password}
          cols={6}
          onUpdate={(value) => setPassword(value)}
        />
      </div>

      {errorMessage && <Message type="error" text={errorMessage} />}
      {successMessage && <Message type="ok" text={successMessage} />}

      <div className="buttons">
        <div className="buttons__right">
          <Button type="submit" text="Login" loading={loading} />
        </div>
      </div>
    </form>
  )
}
