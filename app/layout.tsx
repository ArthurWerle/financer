import './globals.css'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import Sidebar from '@/components/sidebar'
import AppProvider from '@/providers/app-provider'
import StagingBanner from '@/components/staging-banner'
import { SpendingInsight } from '@/components/spending-insight'

const geistSans = localFont({
  src: '../src/fonts/GeistVF.woff',
  variable: '--font-geist',
})

const geistMono = localFont({
  src: '../src/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

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
  themeColor: '#0a0a0b',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppProvider>
            <StagingBanner />
            <div className="flex h-dvh flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-4 pb-14 pt-6 md:px-8">
                  <SpendingInsight />
                  {children}
                </div>
              </main>
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
