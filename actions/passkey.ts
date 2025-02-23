import crypto from 'node:crypto'

export type Passkey = {
  publicKey: string | null
  challenge: string
  clientKey: string | null
}

// Record key is the client ID
export type Passkeys = Record<string, Passkey>

export type StartRegisterPasskeyResult =
  | { success: true; challenge: string }
  | { success: false; message: string }

export async function startRegisterPasskey(args: {
  email: string
  hash: string
  clientId: string
}): Promise<StartRegisterPasskeyResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const challenge = crypto.randomBytes(32).toString('hex')
    passkeys[clientId] = { publicKey: null, challenge, clientKey: null }
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
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
  clientId: string
  publicKey: string
}): Promise<FinishRegisterPasskeyResult> {
  const { email, hash, clientId, publicKey } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const passkey = passkeys[clientId]
    if (!passkey || !passkey.clientKey) {
      return { success: false, message: 'Registrierung fehlgeschlagen' }
    }
    passkeys[clientId] = { ...passkey, publicKey }
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
    })
    return { success: true, clientKey: passkey.clientKey }
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

export async function challengePasskey(args: {
  email: string
  hash: string
  clientId: string
}): Promise<ChallengePasskeyResult> {
  const { email, hash, clientId } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const passkey = passkeys[clientId]
    if (!passkey) {
      return { success: false, message: 'Verifikation fehlgeschlagen' }
    }
    const challenge = crypto.randomBytes(32).toString('hex')
    passkeys[clientId] = { ...passkey, challenge }
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
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
  hash: string
  clientId: string
  signedChallenge: string
}): Promise<VerifyPasskeyResult> {
  const { email, hash, clientId, signedChallenge } = args

  try {
    const safe = await prisma.safe.findUniqueOrThrow({ where: { email, hash } })
    const passkeys = JSON.parse(safe.passkeys) as Passkeys
    const passkey = passkeys[clientId]
    if (!passkey || !passkey.clientKey || !passkey.publicKey) {
      return { success: false, message: 'Verifikation fehlgeschlagen' }
    }

    // Verify challenge
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(passkey.challenge, 'ascii')
    const publicKeyBuf = Buffer.from(passkey.publicKey, 'ascii')
    const signatureBuf = Buffer.from(signedChallenge, 'hex')
    const result = verifier.verify(publicKeyBuf, signatureBuf)
    if (!result.valueOf()) {
      return { success: false, message: 'Verifikation fehlgeschlagen' }
    }

    passkeys[clientId] = { ...passkey, challenge: '' }
    await prisma.safe.update({
      where: { email },
      data: { passkeys: JSON.stringify(passkeys) },
    })
    return { success: true, clientKey: passkey.clientKey }
  } catch (error) {
    console.error(error)
    const message = String('message' in (error as any) ? (error as any).message : error)
    return { success: false, message }
  }
}
