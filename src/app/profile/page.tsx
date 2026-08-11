import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
import ProfileForm from '@/components/ProfileForm'

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân | LishTex',
  description: 'Quản lý thông tin cá nhân và ảnh đại diện',
}

export default async function ProfilePage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <ProfileForm initialProfile={profile} />
    </div>
  )
}
