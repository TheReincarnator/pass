'use client'

import classNames from 'classnames'
import { validate, type Validator } from '@/lib/validator'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import type { RefObject } from 'react'

type Props<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  cols?: number
  passwordShown?: boolean
  disabled?: boolean
  validators?: Validator[]
  className?: string
  ref?: RefObject<HTMLInputElement | null>
}

export function PasswordField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  validators = [],
  cols,
  passwordShown,
  disabled,
  ref: propRef,
  className,
}: Props<TFieldValues>) {
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
            className={classNames(
              'form__input',
              `size${cols || 12}of12`,
              { 'has-error': fieldState.error },
              className,
            )}
          >
            {label && <span className="label">{label}:</span>}
            <input
              type={passwordShown ? 'text' : 'password'}
              disabled={disabled}
              ref={(element) => {
                reactHookRef(element)
                if (propRef) {
                  propRef.current = element
                }
              }}
              autoComplete="off"
              className="input--password"
              {...rest}
            />
            {fieldState.error && <span className="input-message">{fieldState.error.message}</span>}
          </label>
        )
      }}
    />
  )
}
