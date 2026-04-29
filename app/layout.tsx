// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';                    // This should now stop erroring

export const metadata: Metadata = {
  title: 'CurrentDao',
  description: 'Stellar-based DAO platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;          // Fixed ReactNode import issue
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}