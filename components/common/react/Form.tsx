'use client'

import { type PropsWithChildren } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'

type Props = PropsWithChildren<{
  form: UseFormReturn<any>
  onSubmit?: () => Promise<void>
}>

export function Form({ form, onSubmit, children }: Props) {
  return (
    <form onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
      <FormProvider {...form}>{children}</FormProvider>
    </form>
  )
}
