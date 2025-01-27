'use client'

import { loadSafe } from '@/actions/safe'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/common/react/Button'
import TextField from '@/components/common/react/TextField'
import Form from '@/components/common/react/Form'
import { getHashes, useSafeStore } from '@/lib/safe'
import Message from './common/react/Message'
import { useRouter } from 'next/navigation'
import { validators } from '@/lib/validator'

export default function LoginForm() {
  const router = useRouter()
  const { onLogin } = useSafeStore((state) => state)
  const [email, setEmail] = useState(
    typeof localStorage !== 'undefined' ? localStorage.getItem('email') || '' : '',
  )
  const emailRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (email) {
      passwordRef?.current?.focus()
    } else {
      emailRef?.current?.focus()
    }
  }, [])

  const handleLogin = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await loadSafe({ email: emailTrimmed, hash: serverHash })
      if (!result.success) {
        setErrorMessage(String(result.message))
        return
      }
      onLogin({ ...result, email: emailTrimmed, password })
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('email', email)
      }
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleLogin}>
      <p>
        Wenn du bereits einen Pass-Safe hast, gib jetzt deine Email-Adresse und dein Master-Passwort
        ein, um ihn zu entsperren.
      </p>

      <div className="form__row">
        <TextField
          name="email"
          label="Email"
          value={email}
          cols={6}
          ref={emailRef}
          validators={[validators.required, validators.email]}
          onUpdate={(value) => setEmail(value)}
        />
        <TextField
          name="password"
          type="password"
          label="Master-Passwort"
          value={password}
          cols={6}
          ref={passwordRef}
          validators={[validators.required]}
          onUpdate={(value) => setPassword(value)}
        />
      </div>

      {errorMessage && <Message type="error" text={errorMessage} />}
      {successMessage && <Message type="ok" text={successMessage} />}

      <div className="buttons">
        <div className="buttons__right">
          <Button type="submit" text="Entsperren" loading={loading} />
        </div>
      </div>
    </Form>
  )
}
