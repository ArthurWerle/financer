"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Radix disables pointer events on <body> while a modal layer is open and, on
// close, writes back whatever the body had when that layer mounted. A dialog
// opened from a dropdown menu mounts while the menu layer is still up (the menu
// has an exit animation), so it captures "none" and restores it on close,
// leaving the whole app unclickable. Deduping the Radix layer packages fixes the
// capture; this guard makes sure a stuck body always recovers.
const OPEN_LAYER_SELECTOR = [
  '[data-state="open"][role="dialog"]',
  '[data-state="open"][role="alertdialog"]',
  '[data-state="open"][role="menu"]',
  '[data-state="open"][role="listbox"]',
].join(",")

const releaseBodyPointerEvents = () => {
  if (typeof document === "undefined") return
  // Two frames so Radix has finished swapping data-state on the closing layer.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (document.querySelector(OPEN_LAYER_SELECTOR)) return
      if (document.body.style.pointerEvents !== "none") return
      document.body.style.removeProperty("pointer-events")
    })
  })
}

// Most dialogs here are closed programmatically (the create handlers call
// setOpen(false) after the request), and Root only fires onOpenChange for
// user-driven dismissals, so watch the open prop too.
const Dialog = ({ open, onOpenChange, ...props }: DialogPrimitive.DialogProps) => {
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen)
      if (!nextOpen) releaseBodyPointerEvents()
    },
    [onOpenChange]
  )

  React.useEffect(() => {
    if (open === false) releaseBodyPointerEvents()
  }, [open])

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      {...props}
    />
  )
}
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/55 transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 grid h-dvh max-h-dvh w-full translate-x-0 translate-y-0 content-start gap-3.5 rounded-none border-0 bg-card p-6 overflow-y-auto animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-[380px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:border-border sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[5px] p-1 text-faint transition-colors hover:text-foreground focus:outline-none">
        <X className="h-[15px] w-[15px]" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-[15px] font-semibold leading-none tracking-tight pr-5",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
