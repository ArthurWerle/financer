import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

type Option = {
  id: string
  label: string
  action: () => void
}

const options: Option[] = [
  {
    id: "option1",
    label: "Add Expense",
    action: () => {
      //todo: improve how I do this
      const button = document.querySelector('#add-expense-button') as HTMLButtonElement

      if (button) {
        button.click()
      }
    },
  },
  {
    id: "option2",
    label: "Add Income",
    action: () => {
      //todo: improve how I do this
      const button = document.querySelector('#add-income-button') as HTMLButtonElement

      if (button) {
        button.click()
      }
    },
  },
  {
    id: "option3",
    label: "Go to Categories",
    action: () => {
      window.location.href = '/categories'
    },
  },
  {
    id: "option2",
    label: "Go to Transactions",
    action: () => {
      window.location.href = '/transactions'
    },
  },
]

export const KeyboardNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setIsModalOpen((prev) => !prev)
        return
      }

      if (!isModalOpen) return

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setFocusedOptionIndex((prevIndex) => (prevIndex + 1) % options.length)
          break
        case "ArrowUp":
          event.preventDefault()
          setFocusedOptionIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length)
          break
        case "Enter":
          event.preventDefault();
          options[focusedOptionIndex]?.action()
          setIsModalOpen(false)
          break
        case "Escape":
          event.preventDefault()
          setIsModalOpen(false)
          break
      }
    },
    [isModalOpen, focusedOptionIndex]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <ul>
            {options.map((option, index) => (
              <li
                tabIndex={-1}
                key={option.id}
                className={`p-2 my-1 rounded cursor-pointer transition-colors ${
                  index === focusedOptionIndex ? "bg-gray-100" : ""
                }`}
                onClick={() => {
                  option.action();
                  setIsModalOpen(false);
                }}
                onMouseEnter={() => setFocusedOptionIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      {children}
    </>
  )
}
