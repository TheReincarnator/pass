'use client'

import { createSafe } from '@/actions/safe'
import { useState } from 'react'
import Button from '@/components/common/react/Button'
import TextField from '@/components/common/react/TextField'
import Form from '@/components/common/react/Form'
import { useRouter } from 'next/navigation'
import Message from './common/react/Message'
import { validators } from '@/lib/validator'
import { bufferToBase64, encryptPassword, encryptSafe, getHashes, useSafeStore } from '@/lib/safe'
import {
  challengePasskey,
  finishRegisterPasskey,
  startRegisterPasskey,
  verifyPasskey,
} from '@/actions/passkey'

export default function RegisterForm() {
  const router = useRouter()
  const { onLogin } = useSafeStore((state) => state)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const encrypted = encryptSafe({ email: emailTrimmed, password })
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await createSafe({ email: emailTrimmed, hash: serverHash, encrypted })
      if (!result.success) {
        setErrorMessage(String(result.message))
        return
      }
      onLogin({ ...result, email: emailTrimmed, password })
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('email', emailTrimmed)
      }
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  const handleStorePassword = async () => {
    if (!navigator.credentials || !navigator.credentials.create || !navigator.credentials.get) {
      setErrorMessage('Dein Browser unterstützt leider keine Passwort-Speicherung')
      return
    }

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const { serverHash } = getHashes(emailTrimmed, password)

      const startRegisterResult = await startRegisterPasskey({
        email: emailTrimmed,
        hash: serverHash,
      })
      if (!startRegisterResult.success) {
        setErrorMessage(String(startRegisterResult.message))
        return
      }
      const { challenge } = startRegisterResult
      console.log(`Challenge is ${challenge}`)

      // From https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
      const credentials = (await navigator.credentials.create({
        publicKey: {
          rp: { name: 'Pass', id: window.location.hostname },
          user: {
            id: Buffer.from(emailTrimmed, 'utf8'),
            name: emailTrimmed,
            displayName: emailTrimmed,
          },
          challenge: Buffer.from(challenge, 'base64'),
          pubKeyCredParams: [{ type: 'public-key', alg: -257 }],
          timeout: 60000,
          authenticatorSelection: {
            residentKey: 'preferred',
            requireResidentKey: false,
            userVerification: 'preferred',
          },
          attestation: 'none',
          extensions: { credProps: true },
        },
      })) as PublicKeyCredential | null
      if (!credentials) {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }

      const attestation = credentials.response as AuthenticatorAttestationResponse
      const clientId = credentials.id
      console.log(`clientId is ${clientId}`)
      const publicKey = bufferToBase64(attestation.getPublicKey?.())
      console.log(`publicKey is ${publicKey}`)
      if (!clientId || !publicKey) {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }

      const finishRegisterResult = await finishRegisterPasskey({
        email: emailTrimmed,
        hash: serverHash,
        clientId,
        challenge,
        publicKey,
      })
      if (!finishRegisterResult.success) {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }
      const { clientKey } = finishRegisterResult
      const passkeyAuth = {
        email,
        encryptedPassword: encryptPassword({ email, password, clientKey }),
      }
      localStorage.setItem('passkeyAuth', JSON.stringify(passkeyAuth))
      console.log(`clientKey is ${clientKey}`)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }

    setSuccessMessage('Passwort-Speicherung erfolgreich')
  }

  const handleGetPassword = async () => {
    let email = null
    let encryptedPassword = null
    try {
      const passkeyAuth = JSON.parse(localStorage.getItem('passkeyAuth') as any)
      email = passkeyAuth.email
      encryptedPassword = passkeyAuth.encryptedPassword
    } catch {
      setErrorMessage('Kein Passwort gespeichert')
      return
    }

    if (!navigator.credentials || !navigator.credentials.create || !navigator.credentials.get) {
      setErrorMessage('Dein Browser unterstützt leider keine Passwort-Speicherung')
      return
    }

    setLoading(true)
    try {
      // TODO
      const challengePasskeyResult = await challengePasskey({ email })
      if (!challengePasskeyResult.success) {
        setErrorMessage(String(challengePasskeyResult.message))
        return
      }
      const { challenge } = challengePasskeyResult
      console.log(`Challenge is ${challenge}`)

      // From https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
      const credentials = (await navigator.credentials.get({
        publicKey: {
          rpId: window.location.hostname,
          challenge: Buffer.from(challenge, 'base64'),
        },
      })) as PublicKeyCredential | null
      if (!credentials) {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }

      const credentialsResponse = credentials.response as AuthenticatorAssertionResponse
      const signedChallenge = bufferToBase64(credentialsResponse.signature)
      console.log(`signedChallenge is ${signedChallenge}`)
      if (!signedChallenge) {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }

      const verifyResult = await verifyPasskey({
        email,
        clientId,
        signedChallenge,
      })
      if (!verifyResult.success) {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }
      const { clientKey } = verifyResult
      console.log(`clientKey is ${clientKey}`)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }

    setSuccessMessage('Passkey-Login erfolgreich')
  }

  return (
    <Form onSubmit={handleRegister}>
      <div className="form__row">
        <TextField
          name="email"
          label="Email"
          value={email}
          validators={[validators.required, validators.email]}
          onUpdate={(value) => setEmail(value)}
        />
        <TextField
          name="password"
          type="password"
          label="Master-Passwort"
          value={password}
          validators={[validators.required, validators.minLength(8), validators.password]}
          onUpdate={(value) => setPassword(value)}
        />
        <TextField
          name="passwordRepeat"
          type="password"
          label="Master-Passwort (Wiederholung)"
          value={passwordRepeat}
          validators={[
            validators.required,
            validators.match(password, 'Passwörter stimmen nicht überein'),
          ]}
          onUpdate={(value) => setPasswordRepeat(value)}
        />
      </div>

      <a onClick={handleStorePassword}>Anmeldung im Gerät speichern</a>
      <a onClick={handleGetPassword}>handleGetPassword</a>

      {!loading && password && !successMessage && !errorMessage && (
        <Message
          type="warning"
          text="Achtung! Merke dir dein Passwort gut, oder schreibe es dir auf. Du kannst dein Passwort
          nicht zurücksetzen, und niemand kann den Safe retten, wenn du es vergessen solltest."
        />
      )}

      {errorMessage && <Message type="error" text={errorMessage} />}
      {successMessage && <Message type="ok" text={successMessage} />}

      <div className="buttons">
        <div className="buttons__right">
          <Button type="submit" text="Registrieren" loading={loading} />
        </div>
      </div>
    </Form>
  )
}
