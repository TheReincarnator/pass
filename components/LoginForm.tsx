'use client'

import { loadSafe } from '@/actions/safe'
import { useState } from 'react'
import Button from '@/components/common/react/Button'
import TextField from '@/components/common/react/TextField'
import Form from '@/components/common/react/Form'
import { useSafeStore } from '@/lib/safe'
import Message from './common/react/Message'
import { useRouter } from 'next/navigation'
import { validators } from '@/lib/validator'

export default function LoginForm() {
  const router = useRouter()
  const { setSafe } = useSafeStore((state) => state)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      setSafe(JSON.parse(await loadSafe(email, password)))
      router.push('/folder/root')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleLogin}>
      <p>Log dich ein mit deinem Pass-Safe-Passwort.</p>

      <div className="form__row">
        <TextField
          name="email"
          label="Email"
          value={email}
          cols={6}
          validators={[validators.required, validators.email]}
          onUpdate={(value) => setEmail(value)}
        />
        <TextField
          name="password"
          type="password"
          label="Password"
          value={password}
          cols={6}
          validators={[validators.required]}
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
    </Form>
  )
}
