'use server'

import prisma from '@/lib/prisma'
import type { Safe } from '@prisma/client'

type Biometric = {
  publicKey: string
  clientKey: string
}

export type CreateSafeResult =
  | { success: true; version: number; encrypted: string }
  | { success: false; message: string }

export async function createSafe(
  email: string,
  hash: string,
  encrypted: string,
): Promise<CreateSafeResult> {
  try {
    if (!email?.match(/^.+@.+\..+$/) || !hash?.trim()) {
      return { success: false, message: 'Ungültige Email-Adresse oder Passwort' }
    }

    if (await prisma.safe.findFirst({ where: { email } })) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: false, message: 'Pass-Safe existiert bereits, bitte einloggen' }
    }

    const version = 1
    const biometrics: Biometric[] = []

    const safe: Omit<Safe, 'id'> = {
      version,
      email,
      hash,
      biometrics: JSON.stringify(biometrics),
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

export async function loadSafe(email: string, hash: string): Promise<LoadSafeResult> {
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

export async function updateSafe(
  email: string,
  hash: string,
  version: number,
  encrypted: string,
): Promise<UpdateSafeResult> {
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
