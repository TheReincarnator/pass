import crypto from 'crypto'
import type { Safe } from './session'

export function encryptSafe(args: { safe?: Safe; email: string; password: string }): string {
  const { safe, email, password } = args
  const json = JSON.stringify(safe || { type: 'pass-safe', entries: [] })
  const iv = getIv(email)
  const { clientHash } = getHashes(email, password)
  const cipher = crypto.createCipheriv('aes-256-cbc', clientHash, iv)
  return cipher.update(json, 'utf8', 'base64') + cipher.final('base64')
}

export function decryptSafe(args: { encrypted: string; email: string; password: string }): Safe {
  const { encrypted, email, password } = args
  const iv = getIv(email)
  const singleHash = hashString(password)
  const decipher = crypto.createDecipheriv('aes-256-cbc', singleHash, iv)
  const json = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
  const result = JSON.parse(json) as Safe
  return result
}

export function encryptPassword(args: {
  email: string
  password: string
  clientKey: string
}): string {
  const { email, password, clientKey } = args
  const iv = getIv(email)
  const cipher = crypto.createCipheriv('aes-256-cbc', clientKey, iv)
  return cipher.update(password, 'utf8', 'base64') + cipher.final('base64')
}

export function decryptPassword(arsg: {
  encrypted: string
  email: string
  clientKey: string
}): string {
  const { encrypted, email, clientKey } = arsg
  const iv = getIv(email)
  const decipher = crypto.createDecipheriv('aes-256-cbc', clientKey, iv)
  return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
}

export function getHashes(
  email: string,
  password: string,
): { clientHash: string; serverHash: string } {
  const clientHash = hashString(password)
  const serverHash = hashString(clientHash + email)
  return { clientHash, serverHash }
}

export function getIv(email: string) {
  return Buffer.from(hashString(email).split('').reverse().join(''), 'hex')
}

function hashString(password: string): string {
  const hash = crypto.createHash('sha256')
  return hash.update(password).digest('hex').substring(0, 32)
}
