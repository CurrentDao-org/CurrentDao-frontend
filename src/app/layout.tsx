import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import TutorialFlow from '@/components/onboarding/TutorialFlow'
import { ThemeProvider } from '@/hooks/useTheme'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
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
      </body>
    </html>
  )
}
