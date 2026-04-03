'use client'

import { useAuth } from '@/providers/auth-provider'
import { useApplications } from '@/hooks/use-applications'
import { ApplicationCard } from '@/components/application/application-card'
import { cn } from '@/lib/utils'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { applications, loading, error } = useApplications()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg">Loading applications...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive text-lg">Error loading applications: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">My Applications</h1>
          <p className="text-secondary">Track your job applications</p>
        </div>

        <div className="space-y-4">
          {applications?.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>

        {applications?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No applications yet</p>
            <p className="text-gray-500 mt-2">Start applying to jobs to see your applications here</p>
          </div>
        )}
      </div>
    </div>
  )
}