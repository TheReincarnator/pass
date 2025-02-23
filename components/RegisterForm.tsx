'use client'

import { createSafe } from '@/actions/safe'
import { useState } from 'react'
import Button from '@/components/common/react/Button'
import TextField from '@/components/common/react/TextField'
import Form from '@/components/common/react/Form'
import { useRouter } from 'next/navigation'
import Message from './common/react/Message'
import { validators } from '@/lib/validator'
import { encryptSafe, getHashes, useSafeStore } from '@/lib/safe'

export default function RegisterForm() {
  const router = useRouter()
  const { onLogin } = useSafeStore((state) => state)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const encrypted = encryptSafe({ email: emailTrimmed, password })
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await createSafe({ email: emailTrimmed, hash: serverHash, encrypted })
      if (!result.success) {
        setErrorMessage(String(result.message))
        return
      }
      onLogin({ ...result, email: emailTrimmed, password })
      localStorage.setItem('email', emailTrimmed)
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleRegister}>
      <div className="form__row">
        <TextField
          name="email"
          label="Email"
          value={email}
          validators={[validators.required, validators.email]}
          onUpdate={(value) => setEmail(value)}
        />
        <TextField
          name="password"
          type="password"
          label="Master-Passwort"
          value={password}
          validators={[validators.required, validators.minLength(8), validators.password]}
          onUpdate={(value) => setPassword(value)}
        />
        <TextField
          name="passwordRepeat"
          type="password"
          label="Master-Passwort (Wiederholung)"
          value={passwordRepeat}
          validators={[
            validators.required,
            validators.match(password, 'Passwörter stimmen nicht überein'),
          ]}
          onUpdate={(value) => setPasswordRepeat(value)}
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
    </Form>
  )
}
