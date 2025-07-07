'use client'

import { EntryRow } from '@/components/EntryRow'
import { FolderRow } from '@/components/FolderRow'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session'
import { base64UrlToBuffer, bufferToBase64Url } from '@/lib/passkey'
import { useEffect, useState } from 'react'
import { finishRegisterPasskey, startRegisterPasskey } from '@/actions/passkey'
import { Message } from '@/components/common/react/Message'
import { RP_ID } from '@/lib/passkey'
import { encryptPassword, getHashes } from '@/lib/crypto'
import { Button } from '@/components/common/react/Button'
import type { AuthenticatorAttestationResponse } from '@simplewebauthn/server'

export default function List() {
  const router = useRouter()
  const { safe, email, password, isPasskeyLogin, setPasskeyLogin } = useSession((state) => state)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // if (!safe) {
    //   router.push('/')
    // }
  }, [])

  if (!safe) {
    return null
  }

  const handleStorePassword = async () => {
    if (!navigator.credentials || !navigator.credentials.create || !navigator.credentials.get) {
      setErrorMessage('Dein Browser unterstützt leider keine Passwort-Speicherung')
      return
    }

    if (!email || !password) {
      setErrorMessage('Du bist scheinbar nicht mehr eingeloggt')
      return
    }

    setLoading(true)
    try {
      const { serverHash } = getHashes(email, password!)

      const startRegisterResult = await startRegisterPasskey({
        email,
        hash: serverHash,
      })
      if (startRegisterResult.result !== 'ok') {
        setErrorMessage('Das hat leider nicht geklappt')
        return
      }
      const { challenge } = startRegisterResult
      console.log(`Challenge is ${challenge}`)

      // From https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
      // and https://github.com/MasterKale/SimpleWebAuthn
      const credentials = await navigator.credentials.create({
        publicKey: {
          rp: { name: 'Pass', id: RP_ID },
          user: {
            id: Buffer.from(email, 'utf8'),
            name: email,
            displayName: email,
          },
          challenge: base64UrlToBuffer(challenge),
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
          },
          attestation: 'none',
          extensions: { credProps: true },
        },
      })
      if (!credentials) {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }

      const publicKeyCredential = credentials as PublicKeyCredential
      const publicKeyResponse = publicKeyCredential.response as AuthenticatorAttestationResponse

      const finishRegisterResult = await finishRegisterPasskey({
        email,
        hash: serverHash,
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
            attestationObject: bufferToBase64Url(publicKeyResponse.attestationObject)!,
          },
          authenticatorAttachment: 'platform',
        },
      })
      if (finishRegisterResult.result !== 'ok') {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }
      const { clientKey } = finishRegisterResult
      localStorage.setItem('email', email)
      localStorage.setItem('passkeyPassword', encryptPassword({ email, password, clientKey }))
      setPasskeyLogin(true)
      console.log(`clientKey is ${clientKey}`)

      setSuccessMessage('Passwort-Speicherung erfolgreich')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  const handleNewFolder = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    router.push('/folder/new')
  }

  const handleNewEntry = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    router.push('/entry/new')
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title mx-n2">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">
        {!isPasskeyLogin && (
          <p>
            <Button
              type="button"
              variant="secondary"
              leftIcon="500px fa-flip-horizontal"
              text="Anmeldung im Gerät speichern"
              loading={loading}
              onClick={handleStorePassword}
            />
          </p>
        )}

        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}

        <div className="table-wrapper mx-n2">
          <table>
            <tbody>
              {safe.entries.map((child) =>
                child.type === 'folder' ? (
                  <FolderRow key={child.id} folder={child} indentation={0} />
                ) : (
                  <EntryRow key={child.id} entry={child} indentation={0} />
                ),
              )}
            </tbody>
          </table>
        </div>

        <div className="buttons">
          <div className="buttons__right">
            <Button
              type="button"
              variant="secondary"
              text="Neuer Ordner"
              onClick={handleNewFolder}
            />
            <Button type="button" text="Neuer Eintrag" onClick={handleNewEntry} />
          </div>
        </div>
      </div>
    </article>
  )
}
