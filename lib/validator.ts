export type Field = {
  value: unknown
  validators: Validator[]
  setErrorMessage: (errorMessage: string) => void
}

export function validate(field: Field): string | true {
  return (
    field.validators.map((validate) => validate(field.value)).find((result) => result !== true) ??
    true
  )
}

export type Validator = (value: unknown) => string | true

const required: Validator = (value) => (isEmpty(value) ? 'Pflichtfeld' : true)

const minLength: (length: number) => Validator = (length) => (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    return true
  }
  if (value.trim().length < length) {
    return `Mindestens ${length} Zeichen`
  }
  return true
}

const maxLength: (length: number) => Validator = (length) => (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    return true
  }
  if (value.length > length) {
    return `Höchstens ${length} Zeichen`
  }
  return true
}

const email: Validator = (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    return true
  }
  if (!value.match(/.+@.+\..+$/)) {
    return 'Ungültige Email-Adresse'
  }
  return true
}

const password: Validator = (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    return true
  }
  if (!value.match(/[a-z]/)) {
    return 'Kleinbuchstabe fehlt'
  }
  if (!value.match(/[A-Z]/)) {
    return 'Großbuchstabe fehlt'
  }
  if (!value.match(/[0-9]/)) {
    return 'Ziffer fehlt'
  }
  if (value.replace(/[a-zA-Z0-9 ]+/g, '').length === 0) {
    return 'Sonderzeichen fehlt'
  }
  return true
}

export const validators = { required, minLength, maxLength, email, password }

export function isEmpty(value: unknown): boolean {
  if (value === null) {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  if (typeof value === 'string') {
    return value.trim().length === 0
  }
  return false
}
