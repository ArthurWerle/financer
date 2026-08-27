import { TextEncoder, TextDecoder } from 'util'
// jsdom doesn't expose the web text codecs that streamChat's SSE reader uses;
// they exist in the browser, so polyfill them from Node for the test env.
Object.assign(global, { TextEncoder, TextDecoder })

import {
  applyStreamEvent,
  parseSseBuffer,
  streamChat,
  ChatStreamEvent,
} from './streamChat'
import { ChatMessage } from '@/stores/useChatStore'

const base: ChatMessage = { id: 'a1', role: 'assistant', pending: true }

describe('applyStreamEvent', () => {
  it('appends token text and marks the message as streaming', () => {
    let message = applyStreamEvent(base, { type: 'token', value: 'Hel' })
    message = applyStreamEvent(message, { type: 'token', value: 'lo' })

    expect(message).toMatchObject({
      pending: false,
      streaming: true,
      error: false,
      text: 'Hello',
    })
  })

  it('tracks a tool call from running to done', () => {
    let message = applyStreamEvent(base, {
      type: 'tool_start',
      name: 'sum_transactions',
    })
    expect(message.tools).toEqual([
      { name: 'sum_transactions', status: 'running' },
    ])

    message = applyStreamEvent(message, {
      type: 'tool_end',
      name: 'sum_transactions',
    })
    expect(message.tools).toEqual([{ name: 'sum_transactions', status: 'done' }])
  })

  it('closes only the matching running tool call on tool_end', () => {
    let message = applyStreamEvent(base, { type: 'tool_start', name: 'a' })
    message = applyStreamEvent(message, { type: 'tool_start', name: 'b' })
    message = applyStreamEvent(message, { type: 'tool_end', name: 'a' })

    expect(message.tools).toEqual([
      { name: 'a', status: 'done' },
      { name: 'b', status: 'running' },
    ])
  })

  it('replaces streamed text with the authoritative answer on done', () => {
    let message = applyStreamEvent(base, { type: 'token', value: 'partial' })
    message = applyStreamEvent(message, {
      type: 'done',
      success: true,
      chatId: 'chat-1',
      answer: 'Final answer',
    })

    expect(message).toMatchObject({
      pending: false,
      streaming: false,
      error: false,
      text: 'Final answer',
    })
  })

  it('marks running tools as done when the stream finishes', () => {
    let message = applyStreamEvent(base, { type: 'tool_start', name: 'x' })
    message = applyStreamEvent(message, {
      type: 'done',
      success: true,
      chatId: 'chat-1',
      answer: 'ok',
    })

    expect(message.tools).toEqual([{ name: 'x', status: 'done' }])
  })

  it('shows a human-readable server error but never a machine code', () => {
    const notFound = applyStreamEvent(base, {
      type: 'done',
      success: false,
      error: 'Chat not found',
    })
    expect(notFound).toMatchObject({ error: true, text: 'Chat not found' })

    const credits = applyStreamEvent(base, {
      type: 'done',
      success: false,
      chatId: 'chat-1',
      error: 'insufficient_credits',
      errorCode: 'insufficient_credits',
      answer: 'You have reached the usage limit.',
    })
    // The friendly answer wins over the raw code.
    expect(credits.text).toBe('You have reached the usage limit.')

    const transport = applyStreamEvent(base, {
      type: 'done',
      success: false,
      error: 'request_failed',
    })
    expect(transport.text).toBe('Something went wrong. Please try again.')
  })
})

describe('parseSseBuffer', () => {
  it('extracts complete frames and keeps the incomplete tail', () => {
    const { events, rest } = parseSseBuffer(
      'data: {"type":"token","value":"hi"}\n\ndata: {"type":"tool_start","name":"t"}\n\ndata: {"type":"to'
    )

    expect(events).toEqual([
      { type: 'token', value: 'hi' },
      { type: 'tool_start', name: 't' },
    ])
    expect(rest).toBe('data: {"type":"to')
  })

  it('ignores non-data lines and malformed JSON without throwing', () => {
    const { events } = parseSseBuffer(
      ': comment\n\ndata: not-json\n\ndata: {"type":"token","value":"ok"}\n\n'
    )
    expect(events).toEqual([{ type: 'token', value: 'ok' }])
  })
})

// Builds a fake fetch Response whose body streams the given SSE string in
// arbitrary byte-sized chunks, exercising the reader/decoder path.
const streamingResponse = (sse: string, chunkSize = 8) => {
  const bytes = new TextEncoder().encode(sse)
  let offset = 0
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'text/event-stream; charset=utf-8' },
    body: {
      getReader: () => ({
        read: async () => {
          if (offset >= bytes.length) return { done: true, value: undefined }
          const value = bytes.slice(offset, offset + chunkSize)
          offset += chunkSize
          return { done: false, value }
        },
      }),
    },
  }
}

describe('streamChat', () => {
  const realFetch = global.fetch

  afterEach(() => {
    global.fetch = realFetch
    jest.restoreAllMocks()
  })

  it('parses the SSE body into ordered events', async () => {
    const sse =
      'data: {"type":"token","value":"R$ "}\n\n' +
      'data: {"type":"token","value":"42"}\n\n' +
      'data: {"type":"done","success":true,"chatId":"chat-1","answer":"R$ 42"}\n\n'
    global.fetch = jest.fn().mockResolvedValue(streamingResponse(sse)) as never

    const received: ChatStreamEvent[] = []
    await streamChat(
      [{ type: 'text', content: 'total?' }],
      (event) => received.push(event),
      'chat-1',
      '1'
    )

    expect(received).toEqual([
      { type: 'token', value: 'R$ ' },
      { type: 'token', value: '42' },
      { type: 'done', success: true, chatId: 'chat-1', answer: 'R$ 42' },
    ])
  })

  it('surfaces a pre-stream JSON error as a done event', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, error: 'Chat not found' }),
    }) as never

    const received: ChatStreamEvent[] = []
    await streamChat([{ type: 'text', content: 'hi' }], (event) =>
      received.push(event)
    )

    expect(received).toEqual([
      {
        type: 'done',
        success: false,
        chatId: undefined,
        answer: undefined,
        error: 'Chat not found',
        errorCode: undefined,
      },
    ])
  })
})
