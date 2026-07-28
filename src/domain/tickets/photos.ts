import type { TicketPhotoAttachment } from '@/types/mock'

type ResizeTicketPhotoOptions = {
  maxWidth: number
  maxHeight: number
  jpegQuality: number
}

export function createTicketPhotoAttachment(
  name: string,
  dataUrl: string,
  uploadedAt = new Date().toISOString(),
): TicketPhotoAttachment {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name,
    uploadedAt,
    dataUrl,
  }
}

export function derivePhotoCaption(filename: string) {
  const cleaned = String(filename || '').trim()
  if (!cleaned) return 'Ticket Photo'
  const noExtension = cleaned.replace(/\.[a-z0-9]+$/i, '').trim()
  return noExtension || cleaned
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('Failed to read image file'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image preview'))
    image.src = dataUrl
  })
}

export async function resizeTicketPhoto(file: File, options: ResizeTicketPhotoOptions): Promise<string> {
  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImageElement(sourceDataUrl)

  const widthRatio = options.maxWidth / image.width
  const heightRatio = options.maxHeight / image.height
  const scale = Math.min(1, widthRatio, heightRatio)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to process image upload')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', options.jpegQuality)
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const base64Index = dataUrl.indexOf(',')
  if (base64Index < 0) return 0
  const base64Length = dataUrl.length - (base64Index + 1)
  return Math.floor((base64Length * 3) / 4)
}
