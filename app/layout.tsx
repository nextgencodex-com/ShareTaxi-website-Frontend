import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import dynamic from 'next/dynamic'
// Dynamically load the Analytics component so it is only requested when rendered
const Analytics = dynamic(() => import('@vercel/analytics/next').then(m => m.Analytics), { ssr: false })
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
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
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
        {process.env.NODE_ENV === 'production' ? (
          // Load analytics only in production to avoid dev/debug script being injected
          // which can try to load debug assets or log localhost URLs.
          <Analytics />
        ) : null}

        {/* Start of Tawk.to Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/68f85959d5f2a61952692068/1j851q21m';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
        {/* End of Tawk.to Script */}
      </body>
    </html>
  )
}
