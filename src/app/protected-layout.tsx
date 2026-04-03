'use client'

import { useAuth } from '@/providers/auth-provider'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth/login')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}