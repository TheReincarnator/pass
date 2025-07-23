'use client'

import { Message } from '@/components/common/react/Message'
import { useSession } from '@/lib/session'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Form } from './common/react/Form'
import { TextField } from './common/react/TextField'
import { useForm } from 'react-hook-form'
import { Button } from './common/react/Button'
import { Select, type Item } from './common/react/Select'
import { validators } from '@/lib/validator'

type Props = {
  id: number | null
}

type FolderFormData = {
  parentId: string
  name: string
}

export function FolderForm({ id }: Props) {
  const router = useRouter()
  const { email, password, safe, version, getFolder, setEntry, deleteEntry, getFolders, persist } =
    useSession((state) => state)
  const folderResult = id ? getFolder(id) : null
  const folder = folderResult?.folder || null
  const parentId = folderResult?.parentId || null

  const form = useForm<FolderFormData>({
    defaultValues: {
      parentId: parentId ? String(parentId) : '',
      name: folder?.name ?? '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe) {
      router.push('/')
      return
    }
  }, [])

  if (!safe) {
    return null
  }

  const folderItems: Item[] = [
    { value: '', label: 'kein Ordner' },
    ...getFolders({ excludeAncestorsOf: folder?.id }).map((folder) => ({
      value: String(folder.id),
      label: folder.name,
    })),
  ]

  const handleSubmit = async () => {
    if (!email || !password || !safe || version === null) {
      return
    }
    const formValues = form.getValues()
    setEntry(
      {
        ...folder,
        type: 'folder',
        name: formValues.name,
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
    setSuccessMessage(folder ? 'Ordner gespeichert' : 'Ordner angelegt')
    router.push('/list')
  }

  const handleCancel = () => {
    router.push('/list')
  }

  const handleDelete = async () => {
    if (!email || !password || !safe || version === null || !folder) {
      return
    }
    deleteEntry(folder.id)
    setSaving(true)
    const successful = await persist()
    setSaving(false)
    if (!successful) {
      setErrorMessage('Das hat leider nicht geklappt')
      return
    }
    setSuccessMessage('Ordner gelöscht')
    router.push('/list')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">{folder ? 'Ordner bearbeiten' : 'Ordner anlegen'}</h1>
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
            <Select
              control={form.control}
              name="parentId"
              label="Übergeordneter Ordner"
              items={folderItems}
            />
          </div>

          {errorMessage && <Message type="error" text={errorMessage} />}
          {successMessage && <Message type="ok" text={successMessage} />}

          <div className="buttons">
            {folder && (
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
