import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header'
import AppProvider from '@/providers/app-provider'
import StagingBanner from '@/components/staging-banner'
import { SpendingInsight } from '@/components/spending-insight'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Financer',
  description: 'Manage your personal finances with ease',
  applicationName: 'Financer',
  appleWebApp: {
    capable: true,
    title: 'Financer',
    statusBarStyle: 'default' as const,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
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
          <StagingBanner />
          <Header />
          <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto mb-[50px]">
            {/* Header section: AI analysis of the current month spendings */}
            <SpendingInsight />
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}
