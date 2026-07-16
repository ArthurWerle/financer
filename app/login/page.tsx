'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/queries/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      router.push('/')
      router.refresh()
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        'Login failed. Please try again.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-[340px] flex-col gap-5 rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-foreground">
            <Image
              src="/favicon-32x32.png"
              alt="Financer Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div className="text-[17px] font-semibold tracking-[-0.01em]">
            Financer
          </div>
          <div className="text-[13px] text-muted-foreground">
            Sign in to your account
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 rounded-[7px] bg-background text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 rounded-[7px] bg-background text-[13px]"
            />
          </div>
          {error && (
            <p role="alert" className="text-[12.5px] text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="h-9 w-full rounded-[7px] text-[13px] font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
