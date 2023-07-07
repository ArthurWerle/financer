"use client"

import { Register as RegisterType } from "@/types"
import { FormEvent, useState } from "react"
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai"
import RegisterForm from "./register-form"
import { useAtom } from "jotai"
import { periodAtom } from "@/atoms/period"
import { toast } from "react-toastify"
import Modal from "./modal"
import EditRegisterModal from "./edit-register-modal"

export default function Register({ id, amount, description, recursiveFor, type }: Omit<RegisterType, "date" | "periodId">) {
  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [period] = useAtom(periodAtom)

  const formattedAmount = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  async function edit(e: FormEvent<HTMLFormElement>) {
    if (!period) {
      toast.error('Error editing register')
      console.error('Couldnt find period')
      return
    }

    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const recursiveFor = formData.get('recursiveFor') as string

    const body = { amount, description, recursiveFor, id }

    const response = await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/${type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const { hasError = false, message, error } = await response.json()

    if (hasError) {
      toast.error('Error editing register')
      console.error(message, error)
      return
    }

    toast.success("Register edited")
  }

  async function remove() {
    if (!period) {
      toast.error('Error deleting register')
      console.error('Couldnt find period')
      return
    }

    const body = { id }

    const response = await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/${type}/${id}`, {
      method: 'DELETE'
    })

    const { hasError = false, message, error } = await response.json()

    if (hasError) {
      toast.error('Error deleting register')
      console.error(message, error)
      return
    }

    toast.success("Register deleted")
  }

  function renderRegister() {
    if (isEditing) return (
      <div className="flex w-fit group cursor-pointer gap-4">
        <RegisterForm 
          onSubmit={edit} 
          defaultValues={
            {
              amount,
              description,
              recursiveFor
            }
          }
          />
      </div>
    )

    return (
      <>
        <EditRegisterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <div className="flex w-fit group cursor-pointer gap-4">
          <div onClick={() => setIsModalOpen(true)}>
            <p className="group-hover:text-blue-500">R${formattedAmount}</p>
            <p className="text-sm leading-none group-hover:text-blue-500">{description}</p>
          </div>
          <button className="invisible group-hover:visible" onClick={() => setIsEditing(true)}>
            <AiOutlineEdit className="fill-blue-500" />
          </button>
          <button className="invisible group-hover:visible" onClick={remove}>
            <AiOutlineClose className="fill-red-500" />
          </button>
        </div>
      </>
    )
  }

  return renderRegister()
}
