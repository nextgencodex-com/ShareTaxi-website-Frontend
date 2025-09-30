import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-context'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Share Taxi Sri Lanka',
  description: 'Share Taxi Sri Lanka',
  generator: 'Share Taxi Sri Lanka',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${poppins.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
