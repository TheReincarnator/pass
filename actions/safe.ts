'use server'

import prisma from '@/lib/prisma'
import type { Safe } from '@prisma/client'
import type { Passkeys } from './passkey'

export type CreateSafeResult =
  | { result: 'ok'; version: number; encrypted: string }
  | { result: 'invalid' | 'exists' | 'error' }

// The parameters are sent the server, so they must be encrypted
export async function createSafe(args: {
  email: string
  hash: string
  encrypted: string
}): Promise<CreateSafeResult> {
  const { email, hash, encrypted } = args

  try {
    if (!email?.match(/^.+@.+\..+$/) || !hash?.trim()) {
      console.info(`Cannot create safe: ${email} is not a valid email`)
      return { result: 'invalid' }
    }

    if (await prisma.safe.findFirst({ where: { email } })) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { result: 'exists' }
    }

    const version = 1
    const passkeys: Passkeys = {}

    const safe: Omit<Safe, 'id'> = {
      version,
      email,
      hash,
      passkeys: JSON.stringify(passkeys),
      currentchallenge: null,
      encrypted,
    }
    console.log(safe)
    await prisma.safe.create({ data: safe })

    return { result: 'ok', version, encrypted }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type LoadSafeResult =
  | { result: 'ok'; version: number; encrypted: string }
  | { result: 'invalid' | 'error' }

export async function loadSafe(args: { email: string; hash: string }): Promise<LoadSafeResult> {
  const { email, hash } = args

  try {
    if (!email?.trim() || !hash?.trim()) {
      return { result: 'invalid' }
    }

    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { result: 'invalid' }
    }
    return { result: 'ok', version: safe.version, encrypted: safe.encrypted }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type UpdateSafeResult = { result: 'ok' } | { result: 'invalid' | 'error' }

// The parameters are sent the server, so they must be encrypted
export async function updateSafe(args: {
  email: string
  hash: string
  version: number
  encrypted: string
}): Promise<UpdateSafeResult> {
  const { email, hash, version, encrypted } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email, hash, version } })
    if (!safe) {
      return { result: 'invalid' }
    }
    await prisma.safe.update({
      where: { email, version },
      data: { version: version + 1, encrypted },
    })
    return { result: 'ok' }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}
