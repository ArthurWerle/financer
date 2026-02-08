export default function StagingBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'staging') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-black text-center text-sm font-semibold py-1">
      Staging Environment
    </div>
  )
}
