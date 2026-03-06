import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidateApplications } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { APPLICATION_STATUS } from '@/constants/config';
import type { Application } from '@/types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function ApplicationCard({ application }: { application: Application }) {
  const statusConfig = APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.companyLogoText}>{application.job?.company?.name?.[0] || 'C'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{application.job?.title || 'Job'}</Text>
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.companyName}>{application.job?.company?.name || 'Company'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (statusConfig?.color || '#999') + '15' }]}>
          <Text style={[styles.statusText, { color: statusConfig?.color || '#999' }]}>
            {statusConfig?.label || application.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.footerText}>Applied {formatDate(application.created_at)}</Text>
        </View>
        {application.job?.city && (
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.footerText}>{application.job.city}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ApplicationsScreen() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function load(refresh = false) {
    if (!user) return;
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    const { data } = await getCandidateApplications(user.id);
    setApplications((data || []) as Application[]);
    setIsLoading(false);
    setIsRefreshing(false);
  }

  useEffect(() => { load(); }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        {applications.length > 0 && <Text style={styles.headerCount}>{applications.length} total</Text>}
      </View>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="briefcase-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptySubtitle}>Apply to jobs to track them here</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ApplicationCard application={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  headerCount: { fontSize: 14, color: colors.textSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textTertiary, marginTop: 4 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  companyLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  companyLogoText: { fontSize: 18, fontWeight: '700', color: colors.textSecondary },
  cardInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  companyName: { fontSize: 13, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', gap: 16, marginTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: colors.textTertiary },
});
