import Modal from "./modal"

type EditRegisterModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function EditRegisterModal({ isOpen, onClose }: EditRegisterModalProps) {

  // const categoriesResponse = await fetch(process.env.NEXT_PUBLIC_REQUEST_URL + '/api/category')
  // const categories = await categoriesResponse.json()

  return (
    <Modal isOpen={isOpen} title="✍🏻" onClose={onClose}>
      <h1>editing</h1>
    </Modal>
  )
}