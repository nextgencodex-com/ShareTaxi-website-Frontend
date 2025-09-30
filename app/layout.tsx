import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-context'
import { LanguageProvider } from '@/components/language-context'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html>
      <body className={`font-sans ${poppins.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
