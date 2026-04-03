import { Job } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={job.company?.logo_url || `https://placehold.co/40x40/0D7377/FFFFFF?text=${job.company?.name?.charAt(0)}`}
            alt={job.company?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-lg text-primary">{job.title}</h3>
            <p className="text-secondary text-sm">{job.company?.name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
            {job.city}, {job.country}
          </span>
          <span className="bg-accent/10 text-accent px-2 py-1 rounded text-sm">
            {job.job_type}
          </span>
          {job.salary_min && job.salary_max && (
            <span className="bg-success/10 text-success px-2 py-1 rounded text-sm">
              ${job.salary_min}-${job.salary_max} {job.salary_currency}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{job.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <Button className="bg-primary text-white hover:bg-primary/90">
          Apply Now
        </Button>
        <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
          Save Job
        </Button>
      </div>
    </div>
  )
}