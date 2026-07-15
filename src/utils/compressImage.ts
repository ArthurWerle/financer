// Receipt photos are uploaded as base64-in-JSON (+~33% size), so a full-size
// phone picture blows past server body limits and wastes LLM image tokens.
// Downscale + re-encode as JPEG before upload; the original file is always
// returned when anything fails, since the server still accepts up to 15 MB.

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

const decodeImage = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file)
  }

  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("Failed to decode image"))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to encode image")),
      "image/jpeg",
      JPEG_QUALITY
    )
  })

export const compressImage = async (file: File): Promise<Blob> => {
  try {
    const image = await decodeImage(file)
    const width = "naturalWidth" in image ? image.naturalWidth : image.width
    const height = "naturalHeight" in image ? image.naturalHeight : image.height
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))

    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas 2d context unavailable")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    if ("close" in image) image.close()

    const blob = await canvasToBlob(canvas)
    return blob.size < file.size ? blob : file
  } catch {
    return file
  }
}
