'use client'

import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg">Please log in to view your profile</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
            <p className="text-secondary">Manage your account and preferences</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <img
                src={user.avatar_url || `https://placehold.co/120x120/0D7377/FFFFFF?text=${user.full_name?.charAt(0)}`}
                alt={user.full_name}
                className="w-30 h-30 rounded-full"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-primary">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="font-medium capitalize">{user.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Language</p>
                    <p className="font-medium">{user.language}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-primary">Profile Video</h2>
                <div className="bg-gray-100 rounded-lg p-4 mt-4">
                  <p className="text-center text-gray-600">No profile video uploaded yet</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-primary">Statistics</h2>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-gray-600">Applications Sent</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-accent">0</p>
                    <p className="text-sm text-gray-600">Profile Views</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success">0</p>
                    <p className="text-sm text-gray-600">Jobs Saved</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Edit Profile
                </Button>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}