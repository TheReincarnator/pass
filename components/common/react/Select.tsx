'use client'

import classNames from 'classnames'
import { validators } from '@/lib/validator'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import type { RefObject } from 'react'

export type Item = {
  value: string
  label: string
}

type Props<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  items: Item[]
  choose?: boolean
  disabled?: boolean
  required?: boolean
  cols?: number
  className?: string
  ref?: RefObject<HTMLSelectElement | null>
}

export function Select<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  items,
  choose,
  disabled,
  required,
  cols,
  className,
  ref: propRef,
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: (value: unknown) => (required ? validators.required(value) : true),
      }}
      render={({ field, fieldState }) => {
        const { ref: reactHookRef, ...rest } = field
        return (
          <label
            className={classNames(
              'form__input',
              'form__input--select',
              `size${cols || 12}of12`,
              { 'has-error': fieldState.error },
              className,
            )}
          >
            {label && <span className="label">{label}:</span>}
            <select
              disabled={disabled}
              ref={(element) => {
                reactHookRef(element)
                if (propRef) {
                  propRef.current = element
                }
              }}
              {...rest}
            >
              {choose && (
                <option key="" value="">
                  Bitte wählen
                </option>
              )}
              {items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {fieldState.error && <span className="input-message">{fieldState.error.message}</span>}
          </label>
        )
      }}
    />
  )
}
