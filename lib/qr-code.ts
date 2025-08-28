import QRCode from 'qrcode'

export async function generateQRCode(text: string, options?: {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function downloadQRCode(dataURL: string, filename: string = 'qr-code.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}