"use client"

import { periodAtom } from "@/atoms/period";
import { useAtom } from "jotai";
import { FormEvent } from "react"
import { toast } from "react-toastify";
import RegisterForm from "./register-form";

export default function AddNewRegister({ type }: { type: string }) {
  const [period] = useAtom(periodAtom)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget;
    const formData = new FormData(form);

    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const recursiveFor = formData.get('recursiveFor') as string;

    const body = { amount, description, recursiveFor }

    if (!period) {
      toast.error('Error creating register')
      console.error('Couldnt find period')
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const { hasError = false, message, error } = await response.json()

    if (hasError) {
      toast.error('Error creating register')
      console.error(message, error)
      return
    }

    toast.success("Register added")
  }

  return (
    <div className="mt-3"> 
      <div className="flex group cursor-pointer gap-4">
      <RegisterForm onSubmit={onSubmit} />
    </div>
    </div>
  )
}