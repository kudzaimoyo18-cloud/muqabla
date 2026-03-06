import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, candidateProfile, employerProfile, signOut } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Sign in to manage your profile</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.full_name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.fullName}>{user.full_name || 'Set your name'}</Text>
          {candidateProfile?.headline && <Text style={styles.headline}>{candidateProfile.headline}</Text>}
          {employerProfile?.title && <Text style={styles.headline}>{employerProfile.title}</Text>}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{user.type === 'candidate' ? 'Job Seeker' : 'Employer'}</Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          {user.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
          )}
          {candidateProfile?.city && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{candidateProfile.city}, {candidateProfile.country}</Text>
            </View>
          )}
          {employerProfile?.company?.name && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{employerProfile.company.name}</Text>
            </View>
          )}
        </View>
        {user.type === 'candidate' && candidateProfile && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidateProfile.profile_views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidateProfile.applications_count}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidateProfile.desired_industries.length}</Text>
              <Text style={styles.statLabel}>Industries</Text>
            </View>
          </View>
        )}
        {candidateProfile?.desired_industries && candidateProfile.desired_industries.length > 0 && (
          <View style={styles.industriesSection}>
            <Text style={styles.sectionTitle}>Industry Interests</Text>
            <View style={styles.chipsRow}>
              {candidateProfile.desired_industries.map((ind) => (
                <View key={ind} style={styles.chip}>
                  <Text style={styles.chipText}>{ind}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  profileSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  fullName: { fontSize: 22, fontWeight: '700', color: colors.text },
  headline: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  typeBadge: { marginTop: 8, backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  infoSection: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 20, paddingVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  infoText: { fontSize: 15, color: colors.text },
  statsSection: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 12, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
  industriesSection: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 13, color: colors.textSecondary },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginHorizontal: 20, padding: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.error + '30' },
  signOutText: { fontSize: 15, fontWeight: '600', color: colors.error },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, marginTop: 24 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
