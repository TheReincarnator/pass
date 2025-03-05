'use server'

import crypto from 'crypto'
import prisma from '@/lib/prisma'

export type Passkey = {
  publicKey: string
  clientKey: string
}

// Record key is the client ID
export type Passkeys = Record<string, Passkey>

export type StartRegisterPasskeyResult =
  | { result: 'ok'; challenge: string }
  | { result: 'invalid'|'error' }

export async function startRegisterPasskey(args: {
  email: string
  hash: string
}): Promise<StartRegisterPasskeyResult> {
  const { email, hash } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const challenge = crypto.randomBytes(32).toString('base64')
    await prisma.safe.update({
      where: { email },
      data: { currentchallenge: challenge },
    })
    return { result: 'ok', challenge }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type FinishRegisterPasskeyResult =
  | { result: 'ok'; clientKey: string }
  | { result: 'invalid'|'error' }

export async function finishRegisterPasskey(args: {
  email: string
  hash: string
  challenge: string
  clientId: string
  publicKey: string
}): Promise<FinishRegisterPasskeyResult> {
  const { email, hash, challenge, clientId, publicKey } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    if (!safe.currentchallenge || safe.currentchallenge !== challenge || !publicKey) {
      return { result: 'invalid' }
    }

    // Verify challenge (prevent replay attacks)
    console.log('Creating verifier')
    const verifier = crypto.createVerify('RSA-SHA256')
    console.log('Setting current challenge')
    verifier.update(safe.currentchallenge, 'base64')
    console.log(`Verifying public key ${publicKey}, challenge ${safe.currentchallenge}`)
    const result = verifier.verify(
      Buffer.from(publicKey, 'base64'),
      Buffer.from(safe.currentchallenge, 'base64'),
    )
    console.log(`Result is ${result.valueOf()}`)
    if (!result.valueOf()) {
      return { result: 'invalid' }
    }

    const clientKey = crypto.randomBytes(16).toString('hex')
    passkeys[clientId] = { publicKey, clientKey }
    await prisma.safe.update({
      where: { email },
      data: { currentchallenge: null, passkeys: JSON.stringify(passkeys) },
    })
    return { result: 'ok', clientKey }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type DeletePasskeyResult = { result: 'ok' }
| { result: 'invalid'|'error' }

export async function deletePasskey(args: {
  email: string
  hash: string
  clientId: string
}): Promise<DeletePasskeyResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    delete passkeys[clientId]
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
    })
    return { result: 'ok' }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type ChallengePasskeyResult =
  | { result: 'ok'; challenge: string; clientIds: string[] }
  | { result: 'invalid'|'error' }

export async function challengePasskey(args: { email: string }): Promise<ChallengePasskeyResult> {
  const { email } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const challenge = crypto.randomBytes(32).toString('base64')
    await prisma.safe.update({
      where: { email },
      data: { currentchallenge: challenge },
    })
    return { result: 'ok', challenge, clientIds: Object.keys(safe.passkeys) }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type VerifyPasskeyResult =
  | { result: 'ok'; clientKey: string }
  | { result: 'invalid'|'error' }

export async function verifyPasskey(args: {
  email: string
  clientId: string
  signedChallenge: string
}): Promise<VerifyPasskeyResult> {
  const { email, clientId, signedChallenge } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const passkey = passkeys[clientId]
    if (!safe.currentchallenge || !passkey || !signedChallenge) {
      return { result: 'invalid' }
    }

    // Verify challenge (ensure the client is known)
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(safe.currentchallenge, 'base64')
    const result = verifier.verify(
      Buffer.from(passkey.publicKey, 'base64'),
      Buffer.from(signedChallenge, 'base64'),
    )
    if (!result.valueOf()) {
      return { result: 'invalid' }
    }

    await prisma.safe.update({
      where: { email },
      data: { currentchallenge: null },
    })
    return { result: 'ok', clientKey: passkey.clientKey }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}
