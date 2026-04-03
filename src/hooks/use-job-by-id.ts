'use client'

import { useState, useEffect } from 'react'
import { getJobById } from '@/lib/supabase'

interface UseJobByIdReturn {
  job: any
  loading: boolean
  error: Error | null
}

export function useJobById(jobId: string): UseJobByIdReturn {
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const data = await getJobById(jobId)
        setJob(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  return { job, loading, error }
}