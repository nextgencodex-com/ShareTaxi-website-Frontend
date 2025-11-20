import HomeClient from './HomeClient'

// Provide locale variants so this dynamic route can be statically exported.
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'si' },
    { locale: 'ta' },
  ]
}

export default function Page() {
  return <HomeClient />
}
