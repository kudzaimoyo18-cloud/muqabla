import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getJobsFeed } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import type { Job } from '@/types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatSalary(min?: number, max?: number, currency = 'AED') {
  if (!min && !max) return null;
  const fmt = (n: number) => n.toLocaleString();
  if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${currency} ${fmt(min)}`;
  return `Up to ${currency} ${fmt(max!)}`;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract',
  freelance: 'Freelance', internship: 'Internship',
};
const WORK_MODE_LABELS: Record<string, string> = {
  on_site: 'On-site', remote: 'Remote', hybrid: 'Hybrid',
};

function JobCard({ job }: { job: Job }) {
  const salary = job.show_salary ? formatSalary(job.salary_min, job.salary_max, job.salary_currency) : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.companyLogoText}>{job.company?.name?.[0] || 'C'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.companyName}>{job.company?.name || 'Company'}</Text>
            {job.company?.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.tagText}>{job.city}, {job.country}</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons name="briefcase-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.tagText}>{JOB_TYPE_LABELS[job.job_type] || job.job_type}</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons name="laptop-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.tagText}>{WORK_MODE_LABELS[job.work_mode] || job.work_mode}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        {salary ? (
          <Text style={styles.salary}>{salary}</Text>
        ) : (
          <Text style={styles.noSalary}>Salary not disclosed</Text>
        )}
        <Text style={styles.date}>{formatDate(job.created_at)}</Text>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadJobs = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    const { data } = await getJobsFeed(undefined, 10);
    setJobs((data || []) as Job[]);
    setHasMore((data || []).length === 10);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  async function loadMore() {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const lastJob = jobs[jobs.length - 1];
    const { data } = await getJobsFeed(lastJob?.created_at, 10);
    const newJobs = (data || []) as Job[];
    setJobs((prev) => [...prev, ...newJobs]);
    setHasMore(newJobs.length === 10);
    setIsLoadingMore(false);
  }

  useEffect(() => { loadJobs(); }, [loadJobs]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Jobs</Text>
        <Text style={styles.headerSubtitle}>Latest opportunities in the GCC</Text>
      </View>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="compass-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No jobs found</Text>
          <Text style={styles.emptySubtitle}>Check back later for new opportunities</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JobCard job={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadJobs(true)} tintColor={colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.primary} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textTertiary, marginTop: 4 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', gap: 12 },
  companyLogo: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  companyLogoText: { fontSize: 20, fontWeight: '700', color: colors.textSecondary },
  cardInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  companyName: { fontSize: 13, color: colors.textSecondary },
  verifiedBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  verifiedText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  salary: { fontSize: 14, fontWeight: '600', color: colors.primary },
  noSalary: { fontSize: 13, color: colors.textTertiary },
  date: { fontSize: 12, color: colors.textTertiary },
});
