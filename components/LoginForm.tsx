'use client'

import { loadSafe } from '@/actions/safe'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/common/react/Button'
import TextField from '@/components/common/react/TextField'
import Form from '@/components/common/react/Form'
import Message from './common/react/Message'
import { useRouter } from 'next/navigation'
import { bufferToBase64, decryptPassword, getHashes, useSafeStore } from '@/lib/safe'
import { challengePasskey, verifyPasskey } from '@/actions/passkey'
import { validators } from '@/lib/validator'

export default function LoginForm() {
  const router = useRouter()
  const { onLogin } = useSafeStore((state) => state)
  const [email, setEmail] = useState(
    typeof localStorage !== 'undefined' ? localStorage.getItem('email') || '' : '',
  )
  const emailRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (email) {
      passwordRef?.current?.focus()
    } else {
      emailRef?.current?.focus()
    }
  }, [])

  const handlePasswordLogin = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await loadSafe({ email: emailTrimmed, hash: serverHash })
      if (!result.success) {
        setErrorMessage(String(result.message))
        return
      }
      onLogin({ ...result, email: emailTrimmed, password })
      localStorage.setItem('email', email)
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    const email = localStorage.getItem('email') || null
    const encryptedPassword = localStorage.getItem('passkeyPassword') || null
    if (!email || !encryptedPassword) {
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
      const { challenge, clientIds } = challengePasskeyResult
      console.log(`Challenge is ${challenge}`)
      console.log(`Client IDs are ${JSON.stringify(clientIds)}`)

      // From https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
      // and https://github.com/MasterKale/SimpleWebAuthn
      const credentials = (await navigator.credentials.get({
        publicKey: {
          rpId: window.location.hostname,
          allowCredentials: clientIds.map((clientId) => ({
            type: 'public-key',
            id: Buffer.from(clientId, 'base64'),
          })),
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
        clientId: credentials.id,
        signedChallenge,
      })
      if (!verifyResult.success) {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }
      const { clientKey } = verifyResult
      console.log(`clientKey is ${clientKey}`)

      setSuccessMessage('Passkey-Login erfolgreich')

      const password = decryptPassword({ email, encrypted: encryptedPassword, clientKey })
      const { serverHash } = getHashes(email, password)
      const result = await loadSafe({ email, hash: serverHash })
      if (!result.success) {
        setErrorMessage(String(result.message))
        return
      }
      onLogin({ ...result, email, password })
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Form onSubmit={handlePasswordLogin}>
        <p>
          Wenn du bereits einen Pass-Safe hast, gib jetzt deine Email-Adresse und dein
          Master-Passwort ein, um ihn zu entsperren.
        </p>

        <div className="form__row">
          <TextField
            name="email"
            label="Email"
            value={email}
            cols={6}
            ref={emailRef}
            validators={[validators.required, validators.email]}
            onUpdate={(value) => setEmail(value)}
          />
          <TextField
            name="password"
            type="password"
            label="Master-Passwort"
            value={password}
            cols={6}
            ref={passwordRef}
            validators={[validators.required]}
            onUpdate={(value) => setPassword(value)}
          />
        </div>

        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}

        <div className="buttons">
          <div className="buttons__right">
            <Button type="submit" text="Entsperren" loading={loading} />
          </div>
        </div>

        <div className="buttons">
          <div className="buttons__right">
            <Button
              type="button"
              text="Passkey verwenden"
              loading={loading}
              onClick={handlePasskeyLogin}
            />
          </div>
        </div>
      </Form>
    </>
  )
}
