'use client'

import type { Field } from '@/lib/validator'
import { validate } from '@/lib/validator'
import { createContext, useState, type FormEventHandler } from 'react'

export type FieldRegistry = {
  fields: Record<string, Field>
  updateField: (name: string, field: Field) => void
  removeField: (name: string) => void
}

export const FormContext = createContext<FieldRegistry>({
  fields: {},
  updateField: () => {},
  removeField: () => {},
})

export default function Form(props: { onSubmit?: () => void; children: React.ReactNode }) {
  const { onSubmit, children } = props
  const [fields, setFields] = useState<Record<string, Field>>({})

  const fieldRegistry: FieldRegistry = {
    fields,
    updateField: (name: string, field: Field) =>
      setFields((prevFields) => ({ ...prevFields, [name]: field })),
    removeField: (name: string) => {
      setFields((prevFields) => {
        const copy = { ...prevFields }
        delete copy[name]
        return copy
      })
    },
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (
      Object.values(fields)
        .map((field) => validate(field))
        .every((result) => result === true)
    ) {
      onSubmit?.()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormContext.Provider value={fieldRegistry}>{children}</FormContext.Provider>
    </form>
  )
}
