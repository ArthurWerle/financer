import { toUiMessage } from './mapServerMessage'
import { ServerChatMessage } from './types'

const baseMessage: ServerChatMessage = {
  id: 'm1',
  chatId: 'chat-1',
  role: 'user',
  content: 'hello',
  metadata: null,
  createdAt: '2026-07-13T10:00:00Z',
  attachments: [],
}

describe('toUiMessage', () => {
  it('maps a text-only message', () => {
    expect(toUiMessage(baseMessage)).toEqual({
      id: 'm1',
      role: 'user',
      text: 'hello',
      imageDataUrl: undefined,
      audioName: undefined,
    })
  })

  it('builds a data url from an image attachment with a mime type', () => {
    const message = {
      ...baseMessage,
      attachments: [
        {
          id: 'a1',
          messageId: 'm1',
          type: 'image' as const,
          content: 'BASE64',
          mimeType: 'image/png',
          createdAt: '2026-07-13T10:00:00Z',
        },
      ],
    }

    expect(toUiMessage(message).imageDataUrl).toBe(
      'data:image/png;base64,BASE64'
    )
  })

  it('falls back to image/jpeg when the mime type is missing', () => {
    const message = {
      ...baseMessage,
      attachments: [
        {
          id: 'a1',
          messageId: 'm1',
          type: 'image' as const,
          content: 'BASE64',
          mimeType: null,
          createdAt: '2026-07-13T10:00:00Z',
        },
      ],
    }

    expect(toUiMessage(message).imageDataUrl).toBe(
      'data:image/jpeg;base64,BASE64'
    )
  })

  it('labels audio attachments generically (filename is not persisted)', () => {
    const message = {
      ...baseMessage,
      attachments: [
        {
          id: 'a1',
          messageId: 'm1',
          type: 'audio' as const,
          content: 'BASE64',
          mimeType: 'audio/mpeg',
          createdAt: '2026-07-13T10:00:00Z',
        },
      ],
    }

    const ui = toUiMessage(message)
    expect(ui.audioName).toBe('Audio message')
    expect(ui.imageDataUrl).toBeUndefined()
  })

  it('leaves text undefined for an attachment-only message', () => {
    expect(toUiMessage({ ...baseMessage, content: '' }).text).toBeUndefined()
  })
})
