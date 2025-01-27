'use server'

import prisma from '@/lib/prisma'
import type { Safe } from '@prisma/client'
import crypto from 'node:crypto'

type Biometric = {
  publicKey: string
  challenge: string
  clientKey: string
}

type Biometrics = Record<string, Biometric>

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
    const biometrics: Biometrics = {}

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

export type StoreBiometricResult = { success: true } | { success: false; message: string }

export async function storeBiometric(args: {
  email: string
  hash: string
  clientId: string
  publicKey: string
  clientKey: string
}): Promise<StoreBiometricResult> {
  const { email, hash, clientId, publicKey, clientKey } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const biometrics = JSON.parse(safe.biometrics) as Biometrics
    biometrics[clientId] = { publicKey, challenge: '', clientKey }
    await prisma.safe.update({
      where: { email },
      data: { biometrics: JSON.stringify(biometrics) },
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type DeleteBiometricResult = { success: true } | { success: false; message: string }

export async function deleteBiometric(args: {
  email: string
  hash: string
  clientId: string
}): Promise<StoreBiometricResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const biometrics = JSON.parse(safe.biometrics) as Biometrics
    delete biometrics[clientId]
    await prisma.safe.update({
      where: { email },
      data: { biometrics: JSON.stringify(biometrics) },
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type ChallengeBiometricResult =
  | { success: true; challenge: string }
  | { success: false; message: string }

export async function challengeBiometric(args: {
  email: string
  hash: string
  clientId: string
}): Promise<ChallengeBiometricResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const biometrics = JSON.parse(safe.biometrics) as Biometrics
    const biometric = biometrics[clientId]
    if (!biometric) {
      return { success: false, message: 'Biometrik nicht gefunden' }
    }
    biometric.challenge = crypto.randomBytes(32).toString('hex')
    await prisma.safe.update({
      where: { email },
      data: { biometrics: JSON.stringify(biometrics) },
    })
    return { success: true, challenge: biometric.challenge }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type VerifyBiometricResult =
  | { success: true; clientKey: string }
  | { success: false; message: string }

export async function verifyBiometric(args: {
  email: string
  hash: string
  clientId: string
  signedChallenge: string
}): Promise<VerifyBiometricResult> {
  const { email, hash, clientId, signedChallenge } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const biometrics = JSON.parse(safe.biometrics) as Biometrics
    const biometric = biometrics[clientId]
    if (!biometric) {
      return { success: false, message: 'Biometrik nicht gefunden' }
    }
    // TODO: Verify challenge
    biometric.challenge = ''
    await prisma.safe.update({
      where: { email },
      data: { biometrics: JSON.stringify(biometrics) },
    })
    return { success: true, clientKey: biometric.clientKey }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}
