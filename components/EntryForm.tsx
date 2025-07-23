'use client'

import { Message } from '@/components/common/react/Message'
import { useSession } from '@/lib/session'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Form } from './common/react/Form'
import { TextField } from './common/react/TextField'
import { useForm } from 'react-hook-form'
import { PasswordField } from './common/react/PasswordField'
import { Button } from './common/react/Button'
import { validators } from '@/lib/validator'
import type { Item } from './common/react/Select'
import { Select } from './common/react/Select'

type Props = {
  id: number | null
}

type EntryFormData = {
  parentId: string
  name: string
  login: string
  email: string
  password: string
  passwordRepeat: string
  url: string
  notes: string
}

export function EntryForm({ id }: Props) {
  const router = useRouter()
  const {
    email,
    password,
    safe,
    version,
    getEntry,
    setEntry,
    deleteEntry,
    generatePassword,
    getFolders,
    persist,
  } = useSession((state) => state)
  const entryResult = id ? getEntry(id) : null
  const entry = entryResult?.entry || null
  const parentId = entryResult?.parentId || null

  const form = useForm<EntryFormData>({
    defaultValues: {
      parentId: parentId ? String(parentId) : '',
      name: entry?.name ?? '',
      login: entry?.login ?? '',
      email: entry?.email ?? '',
      password: entry?.password ?? '',
      passwordRepeat: entry?.password ?? '',
      url: entry?.url ?? '',
      notes: entry?.notes ?? '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const [passwordShown, setPasswordShown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe) {
      router.push('/')
      return
    }

    if (!form.getValues().password) {
      handleGeneratePassword()
    }
  }, [])

  if (!safe) {
    return null
  }

  const folderItems: Item[] = [
    { value: '', label: 'kein Ordner' },
    ...getFolders().map((folder) => ({ value: String(folder.id), label: folder.name })),
  ]

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    form.setValue('password', newPassword)
    form.setValue('passwordRepeat', newPassword)
  }

  const handleSubmit = async () => {
    if (!email || !password || !safe || version === null) {
      return
    }
    const formValues = form.getValues()
    setEntry(
      {
        ...entry,
        type: 'entry',
        name: formValues.name,
        login: formValues.login,
        email: formValues.email,
        password: formValues.password,
        url: formValues.url,
        oldPasswords: entry?.oldPasswords,
        notes: formValues.notes,
      },
      formValues.parentId ? parseInt(formValues.parentId, 10) : null,
    )
    setSaving(true)
    const successful = await persist()
    setSaving(false)
    if (!successful) {
      setErrorMessage('Das hat leider nicht geklappt')
      return
    }
    setSuccessMessage(entry ? 'Eintrag gespeichert' : 'Eintrag angelegt')
    router.push('/list')
  }

  const handleCancel = () => {
    router.push('/list')
  }

  const handleDelete = async () => {
    if (!email || !password || !safe || version === null || !entry) {
      return
    }
    deleteEntry(entry.id)
    setSaving(true)
    const successful = await persist()
    setSaving(false)
    if (!successful) {
      setErrorMessage('Das hat leider nicht geklappt')
      return
    }
    setSuccessMessage('Eintrag gelöscht')
    router.push('/list')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">{entry ? 'Eintrag bearbeiten' : 'Eintrag anlegen'}</h1>
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

          <div className="form__row">
            <TextField
              control={form.control}
              name="url"
              label="URL"
              validators={[validators.maxLength(1000)]}
            />
          </div>

          <div className="form__row">
            <Select control={form.control} name="parentId" label="Ordner" items={folderItems} />
          </div>

          <div className="form__row">
            <TextField
              control={form.control}
              name="notes"
              label="Notizen"
              validators={[validators.maxLength(10000)]}
            />
          </div>

          {errorMessage && <Message type="error" text={errorMessage} />}
          {successMessage && <Message type="ok" text={successMessage} />}

          <div className="buttons">
            {entry && (
              <div className="buttons__left">
                <Button
                  type="button"
                  variant="critical"
                  text="Löschen"
                  loading={saving}
                  onClick={handleDelete}
                />
              </div>
            )}

            <div className="buttons__right">
              <Button type="button" variant="secondary" text="Abbrechen" onClick={handleCancel} />
              <Button type="submit" text="Speichern" loading={saving} />
            </div>
          </div>
        </Form>
      </div>
    </article>
  )
}
