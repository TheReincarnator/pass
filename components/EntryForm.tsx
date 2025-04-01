'use client'

import { Message } from '@/components/common/react/Message'
import { getEntry, useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Form } from './common/react/Form'
import { TextField } from './common/react/TextField'
import { useForm } from 'react-hook-form'
import { PasswordField } from './common/react/PasswordField'
import { Button } from './common/react/Button'

type Props = {
  id: number
}

type EntryFormData = {
  name: string
  login: string
  email: string
  password: string
  passwordRepeat: string
}

export function EntryForm({ id }: Props) {
  const router = useRouter()
  const { safe } = useSafeStore((state) => state)
  const entry = safe ? getEntry(safe, id) : null

  const form = useForm<EntryFormData>({
    defaultValues: {
      name: entry?.name,
      login: entry?.login,
      email: entry?.email,
      password: entry?.password,
      passwordRepeat: entry?.password,
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe || !entry) {
      router.push('/')
      return
    }
  }, [])

  if (!safe || !entry) {
    return null
  }

  const handleSubmit = async () => {}

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Eintrag bearbeiten</h1>
      </header>

      <div className="page-content">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="form__row">
            <TextField control={form.control} name="name" label="Name" />
          </div>
          <div className="form__row">
            <TextField control={form.control} name="login" label="Login" />
          </div>
          <div className="form__row">
            <TextField control={form.control} name="email" label="E-Mail" />
          </div>
          <div className="form__row">
            <PasswordField control={form.control} name="password" label="Passwort" />
          </div>
          <div className="form__row">
            <PasswordField
              control={form.control}
              name="passwordRepeat"
              label="Passwort wiederholen"
            />
          </div>
        </Form>

        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}

        <div className="buttons">
          <div className="buttons__left">
            <Button type="button" variant="critical" text="Löschen" loading={loading} />
          </div>

          <div className="buttons__right">
            <Button type="button" variant="secondary" text="Abbrechen" />
            <Button type="submit" text="Speichern" loading={loading} />
          </div>
        </div>
      </div>
    </article>
  )
}
