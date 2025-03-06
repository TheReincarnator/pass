'use server'

import crypto from 'crypto'
import prisma from '@/lib/prisma'
import type { VerifiedRegistrationResponse } from '@simplewebauthn/server'
import { verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server'
import type { IWebAuthnLoginRequest } from '@ownid/webauthn'
import { type IWebAuthnRegisterRequest } from '@ownid/webauthn'
import { rpId, expectedOrigin } from '@/lib/passkey'

export type Passkey = {
  registrationInfo: NonNullable<VerifiedRegistrationResponse['registrationInfo']>
  clientKey: string
}

// Record key is the client ID
export type Passkeys = Record<string, Passkey>

export type StartRegisterPasskeyResult =
  | { result: 'ok'; challenge: string }
  | { result: 'invalid' | 'error' }

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
    console.log(`Storing challenge ${challenge}`)
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
  | { result: 'invalid' | 'error' }

export async function finishRegisterPasskey(args: {
  email: string
  hash: string
  fidoData: IWebAuthnRegisterRequest['data']
}): Promise<FinishRegisterPasskeyResult> {
  const { email, hash, fidoData } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email, hash } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    if (!safe.currentchallenge || !fidoData) {
      return { result: 'invalid' }
    }

    console.log(`Current challenge: ${safe.currentchallenge}`)
    // Verify challenge (prevent replay attacks)
    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: { ...fidoData, clientExtensionResults: {}, type: 'public-key' },
        expectedChallenge: btoa(safe.currentchallenge).replaceAll('=', ''),
        expectedOrigin,
      })
    } catch (error) {
      console.error(error)
      return { result: 'invalid' }
    }

    const { verified, registrationInfo } = verification
    if (!verified || !registrationInfo) {
      return { result: 'invalid' }
    }

    const clientKey = crypto.randomBytes(16).toString('hex')
    passkeys[registrationInfo.credential.id] = { registrationInfo, clientKey }
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

export type DeletePasskeyResult = { result: 'ok' } | { result: 'invalid' | 'error' }

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
  | { result: 'invalid' | 'error' }

export async function challengePasskey(args: { email: string }): Promise<ChallengePasskeyResult> {
  const { email } = args

  try {
    const safe = await prisma.safe.findUnique({ where: { email } })
    if (!safe) {
      return { result: 'invalid' }
    }

    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const challenge = crypto.randomBytes(32).toString('base64')
    await prisma.safe.update({
      where: { email },
      data: { currentchallenge: challenge },
    })
    return { result: 'ok', challenge, clientIds: Object.keys(passkeys) }
  } catch (error) {
    console.error(error)
    return { result: 'error' }
  }
}

export type VerifyPasskeyResult =
  | { result: 'ok'; clientKey: string }
  | { result: 'invalid' | 'error' }

export async function verifyPasskey(args: {
  email: string
  fidoData: IWebAuthnLoginRequest['data']
}): Promise<VerifyPasskeyResult> {
  const { email, fidoData } = args
  if (!fidoData) {
    return { result: 'invalid' }
  }

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const passkey = passkeys[fidoData.id]
    if (!safe.currentchallenge || !passkey) {
      return { result: 'invalid' }
    }

    // Verify challenge (ensure the client is known)
    console.log(`Trying ${JSON.stringify(fidoData, undefined, 2)}`)
    let verification
    try {
      verification = await verifyAuthenticationResponse({
        expectedChallenge: btoa(safe.currentchallenge).replaceAll('=', ''),
        response: { ...fidoData, clientExtensionResults: {}, type: 'public-key' },
        credential: passkey.registrationInfo.credential,
        expectedRPID: rpId,
        expectedOrigin,
        requireUserVerification: false,
      })
    } catch (error) {
      console.error(error)
      return { result: 'invalid' }
    }

    const { verified } = verification
    if (!verified) {
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
