'use client'

import { useAuth } from '@/providers/auth-provider'
import { useJobById } from '@/hooks/use-job-by-id'
import { VideoPlayer } from '@/components/video/video-player'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface JobDetailPageProps {
  params: { id: string }
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { user } = useAuth()
  const { job, loading, error } = useJobById(params.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg">Loading job details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive text-lg">Error loading job: {error.message}</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary text-lg">Job not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{job.title}</h1>
              <p className="text-secondary text-lg">{job.company?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {job.city}, {job.country}
              </span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                {job.job_type}
              </span>
            </div>
          </div>

          {job.video_id && (
            <div className="mb-6">
              <VideoPlayer videoUrl={`https://videos.prd.nym2.view.stream-io-cdn.com/${job.video_id}/index.m3u8`} />
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Job Description</h2>
              <p className="text-gray-700">{job.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits?.map((benefit, index) => (
                  <span key={index} className="bg-success/10 text-success px-3 py-1 rounded-full text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button className="bg-primary text-white hover:bg-primary/90 text-lg font-semibold py-3 px-6 rounded-lg">
              Apply with Video
            </Button>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              Save Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}