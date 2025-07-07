'use client'

import { createSafe } from '@/actions/safe'
import { useState } from 'react'
import { Button } from '@/components/common/react/Button'
import { TextField } from '@/components/common/react/TextField'
import { Form } from '@/components/common/react/Form'
import { useRouter } from 'next/navigation'
import { Message } from './common/react/Message'
import { validators } from '@/lib/validator'
import { useForm } from 'react-hook-form'
import { PasswordField } from './common/react/PasswordField'
import { encryptSafe, getHashes } from '@/lib/crypto'
import { useSession } from '@/lib/session'

type RegisterFormData = {
  email: string
  password: string
  passwordRepeat: string
}

export function RegisterForm() {
  const router = useRouter()
  const { setSafe } = useSession((state) => state)

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      passwordRepeat: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister = async () => {
    const { email, password } = form.getValues()

    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const encrypted = encryptSafe({ email: emailTrimmed, password })
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await createSafe({ email: emailTrimmed, hash: serverHash, encrypted })
      if (result.result !== 'ok') {
        setErrorMessage('Das hat leider nicht geklappt')
        return
      }
      setSafe({ ...result, email: emailTrimmed, password, isPasskeyLogin: false })
      localStorage.setItem('email', emailTrimmed)
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} onSubmit={handleRegister}>
      <div className="form__row">
        <TextField
          control={form.control}
          name="email"
          label="Email"
          validators={[validators.required, validators.email]}
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Master-Passwort"
          validators={[validators.required, validators.minLength(8), validators.password]}
        />
        <PasswordField
          control={form.control}
          name="passwordRepeat"
          label="Master-Passwort (Wiederholung)"
          validators={[
            validators.required,
            validators.match(form.getValues().password, 'Passwörter stimmen nicht überein'),
          ]}
        />
      </div>

      {!loading && form.getValues().password && !successMessage && !errorMessage && (
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
