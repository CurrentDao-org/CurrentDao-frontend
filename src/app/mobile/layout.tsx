import '../globals.css';
import '../../styles/mobile.css';
import { Inter } from 'next/font/google';
import { Providers } from '../providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CurrentDao Mobile - Trade Energy Anywhere',
  description: 'Mobile-optimized energy trading on CurrentDao',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} no-scroll-visual bg-background`}>
        <Providers>
           {children}
        </Providers>
      </body>
    </html>
  );
}
