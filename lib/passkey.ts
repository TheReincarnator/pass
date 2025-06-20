export const rpId = 'pass.thomasjacob.de'
export const expectedOrigin = 'https://pass.thomasjacob.de'

export function bufferToBase64Url(buffer: ArrayBufferLike | null | undefined): string | null {
  if (!buffer) {
    return null
  }
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
  )
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return base64Url
}

export function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; ++i) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
