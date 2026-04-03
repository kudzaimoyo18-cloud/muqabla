'use client'

import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  children: React.ReactNode
}

export function Navigation({ children }: NavigationProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {children}

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center p-2 text-primary">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Feed</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xl">🔍</span>
            <span className="text-xs mt-1">Search</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xl">📹</span>
            <span className="text-xs mt-1">Record</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1">Applications</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}