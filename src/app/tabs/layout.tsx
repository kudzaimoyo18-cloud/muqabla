'use client'

import { useAuth } from '@/providers/auth-provider'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { User } from '@/types'
import { FeedPage } from '@/app/tabs/feed/page'
import { SearchPage } from '@/app/tabs/search/page'
import { RecordPage } from '@/app/tabs/record/page'
import { ApplicationsPage } from '@/app/tabs/applications/page'
import { ProfilePage } from '@/app/tabs/profile/page'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-primary mb-6">Muqabla</h2>
            <nav className="space-y-2">
              <a href="/tabs/feed" className="block px-4 py-2 text-primary bg-primary/10 rounded-lg">Feed</a>
              <a href="/tabs/search" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Search</a>
              <a href="/tabs/record" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Record</a>
              <a href="/tabs/applications" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Applications</a>
              <a href="/tabs/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Profile</a>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}