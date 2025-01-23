'use client'

import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { FormContext } from './Form'
import type { Validator } from '@/lib/validator'

export default function TextField(props: {
  type?: 'text' | 'password'
  name: string
  label?: string
  value?: string
  validators?: Validator[]
  cols?: number
  onUpdate?: (newValue: string) => void
}) {
  const { type, name, label, value, validators = [], cols, onUpdate } = props
  const { updateField, removeField } = useContext(FormContext)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    updateField(name, { value, validators, setErrorMessage })
    return () => removeField(name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <label
      className={classNames('form__input', `size${cols || 12}of12`, { 'has-error': errorMessage })}
    >
      {label && <span className="label">{label}:</span>}
      <input
        type={type || 'text'}
        name={name}
        value={value ?? ''}
        autoComplete={type === 'password' ? 'off' : undefined}
        onChange={(e) => onUpdate?.(e.target.value)}
        onFocus={() => setErrorMessage('')}
      />
      {errorMessage && <span className="input-message">{errorMessage}</span>}
    </label>
  )
}
