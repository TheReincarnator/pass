'use client'

import { createContext, type PropsWithChildren } from 'react'
import type { Control, UseFormReturn, UseFormTrigger } from 'react-hook-form'

export const FormContext = createContext<{
  control?: Control<any>
  trigger?: UseFormTrigger<any>
}>({})

type Props = PropsWithChildren<{
  form: UseFormReturn<any>
  onSubmit?: () => Promise<void>
}>

export function Form({ form, onSubmit, children }: Props) {
  return (
    <form onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
      <FormContext.Provider value={{ control: form.control, trigger: form.trigger }}>
        {children}
      </FormContext.Provider>
    </form>
  )
}
