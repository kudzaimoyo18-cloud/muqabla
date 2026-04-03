'use client'

import { useState, useEffect } from 'react'
import { getApplications } from '@/lib/supabase'

interface UseApplicationsReturn {
  applications: any[]
  loading: boolean
  error: Error | null
}

export function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const data = await getApplications('user-id') // Replace with actual user ID
        setApplications(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  return { applications, loading, error }
}