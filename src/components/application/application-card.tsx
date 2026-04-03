import { Application } from '@/types'
import { cn } from '@/lib/utils'

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700'
      case 'viewed':
        return 'bg-blue-100 text-blue-700'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-700'
      case 'interviewing':
        return 'bg-purple-100 text-purple-700'
      case 'offered':
        return 'bg-green-100 text-green-700'
      case 'hired':
        return 'bg-green-500 text-white'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'viewed':
        return 'Viewed'
      case 'shortlisted':
        return 'Shortlisted'
      case 'interviewing':
        return 'Interviewing'
      case 'offered':
        return 'Offered'
      case 'hired':
        return 'Hired'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-primary">{application.job?.title}</h3>
          <p className="text-secondary text-sm">{application.job?.company?.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {getStatusText(application.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
        {application.cover_message && (
          <p className="text-gray-700 text-sm italic">"{application.cover_message}"</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
          View Job
        </Button>
        {application.status === 'pending' && (
          <Button variant="destructive" className="text-white">
            Withdraw Application
          </Button>
        )}
      </div>
    </div>
  )
}