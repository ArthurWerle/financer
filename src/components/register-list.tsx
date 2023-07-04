"use client"

import { Income } from "@/types"
import Register from "./register"
import { AiFillPlusCircle } from "react-icons/ai"
import React, { useState } from 'react'
import AddNewRegister from "./add-new-register"

type RegisterListProps = {
  registers?: Income[]
  title: string
}

export default function RegisterList({ title, registers = [] }: RegisterListProps) {
  const [showAddNewForm, setShowAddNewForm] = useState(false)

  function handleAddClick() {
    setShowAddNewForm(true)
  }

  return (
    <div className="flex-1">
      <div className='flex gap-4 mb-2'>
        <p className='italic text-xl'>{title}</p>
      </div>
      <div className="flex flex-col gap-3">
        {registers?.map((register) => (
          <Register key={register.id} amount={register.amount} description={register.description} recursiveFor={register.recursiveFor} />
        ))}
      </div>
      {showAddNewForm 
        ? <AddNewRegister /> 
        : (
        <button className="mx-[20px] my-[10px]" onClick={handleAddClick}>
          <AiFillPlusCircle className="hover:fill-blue-500"/>
        </button>
      )}
    </div>
  )
}
