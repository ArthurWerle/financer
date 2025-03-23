import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header'
import AppProvider from '@/providers/app-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Financer',
  description: 'Manage your personal finances with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Header />
          <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto mb-[50px]">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}

