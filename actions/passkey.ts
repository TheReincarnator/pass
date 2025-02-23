import crypto from 'crypto'

export type Passkey = {
  publicKey: string
  clientKey: string
}

// Record key is the client ID
export type Passkeys = Record<string, Passkey>

export type StartRegisterPasskeyResult =
  | { success: true; challenge: string }
  | { success: false; message: string }

export async function startRegisterPasskey(args: {
  email: string
  hash: string
}): Promise<StartRegisterPasskeyResult> {
  const { email, hash } = args

  try {
    await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const challenge = crypto.randomBytes(32).toString('base64')
    await prisma.safe.update({
      where: { email },
      data: { currentChallenge: challenge },
    })
    return { success: true, challenge }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type FinishRegisterPasskeyResult =
  | { success: true; clientKey: string }
  | { success: false; message: string }

export async function finishRegisterPasskey(args: {
  email: string
  hash: string
  challenge: string
  clientId: string
  publicKey: string
}): Promise<FinishRegisterPasskeyResult> {
  const { email, hash, challenge, clientId, publicKey } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    if (!safe.currentChallenge || safe.currentChallenge !== challenge || !publicKey) {
      return { success: false, message: 'Registrierung fehlgeschlagen' }
    }

    // Verify challenge (prevent replay attacks)
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(safe.currentChallenge, 'base64')
    const result = verifier.verify(
      Buffer.from(publicKey, 'base64'),
      Buffer.from(safe.currentChallenge, 'base64'),
    )
    if (!result.valueOf()) {
      return { success: false, message: 'Registrierung fehlgeschlagen' }
    }

    const clientKey = crypto.randomBytes(16).toString('hex')
    passkeys[clientId] = { publicKey, clientKey }
    await prisma.safe.update({
      where: { email },
      data: { currentChallenge: null, passkeys: JSON.stringify(passkeys) },
    })
    return { success: true, clientKey }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type DeletePasskeyResult = { success: true } | { success: false; message: string }

export async function deletePasskey(args: {
  email: string
  hash: string
  clientId: string
}): Promise<DeletePasskeyResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    delete passkeys[clientId]
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type ChallengePasskeyResult =
  | { success: true; challenge: string }
  | { success: false; message: string }

export async function challengePasskey(args: { email: string }): Promise<ChallengePasskeyResult> {
  const { email } = args

  try {
    await prisma.safe.findUniqueOrThrow({ where: { email } })
    const challenge = crypto.randomBytes(32).toString('base64')
    await prisma.safe.update({
      where: { email },
      data: { currentChallenge: challenge },
    })
    return { success: true, challenge }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}

export type VerifyPasskeyResult =
  | { success: true; clientKey: string }
  | { success: false; message: string }

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
    if (!safe.currentChallenge || !passkey || !signedChallenge) {
      return { success: false, message: 'Verifikation fehlgeschlagen' }
    }

    // Verify challenge (ensure the client is known)
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(safe.currentChallenge, 'base64')
    const result = verifier.verify(
      Buffer.from(passkey.publicKey, 'base64'),
      Buffer.from(signedChallenge, 'base64'),
    )
    if (!result.valueOf()) {
      return { success: false, message: 'Verifikation fehlgeschlagen' }
    }

    await prisma.safe.update({
      where: { email },
      data: { currentChallenge: null },
    })
    return { success: true, clientKey: passkey.clientKey }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}
