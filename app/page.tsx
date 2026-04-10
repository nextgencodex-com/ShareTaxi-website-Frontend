import { redirect } from 'next/navigation'

// Redirect root to the English localized page so
// visiting / in dev or production goes to /en
export default function Page() {
  redirect('/en')
}
