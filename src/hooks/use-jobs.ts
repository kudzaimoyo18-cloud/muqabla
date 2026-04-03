'use client'

import { useState, useEffect } from 'react'
import { getJobs } from '@/lib/supabase'

interface UseJobsReturn {
  jobs: any[]
  loading: boolean
  error: Error | null
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const data = await getJobs()
        setJobs(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return { jobs, loading, error }
}