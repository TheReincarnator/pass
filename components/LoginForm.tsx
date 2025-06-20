'use client'

import { loadSafe } from '@/actions/safe'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/common/react/Button'
import { TextField } from '@/components/common/react/TextField'
import { Form } from '@/components/common/react/Form'
import { Message } from './common/react/Message'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session'
import { base64UrlToBuffer, bufferToBase64Url } from '@/lib/passkey'
import { challengePasskey, verifyPasskey } from '@/actions/passkey'
import { validators } from '@/lib/validator'
import { useForm } from 'react-hook-form'
import { PasswordField } from './common/react/PasswordField'
import { decryptPassword, getHashes } from '@/lib/crypto'

type LoginFormData = {
  email: string
  password: string
}

export function LoginForm() {
  const router = useRouter()
  const { setSafe } = useSession((state) => state)

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: typeof localStorage !== 'undefined' ? localStorage.getItem('email') || '' : '',
      password: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (form.getValues().email) {
      passwordRef?.current?.focus()
    } else {
      emailRef?.current?.focus()
    }

    window.setTimeout(tryPasskeyLogin, 0)
  }, [])

  const handlePasswordLogin = async () => {
    const { email, password } = form.getValues()

    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const emailTrimmed = email.trim()
      const { serverHash } = getHashes(emailTrimmed, password)
      const result = await loadSafe({ email: emailTrimmed, hash: serverHash })
      if (result.result !== 'ok') {
        setErrorMessage('Das hat leider nicht geklappt')
        return
      }
      setSafe({ ...result, email: emailTrimmed, password })
      localStorage.setItem('email', email)
      router.push('/list')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  const tryPasskeyLogin = async () => {
    const email = localStorage.getItem('email') || null
    const encryptedPassword = localStorage.getItem('passkeyPassword') || null
    if (!email || !encryptedPassword) {
      console.warn('Cannot try passkey login, no email setup')
      return
    }

    if (!navigator.credentials || !navigator.credentials.create || !navigator.credentials.get) {
      console.warn('Cannot try passkey login, browser does not support it')
      return
    }

    try {
      const challengePasskeyResult = await challengePasskey({ email })
      if (challengePasskeyResult.result !== 'ok') {
        console.warn('Cannot try passkey login, get challenge failed')
        return
      }
      const { challenge, clientIds } = challengePasskeyResult
      console.log(`Challenge is ${challenge}`)
      console.log(`Client IDs are ${JSON.stringify(clientIds)}`)

      // From https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
      // and https://github.com/MasterKale/SimpleWebAuthn
      // Also see https://www.passkeys.com/guide
      const credentials = await navigator.credentials.get({
        publicKey: {
          rpId: window.location.hostname,
          allowCredentials: clientIds.map((clientId) => ({
            type: 'public-key',
            id: base64UrlToBuffer(clientId),
            transports: ['internal'],
          })),
          challenge: base64UrlToBuffer(challenge),
          userVerification: 'preferred',
        },
      })
      if (!credentials) {
        console.warn('Cannot use passkey login, no passkey or user canceled')
        return
      }

      const publicKeyCredential = credentials as PublicKeyCredential
      const publicKeyResponse = publicKeyCredential.response as AuthenticatorAssertionResponse

      const verifyResult = await verifyPasskey({
        email,
        fidoData: {
          ...publicKeyCredential,
          id: publicKeyCredential.id
            ? publicKeyCredential.id
            : bufferToBase64Url(publicKeyCredential.rawId)!,
          rawId: publicKeyCredential.rawId
            ? bufferToBase64Url(publicKeyCredential.rawId)!
            : publicKeyCredential.id,
          response: {
            ...publicKeyResponse,
            clientDataJSON: bufferToBase64Url(publicKeyCredential.response.clientDataJSON)!,
            authenticatorData: bufferToBase64Url(publicKeyResponse.authenticatorData)!,
            signature: bufferToBase64Url(publicKeyResponse.signature)!,
            userHandle: publicKeyResponse.userHandle
              ? bufferToBase64Url(publicKeyResponse.userHandle)!
              : undefined,
          },
          authenticatorAttachment: 'platform',
        },
      })
      if (verifyResult.result !== 'ok') {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }
      const { clientKey } = verifyResult
      console.log(`clientKey is ${clientKey}`)

      const password = decryptPassword({ email, encrypted: encryptedPassword, clientKey })
      const { serverHash } = getHashes(email, password)
      const result = await loadSafe({ email, hash: serverHash })
      if (result.result !== 'ok') {
        setErrorMessage('Passkey-Login fehlgeschlagen')
        return
      }

      setSuccessMessage('Passkey-Login erfolgreich')
      setSafe({ ...result, email, password })
      router.push('/list')
    } catch (error) {
      console.error('Error during passkey login:', error)
      setSuccessMessage(null)
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Form form={form} onSubmit={handlePasswordLogin}>
        <p>
          Wenn du bereits einen Pass-Safe hast, gib jetzt deine Email-Adresse und dein
          Master-Passwort ein, um ihn zu entsperren.
        </p>

        <div className="form__row">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            cols={6}
            ref={emailRef}
            validators={[validators.required, validators.email]}
          />
          <PasswordField
            control={form.control}
            name="password"
            label="Master-Passwort"
            cols={6}
            ref={passwordRef}
            validators={[validators.required]}
          />
        </div>

        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}

        <div className="buttons">
          <div className="buttons__right">
            <Button type="submit" text="Entsperren" loading={loading} />
          </div>
        </div>
      </Form>
    </>
  )
}
