'use client'

import { EntryRow } from '@/components/EntryRow'
import type { ToggleApi } from '@/components/FolderRow'
import { FolderRow, ToggleContext } from '@/components/FolderRow'
import { useRouter } from 'next/navigation'
import { encryptPassword, getHashes, useSafeStore } from '@/lib/safe'
import { useEffect, useState } from 'react'
import { finishRegisterPasskey, startRegisterPasskey } from '@/actions/passkey'
import { Message } from '@/components/common/react/Message'
import { fido2Create } from '@ownid/webauthn'
import { rpId } from '@/lib/passkey'

export default function List() {
  const router = useRouter()
  const { safe, email, password } = useSafeStore((state) => state)
  const [openFolders, setOpenFolders] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const toggleApi: ToggleApi = {
    openFolders,
    open: (id: number) => {
      const copy = openFolders.filter((candidate) => candidate !== id)
      setOpenFolders([...copy, id])
    },
    close: (id: number) => {
      const copy = openFolders.filter((candidate) => candidate !== id)
      setOpenFolders(copy)
    },
  }

  useEffect(() => {
    if (!safe) {
      router.push('/')
    }
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
      const fidoData = await fido2Create(
        {
          rp: { name: 'Pass', id: rpId },
          user: {
            id: Buffer.from(email, 'utf8'),
            name: email,
            displayName: email,
          },
          challenge,
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
        email,
      )
      if (!fidoData?.data) {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }

      const finishRegisterResult = await finishRegisterPasskey({
        email,
        hash: serverHash,
        fidoData: fidoData.data,
      })
      if (finishRegisterResult.result !== 'ok') {
        setErrorMessage('Passwort-Speicherung fehlgeschlagen')
        return
      }
      const { clientKey } = finishRegisterResult
      localStorage.setItem('email', email)
      localStorage.setItem('passkeyPassword', encryptPassword({ email, password, clientKey }))
      console.log(`clientKey is ${clientKey}`)

      setSuccessMessage('Passwort-Speicherung erfolgreich')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title mx-n2">Dein Pass-Safe</h1>
      </header>

      <div className="page-content">
        <p>
          <a onClick={handleStorePassword}>Anmeldung im Gerät speichern</a>
        </p>

        {loading && 'Loading...'}
        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="ok" text={successMessage} />}

        <div className="table-wrapper mx-n2">
          <table>
            <tbody>
              <ToggleContext.Provider value={toggleApi}>
                {safe.entries.map((child) =>
                  child.type === 'folder' ? (
                    <FolderRow key={child.id} folder={child} indentation={0} />
                  ) : (
                    <EntryRow key={child.id} entry={child} indentation={0} />
                  ),
                )}
              </ToggleContext.Provider>
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}
