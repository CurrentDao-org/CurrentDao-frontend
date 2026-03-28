import './globals.css'
import './themes.css'
import '../styles/performance.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import TutorialFlow from '@/components/onboarding/TutorialFlow'
import { ThemeProvider } from '@/hooks/useTheme'
import { WebVitalsReporter } from '@/components/common/WebVitalsReporter'

// Font optimization with display swap for better LCP
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'CurrentDao - Decentralized Energy Marketplace',
  description: 'Trade energy, participate in DAO governance, and build a sustainable future with blockchain technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://horizon-testnet.stellar.org" />
        <link rel="dns-prefetch" href="https://horizon.stellar.org" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <div className="min-h-screen bg-background text-foreground">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Toaster position="top-right" />
              <TutorialFlow />
            </div>
          </Providers>
        </ThemeProvider>
        {/* Web Vitals reporting */}
        <WebVitalsReporter />
      </body>
    </html>
  )
}
