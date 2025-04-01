'use client'

import classNames from 'classnames'
import { validate, type Validator } from '@/lib/validator'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import type { RefObject } from 'react'

export function PasswordField<TFieldValues extends FieldValues = FieldValues>(props: {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  validators?: Validator[]
  ref?: RefObject<HTMLInputElement | null>
  cols?: number
}) {
  const { control, name, label, validators = [], ref: propRef, cols } = props

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: (value: unknown) => validate(value, validators),
      }}
      render={({ field, fieldState }) => {
        const { ref: reactHookRef, ...rest } = field
        return (
          <label
            className={classNames('form__input', `size${cols || 12}of12`, {
              'has-error': fieldState.error,
            })}
          >
            {label && <span className="label">{label}:</span>}
            <input
              type="password"
              ref={(element) => {
                reactHookRef(element)
                if (propRef) {
                  propRef.current = element
                }
              }}
              autoComplete="off"
              {...rest}
            />
            {fieldState.error && <span className="input-message">{fieldState.error.message}</span>}
          </label>
        )
      }}
    />
  )
}
