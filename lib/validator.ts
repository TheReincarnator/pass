export function validate(value: unknown, validators: Validator[]): string | true {
  return validators.map((validate) => validate(value)).find((result) => result !== true) ?? true
}

export type Validator = (value: unknown) => string | true

const required: Validator = (value) => (isEmpty(value) ? 'Pflichtfeld' : true)

const minLength: (length: number) => Validator = (length) => (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    // Do not imply "required"
    return true
  }
  if (value.trim().length < length) {
    return `Mindestens ${length} Zeichen`
  }
  return true
}

const maxLength: (length: number) => Validator = (length) => (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    // Do not imply "required"
    return true
  }
  if (value.length > length) {
    return `Höchstens ${length} Zeichen`
  }
  return true
}

const email: Validator = (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    // Do not imply "required"
    return true
  }
  if (!value.match(/.+@.+\..+$/)) {
    return 'Ungültige Email-Adresse'
  }
  return true
}

const password: Validator = (value) => {
  if (isEmpty(value) || typeof value !== 'string') {
    // Do not imply "required"
    return true
  }
  if (!value.match(/[a-z]/)) {
    return 'Muss Kleinbuchstaben enthalten'
  }
  if (!value.match(/[A-Z]/)) {
    return 'Muss Großbuchstaben enthalten'
  }
  if (!value.match(/[0-9]/)) {
    return 'Muss Ziffer enthalten'
  }
  if (value.replace(/[a-zA-Z0-9 ]+/g, '').length === 0) {
    return 'Muss Sonderzeichen enthalten'
  }
  return true
}

const match: (other: unknown, message: string) => Validator =
  (other: unknown, message: string) => (value) => {
    if (isEmpty(value) || typeof value !== 'string') {
      // Do not imply "required"
      return true
    }
    if (value !== other) {
      return message
    }
    return true
  }

export const validators = { required, minLength, maxLength, email, password, match }

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
