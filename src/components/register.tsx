"use client"

import { Income } from "@/types"
import { FormEvent, useState } from "react"
import { AiOutlineEdit } from "react-icons/ai"
import RegisterForm from "./register-form"

type RegisterProps = Pick<Income, "amount" | "description" | "recursiveFor">

export default function Register({ amount, description, recursiveFor }: RegisterProps) {
  const [isEditing, setIsEditing] = useState(false)

  const formattedAmount = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function edit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget;
    const formData = new FormData(form);

    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const recursiveFor = formData.get('recursiveFor') as string;
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
      <div className="flex w-fit group cursor-pointer gap-4" onClick={() => setIsEditing(true)}>
        <div>
          <p className="group-hover:text-blue-500">R${formattedAmount}</p>
          <p className="text-sm leading-none group-hover:text-blue-500">{description}</p>
        </div>
        <button className="invisible group-hover:visible">
          <AiOutlineEdit className="fill-blue-500" />
        </button>
      </div>
    )
  }

  return renderRegister()
}
