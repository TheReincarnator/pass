'use client'

import { Message } from '@/components/common/react/Message'
import { useSafeStore } from '@/lib/safe'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Form } from './common/react/Form'
import { TextField } from './common/react/TextField'
import { useForm } from 'react-hook-form'
import { Button } from './common/react/Button'

type Props = {
  id: number
}

type FolderFormData = {
  name: string
}

export function FolderForm({ id }: Props) {
  const router = useRouter()
  const { safe, getFolder } = useSafeStore((state) => state)
  const folder = getFolder(id)

  const form = useForm<FolderFormData>({
    defaultValues: {
      name: folder?.name,
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!safe || !folder) {
      router.push('/')
      return
    }
  }, [])

  if (!safe || !folder) {
    return null
  }

  const handleCancel = () => {
    router.push('/list')
  }

  const handleSubmit = async () => {}

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Ordner bearbeiten</h1>
      </header>

      <div className="page-content">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="form__row">
            <TextField control={form.control} name="name" label="Name" />
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
