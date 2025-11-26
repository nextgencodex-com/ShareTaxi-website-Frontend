"use client"

import { useRouter } from 'next/navigation'
import { UserProfilePage } from '@/components/user-profile-page'

export default function UserProfile() {
  const router = useRouter()

  return <UserProfilePage onBackToHome={() => router.push('/')} />
}
