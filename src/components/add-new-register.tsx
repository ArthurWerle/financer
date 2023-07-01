"use client"

export default function AddNewRegister() {
  function onSubmit() {
    alert('submit')
  }

  return (
    <div>
      <div className="flex group cursor-pointer gap-4">
      <form onSubmit={onSubmit}>
        <input />
        <input className="text-sm leading-none" />
      </form>
    </div>
    </div>
  )
}