'use client'

import { useAuth } from '@/providers/auth-provider'
import { useJobs } from '@/hooks/use-jobs'
import { JobCard } from '@/components/job/job-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function FeedPage() {
  const { user } = useAuth()
  const { jobs, loading, error } = useJobs()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg">Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive text-lg">Error loading jobs: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Job Feed</h1>
          <p className="text-secondary">Find your next opportunity</p>
        </div>

        <div className="grid gap-4">
          {jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {jobs?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No jobs found</p>
          </div>
        )}
      </div>
    </div>
  )
}