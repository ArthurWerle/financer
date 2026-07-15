import { compressImage } from './compressImage'

// jsdom has no real canvas or createImageBitmap, so both are stubbed here.
const makeFakeCanvas = (blob: Blob | null) => {
  const context = { drawImage: jest.fn() }
  const canvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => context),
    toBlob: jest.fn((cb: (blob: Blob | null) => void) => cb(blob)),
  }
  return canvas as unknown as HTMLCanvasElement
}

const stubCanvas = (canvas: HTMLCanvasElement) =>
  jest
    .spyOn(document, 'createElement')
    .mockImplementation(() => canvas as unknown as HTMLElement)

describe('compressImage', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap
    jest.restoreAllMocks()
  })

  it('returns the original file when the image cannot be decoded', async () => {
    globalThis.createImageBitmap = jest
      .fn()
      .mockRejectedValue(new Error('unsupported format'))

    const file = new File(['x'.repeat(100)], 'receipt.heic', {
      type: 'image/heic',
    })

    await expect(compressImage(file)).resolves.toBe(file)
  })

  it('returns the original file when compression does not shrink it', async () => {
    globalThis.createImageBitmap = jest
      .fn()
      .mockResolvedValue({ width: 100, height: 100, close: jest.fn() })

    const file = new File(['x'.repeat(10)], 'tiny.jpg', { type: 'image/jpeg' })
    stubCanvas(makeFakeCanvas(new Blob(['y'.repeat(1000)])))

    await expect(compressImage(file)).resolves.toBe(file)
  })

  it('downscales large images and returns the smaller jpeg blob', async () => {
    const close = jest.fn()
    globalThis.createImageBitmap = jest
      .fn()
      .mockResolvedValue({ width: 4000, height: 3000, close })

    const file = new File(['x'.repeat(5000)], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const compressed = new Blob(['y'.repeat(50)], { type: 'image/jpeg' })
    const canvas = makeFakeCanvas(compressed)
    stubCanvas(canvas)

    await expect(compressImage(file)).resolves.toBe(compressed)
    // longest edge capped at 1600px, aspect ratio preserved
    expect(canvas.width).toBe(1600)
    expect(canvas.height).toBe(1200)
    expect(close).toHaveBeenCalled()
  })

  it('does not upscale images already within the size cap', async () => {
    globalThis.createImageBitmap = jest
      .fn()
      .mockResolvedValue({ width: 800, height: 600, close: jest.fn() })

    const file = new File(['x'.repeat(5000)], 'small.jpg', {
      type: 'image/jpeg',
    })
    const canvas = makeFakeCanvas(new Blob(['y'.repeat(50)]))
    stubCanvas(canvas)

    await compressImage(file)

    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)
  })
})
