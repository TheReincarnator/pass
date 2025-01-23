'use server'

import prisma from '@/lib/prisma'
import type { Safe } from '@prisma/client'
import crypto from 'node:crypto'

export async function createSafe(email: string, password: string): Promise<void> {
  if (!email?.match(/^.+@.+\..+$/) || !password || password.length < 8) {
    throw new Error('Ungültige Email-Adresse oder Passwort')
  }

  if (await prisma.safe.findFirst({ where: { email } })) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    throw new Error('Pass-Safe existiert bereits, bitte einloggen')
  }

  const content = { type: 'pass-safe', entries: [] }
  const contentString = JSON.stringify(content)

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', hashPassword(password), iv)
  const encrypted = cipher.update(contentString, 'utf8', 'base64') + cipher.final('base64')

  const safe: Omit<Safe, 'id'> = {
    version: 1,
    email,
    iv: iv.toString('base64'),
    content: encrypted,
  }
  await prisma.safe.create({ data: safe })
}

export async function loadSafe(email: string, password: string): Promise<string> {
  try {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Ungültige Email-Adresse oder Passwort')
    }

    const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      hashPassword(password),
      Buffer.from(safe.iv, 'base64'),
    )

    const contentString = decipher.update(safe.content, 'base64', 'utf8') + decipher.final('utf8')
    const content = JSON.parse(contentString)

    if (!contentString || typeof content !== 'object' || content?.type !== 'pass-safe') {
      throw new Error('Decrypted safe is no pass safe')
    }

    return contentString
  } catch (error) {
    // Errors are typically just wrong passwords
    console.warn(`Cannot load or decrypt safe for ${email}: ${error}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    throw new Error('Ungültige Email-Adresse oder Passwort')
  }
}

export async function updateSafe(
  email: string,
  password: string,
  newContent: string,
): Promise<void> {
  // Ensure the safe exists and the password is correct
  await loadSafe(email, password)

  const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    hashPassword(password),
    Buffer.from(safe.iv, 'base64'),
  )
  const encrypted = cipher.update(newContent, 'utf8', 'base64') + cipher.final('base64')

  await prisma.safe.update({
    where: { email, version: safe.version },
    data: { content: encrypted, version: safe.version + 1 },
  })
}

function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256')
  return hash.update(password).digest('hex').substring(0, 32)
}
