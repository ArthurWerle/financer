import { useChatStore } from './useChatStore'

const resetStore = () => useChatStore.setState({ isOpen: false, messages: [] })

describe('useChatStore', () => {
  beforeEach(resetStore)

  it('opens, closes and toggles the panel', () => {
    expect(useChatStore.getState().isOpen).toBe(false)

    useChatStore.getState().toggle()
    expect(useChatStore.getState().isOpen).toBe(true)

    useChatStore.getState().close()
    expect(useChatStore.getState().isOpen).toBe(false)

    useChatStore.getState().open()
    expect(useChatStore.getState().isOpen).toBe(true)
  })

  it('adds and then updates a message by id', () => {
    useChatStore
      .getState()
      .addMessage({ id: 'a', role: 'assistant', pending: true })
    expect(useChatStore.getState().messages).toHaveLength(1)

    useChatStore.getState().updateMessage('a', { pending: false, text: 'done' })
    const [message] = useChatStore.getState().messages
    expect(message.pending).toBe(false)
    expect(message.text).toBe('done')
  })

  it('leaves messages untouched when updating an unknown id', () => {
    useChatStore.getState().addMessage({ id: 'a', role: 'user', text: 'hi' })
    useChatStore.getState().updateMessage('missing', { text: 'changed' })
    expect(useChatStore.getState().messages[0].text).toBe('hi')
  })

  it('reset clears the conversation', () => {
    useChatStore.getState().addMessage({ id: 'a', role: 'user', text: 'hi' })
    useChatStore.getState().reset()
    expect(useChatStore.getState().messages).toHaveLength(0)
  })
})
