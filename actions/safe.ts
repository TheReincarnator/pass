'use server'

import prisma from '@/lib/prisma'
import type { Safe } from '@prisma/client'
import type { Passkeys } from './passkey'

export type CreateSafeResult =
  | { success: true; version: number; encrypted: string }
  | { success: false; message: string }

export async function createSafe(args: {
  email: string
  hash: string
  encrypted: string
}): Promise<CreateSafeResult> {
  const { email, hash, encrypted } = args

  try {
    if (!email?.match(/^.+@.+\..+$/) || !hash?.trim()) {
      return { success: false, message: 'Ungültige Email-Adresse oder Passwort' }
    }

    if (await prisma.safe.findFirst({ where: { email } })) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, message: 'Pass-Safe existiert bereits, bitte einloggen' }
    }

    const version = 1
    const passkeys: Passkeys = {}

    const safe: Omit<Safe, 'id'> = {
      version,
      email,
      hash,
      passkeys: JSON.stringify(passkeys),
      encrypted,
    }
    console.log(safe)
    await prisma.safe.create({ data: safe })

    return { success: true, version, encrypted }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type LoadSafeResult =
  | { success: true; version: number; encrypted: string }
  | { success: false; message: string }

export async function loadSafe(args: { email: string; hash: string }): Promise<LoadSafeResult> {
  const { email, hash } = args

  try {
    if (!email?.trim() || !hash?.trim()) {
      return { success: false, message: 'Ungültige Email-Adresse oder Passwort' }
    }

    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, message: 'Ungültige Email-Adresse oder Passwort' }
    }
    return { success: true, version: safe.version, encrypted: safe.encrypted }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type UpdateSafeResult = { success: true } | { success: false; message: string }

export async function updateSafe(args: {
  email: string
  hash: string
  version: number
  encrypted: string
}): Promise<UpdateSafeResult> {
  const { email, hash, version, encrypted } = args

  try {
    await prisma.safe.findUniqueOrThrow({ where: { email, hash, version } })
    await prisma.safe.update({
      where: { email, version },
      data: { version: version + 1, encrypted },
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}
