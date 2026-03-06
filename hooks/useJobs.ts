import { useState, useEffect, useCallback } from 'react';
import {
  getJobsFeed,
  getJobById,
  searchJobs,
  createApplication,
  saveJob,
  unsaveJob,
  isJobSaved,
  getSavedJobs,
  getCandidateApplications,
} from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { JobWithDetails, Application, SavedJob, JobFilters } from '@/types';

// Hook for job feed (home screen)
export function useJobFeed() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (cursor?: string, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (!cursor) {
        setIsLoading(true);
      }

      const { data, error: fetchError } = await getJobsFeed(cursor);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data) {
        if (refresh || !cursor) {
          setJobs(data as JobWithDetails[]);
        } else {
          setJobs((prev) => [...prev, ...(data as JobWithDetails[])]);
        }
        setHasMore(data.length === 10);
      }
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && jobs.length > 0) {
      const lastJob = jobs[jobs.length - 1];
      fetchJobs(lastJob.created_at);
    }
  }, [fetchJobs, hasMore, isLoading, jobs]);

  const refresh = useCallback(() => {
    fetchJobs(undefined, true);
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

// Hook for single job details
export function useJob(jobId: string) {
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await getJobById(jobId);

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setJob(data as JobWithDetails);
      } catch (err) {
        setError('Failed to load job');
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  return { job, isLoading, error };
}

// Hook for job search
export function useJobSearch() {
  const [results, setResults] = useState<JobWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});

  const search = useCallback(async (newFilters?: JobFilters, cursor?: string) => {
    const activeFilters = newFilters ?? filters;
    if (newFilters) {
      setFilters(newFilters);
    }

    try {
      setIsLoading(true);
      const { data, error } = await searchJobs(activeFilters, cursor);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      if (data) {
        if (cursor) {
          setResults((prev) => [...prev, ...(data as JobWithDetails[])]);
        } else {
          setResults(data as JobWithDetails[]);
        }
        setHasMore(data.length === 20);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && results.length > 0) {
      const lastResult = results[results.length - 1];
      search(undefined, lastResult.created_at);
    }
  }, [search, hasMore, isLoading, results]);

  const clearResults = useCallback(() => {
    setResults([]);
    setFilters({});
  }, []);

  return {
    results,
    isLoading,
    hasMore,
    filters,
    search,
    loadMore,
    clearResults,
  };
}

// Hook for applying to jobs
export function useApplyToJob() {
  const { user, candidateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    async (jobId: string, videoId: string, coverMessage?: string) => {
      if (!user || !candidateProfile) {
        setError('You must be logged in as a candidate to apply');
        return { success: false };
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: applyError } = await createApplication({
          job_id: jobId,
          candidate_id: user.id,
          video_id: videoId,
          cover_message: coverMessage,
        });

        if (applyError) {
          setError(applyError.message);
          return { success: false };
        }

        return { success: true, application: data };
      } catch (err) {
        setError('Failed to submit application');
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [user, candidateProfile]
  );

  return { apply, isLoading, error };
}

// Hook for saved jobs
export function useSavedJobs() {
  const { user } = useAuthStore();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data } = await getSavedJobs(user.id);
      if (data) {
        setSavedJobs(data as SavedJob[]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const toggleSave = useCallback(
    async (jobId: string) => {
      if (!user) return { success: false };

      const { isSaved } = await isJobSaved(user.id, jobId);

      if (isSaved) {
        await unsaveJob(user.id, jobId);
        setSavedJobs((prev) => prev.filter((sj) => sj.job_id !== jobId));
      } else {
        await saveJob(user.id, jobId);
        // Refetch to get full job data
        fetchSavedJobs();
      }

      return { success: true, isSaved: !isSaved };
    },
    [user, fetchSavedJobs]
  );

  const checkIfSaved = useCallback(
    async (jobId: string) => {
      if (!user) return false;
      const { isSaved } = await isJobSaved(user.id, jobId);
      return isSaved;
    },
    [user]
  );

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return {
    savedJobs,
    isLoading,
    toggleSave,
    checkIfSaved,
    refresh: fetchSavedJobs,
  };
}

// Hook for candidate's applications
export function useMyApplications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await getCandidateApplications(user.id);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data) {
        setApplications(data as Application[]);
      }
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    error,
    refresh: fetchApplications,
  };
}
