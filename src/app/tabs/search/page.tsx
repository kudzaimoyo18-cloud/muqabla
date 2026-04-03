'use client'

import { useAuth } from '@/providers/auth-provider'
import { useJobs } from '@/hooks/use-jobs'
import { JobCard } from '@/components/job/job-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function SearchPage() {
  const { user } = useAuth()
  const { jobs, loading, error } = useJobs()
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredJobs = jobs?.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Job Search</h1>
          <p className="text-secondary">Find your perfect match</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Search jobs
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter job title, company, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredJobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {filteredJobs?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No jobs found matching your search</p>
          </div>
        )}
      </div>
    </div>
  )
}