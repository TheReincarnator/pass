'use client'

import { Message } from '@/components/common/react/Message'
import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Form } from './common/react/Form'
import { TextField } from './common/react/TextField'
import { useForm } from 'react-hook-form'
import { PasswordField } from './common/react/PasswordField'
import { Button } from './common/react/Button'
import { validators } from '@/lib/validator'

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
  const { safe, getEntry, generatePassword, setEntry } = useSafeStore((state) => state)
  const entryResult = getEntry(id)
  const entry = entryResult?.entry || null
  const parentId = entryResult?.parentId || null

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

  const [passwordShown, setPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe || !entry) {
      router.push('/')
      return
    }

    if (!form.getValues().password) {
      handleGeneratePassword()
    }
  }, [])

  if (!safe || !entry) {
    return null
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    form.setValue('password', newPassword)
    form.setValue('passwordRepeat', newPassword)
  }

  const handleCancel = () => {
    router.push('/list')
  }

  const handleSubmit = async () => {
    const formValues = form.getValues()
    setEntry(
      {
        ...entry,
        name: formValues.name,
        login: formValues.login,
        email: formValues.email,
        password: formValues.password,
      },
      parentId,
    )
    router.push('/list')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Eintrag bearbeiten</h1>
      </header>

      <div className="page-content">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="form__row">
            <TextField
              control={form.control}
              name="name"
              label="Name"
              validators={[validators.required, validators.maxLength(100)]}
            />
          </div>

          <div className="form__row">
            <TextField
              control={form.control}
              name="login"
              label="Login"
              validators={[validators.maxLength(200)]}
            />
          </div>

          <div className="form__row">
            <TextField
              control={form.control}
              name="email"
              label="E-Mail"
              validators={[validators.maxLength(200)]}
            />
          </div>

          <div className="form__row flex-row">
            <PasswordField
              control={form.control}
              name="password"
              label="Passwort"
              passwordShown={passwordShown}
              className="flex-1 mr-0"
              validators={[validators.maxLength(200)]}
            />

            <Button
              type="button"
              variant="secondary"
              leftIcon={passwordShown ? 'eye' : 'eye-slash'}
              className="flex-auto align-self-center mt-0 mb-4 ml-2 mr-0"
              onClick={() => setPasswordShown(!passwordShown)}
            />

            <Button
              type="button"
              variant="secondary"
              leftIcon="magic"
              className="flex-auto align-self-center mt-0 mb-4 ml-2 mr-0"
              onClick={handleGeneratePassword}
            />
          </div>

          <div className="form__row">
            <PasswordField
              control={form.control}
              name="passwordRepeat"
              label="Passwort wiederholen"
              passwordShown={passwordShown}
              disabled={passwordShown}
              validators={[
                validators.match(form.getValues().password, 'Die Passwörter müssen übereinstimmen'),
              ]}
            />
          </div>

          {errorMessage && <Message type="error" text={errorMessage} />}
          {successMessage && <Message type="ok" text={successMessage} />}

          <div className="buttons">
            <div className="buttons__left">
              <Button type="button" variant="critical" text="Löschen" loading={loading} />
            </div>

            <div className="buttons__right">
              <Button type="button" variant="secondary" text="Abbrechen" onClick={handleCancel} />
              <Button type="submit" text="Speichern" loading={loading} />
            </div>
          </div>
        </Form>
      </div>
    </article>
  )
}
