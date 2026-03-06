import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchJobs } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import type { Job } from '@/types';

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract',
  freelance: 'Freelance', internship: 'Internship',
};

function SearchResultCard({ job }: { job: Job }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{job.company?.name?.[0] || 'C'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company?.name || 'Company'}</Text>
          <View style={styles.tagsRow}>
            <Text style={styles.tagText}>{job.city}</Text>
            <Text style={styles.tagDot}> · </Text>
            <Text style={styles.tagText}>{JOB_TYPE_LABELS[job.job_type] || job.job_type}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    const { data } = await searchJobs({ query: query.trim() }, undefined, 20);
    setResults((data || []) as Job[]);
    setIsSearching(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Jobs</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Search job titles, keywords..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : hasSearched ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SearchResultCard job={item} />}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
            }
          />
        ) : (
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtitle}>Try different keywords</Text>
          </View>
        )
      ) : (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={64} color={colors.border} />
          <Text style={styles.emptySubtitle}>Search for your next opportunity</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 10 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textTertiary, marginTop: 4 },
  resultCount: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  cardRow: { flexDirection: 'row', gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  cardInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  companyName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tagText: { fontSize: 12, color: colors.textTertiary },
  tagDot: { fontSize: 12, color: colors.textTertiary },
});
