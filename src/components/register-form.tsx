import { FormEvent } from "react"

export type RegisterFormProps = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  defaultValues?: {
    amount?: number
    description?: string
    recursiveFor?: number
  }
}

export default function RegisterForm({ onSubmit, defaultValues }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <input name="amount" defaultValue={defaultValues?.amount} className="p-1 bg-transparent border-b w-[100px] placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" placeholder="amount"/>
      <div className="flex gap-3 mt-1">
        <input name="description" defaultValue={defaultValues?.description} className="p-1 text-sm leading-none bg-transparent border-b w-[120px] placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" placeholder="description"/>
        <input name="recursiveFor" defaultValue={defaultValues?.recursiveFor || ''} placeholder="X" className="p-1 bg-transparent border-b w-[25px] text-sm placeholder:italic placeholder:text-slate-600 placeholder:text-[12px]" />
      </div>
      <button className="none hidden"></button>
    </form>
  )
}