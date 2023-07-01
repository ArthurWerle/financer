"use client"

import { periodAtom } from "@/atoms/period";
import { useAtom } from "jotai";
import { FormEvent } from "react"
import { toast } from "react-toastify";

export default function AddNewRegister() {
  const [period] = useAtom(periodAtom);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    toast("Wow so easy!")

    const form = e.currentTarget;
    const formData = new FormData(form);

    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const recursiveFor = formData.get('recursiveFor') as string;

    if (!period) return

    await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/outcome`)
  }

  return (
    <div className="mt-3"> 
      <div className="flex group cursor-pointer gap-4">
      <form onSubmit={onSubmit}>
        <input name="amount" className="p-1 bg-transparent border-b w-[100px] placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" placeholder="amount"/>
        <div className="flex gap-3 mt-1">
          <input name="description" className="p-1 text-sm leading-none bg-transparent border-b w-[120px] placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" placeholder="description"/>
          <input name="recursiveFor" placeholder="X" className="p-1 bg-transparent border-b w-[25px] text-sm placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" />
        </div>
        <button className="none"></button>
      </form>
    </div>
    </div>
  )
}