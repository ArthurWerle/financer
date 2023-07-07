import { ReactNode } from "react"

type ModalProps = {
  isOpen: boolean
  onClose?: () => void
  onConfirm?: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, onConfirm, title = 'Modal Title', children}: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-slate-800 p-5 rounded max-w-[600px]">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
        <div className="flex gap-4">
          <button
            className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={onClose}
            >
            Cancel
          </button>
          <button 
            className="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            onClick={onConfirm}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};