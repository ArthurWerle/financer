import { act, render, screen } from '@/utils/test-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

const flushFrames = async () => {
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
  })
}

const Fixture = ({ open }: { open: boolean }) => (
  <Dialog open={open} onOpenChange={() => {}}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New expense</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)

afterEach(() => {
  document.body.style.removeProperty('pointer-events')
})

describe('Dialog', () => {
  // The create handlers close the dialog programmatically (setOpen(false) in a
  // .finally()), and Radix's Root does not fire onOpenChange for that, so the
  // guard has to watch the open prop as well.
  it('frees the body when closed programmatically', async () => {
    // Stands for the lock a dropdown menu still holds when the dialog mounts:
    // Radix captures this value and writes it back on close, which is what left
    // the whole app unclickable.
    document.body.style.pointerEvents = 'none'

    const { rerender } = render(<Fixture open />)
    expect(screen.getByRole('heading', { name: 'New expense' })).toBeInTheDocument()

    rerender(<Fixture open={false} />)
    await flushFrames()

    expect(document.body.style.pointerEvents).not.toBe('none')
  })

  it('keeps the body locked while another layer is still open', async () => {
    const WithMenu = ({ open }: { open: boolean }) => (
      <>
        <Fixture open={open} />
        <div role="menu" data-state="open" />
      </>
    )
    const { rerender } = render(<WithMenu open />)
    rerender(<WithMenu open={false} />)

    // Set after Radix's own cleanup ran: this stands for the pointer-events
    // lock the still-open menu legitimately holds.
    document.body.style.pointerEvents = 'none'
    await flushFrames()

    expect(document.body.style.pointerEvents).toBe('none')
  })
})
