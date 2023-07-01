"use client"

import { Income } from "@/types"
import { AiOutlineEdit } from "react-icons/ai"

type RegisterProps = Pick<Income, "amount" | "description">

export default function Register({ amount, description }: RegisterProps) {
  const formattedAmount = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex group cursor-pointer gap-4">
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
