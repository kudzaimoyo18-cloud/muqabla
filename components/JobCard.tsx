import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { getThumbnailUrl } from '@/hooks/useVideo';
import type { JobWithDetails } from '@/types';
import { APPLICATION_STATUS, APP_CONFIG } from '@/constants/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface JobCardProps {
  job: JobWithDetails;
  onPress?: () => void;
  onApply?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
}

export default function JobCard({
  job,
  onPress,
  onApply,
  onSave,
  onShare,
  isSaved = false,
}: JobCardProps) {
  const thumbnailUrl = job.video?.mux_playback_id
    ? getThumbnailUrl(job.video.mux_playback_id, { width: 720 })
    : null;

  const formatSalary = () => {
    if (!job.show_salary || (!job.salary_min && !job.salary_max)) {
      return null;
    }

    const currency = job.salary_currency || 'AED';
    if (job.salary_min && job.salary_max) {
      return `${currency} ${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K`;
    }
    if (job.salary_min) {
      return `${currency} ${(job.salary_min / 1000).toFixed(0)}K+`;
    }
    return `Up to ${currency} ${(job.salary_max! / 1000).toFixed(0)}K`;
  };

  const getWorkModeIcon = () => {
    switch (job.work_mode) {
      case 'remote':
        return 'laptop-outline';
      case 'hybrid':
        return 'git-merge-outline';
      default:
        return 'business-outline';
    }
  };

  const workModeLabel = APP_CONFIG.workModes.find((w) => w.id === job.work_mode)?.name || job.work_mode;
  const jobTypeLabel = APP_CONFIG.jobTypes.find((j) => j.id === job.job_type)?.name || job.job_type;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.95} onPress={onPress}>
      {/* Background thumbnail */}
      {thumbnailUrl && (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Side actions */}
      <View style={styles.sideActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={isSaved ? colors.accent : '#fff'}
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-social-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Company info */}
        <View style={styles.companyRow}>
          {job.company?.logo_url ? (
            <Image source={{ uri: job.company.logo_url }} style={styles.companyLogo} />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <Text style={styles.companyLogoText}>
                {job.company?.name?.charAt(0) || 'C'}
              </Text>
            </View>
          )}
          <View style={styles.companyInfo}>
            <View style={styles.companyNameRow}>
              <Text style={styles.companyName} numberOfLines={1}>
                {job.company?.name}
              </Text>
              {job.company?.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
              )}
            </View>
            <Text style={styles.companyMeta} numberOfLines={1}>
              {job.company?.industry} • {job.company?.size}
            </Text>
          </View>
        </View>

        {/* Job title */}
        <Text style={styles.jobTitle} numberOfLines={2}>
          {job.title}
        </Text>

        {/* Tags */}
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.tagText}>{job.city}</Text>
          </View>

          <View style={styles.tag}>
            <Ionicons name={getWorkModeIcon()} size={14} color="#fff" />
            <Text style={styles.tagText}>{workModeLabel}</Text>
          </View>

          <View style={styles.tag}>
            <Ionicons name="briefcase-outline" size={14} color="#fff" />
            <Text style={styles.tagText}>{jobTypeLabel}</Text>
          </View>

          {formatSalary() && (
            <View style={[styles.tag, styles.salaryTag]}>
              <Ionicons name="cash-outline" size={14} color={colors.accent} />
              <Text style={[styles.tagText, styles.salaryText]}>{formatSalary()}</Text>
            </View>
          )}
        </View>

        {/* Apply button */}
        <TouchableOpacity style={styles.applyButton} onPress={onApply}>
          <Ionicons name="videocam" size={20} color="#fff" />
          <Text style={styles.applyButtonText}>Apply with Video</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Compact job card for lists
export function JobCardCompact({
  job,
  onPress,
}: {
  job: JobWithDetails;
  onPress?: () => void;
}) {
  const thumbnailUrl = job.video?.mux_playback_id
    ? getThumbnailUrl(job.video.mux_playback_id, { width: 200 })
    : null;

  return (
    <TouchableOpacity style={compactStyles.container} onPress={onPress}>
      {/* Thumbnail */}
      <View style={compactStyles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={compactStyles.thumbnail} />
        ) : (
          <View style={compactStyles.thumbnailPlaceholder}>
            <Ionicons name="videocam-outline" size={24} color={colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={compactStyles.content}>
        <Text style={compactStyles.title} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={compactStyles.company} numberOfLines={1}>
          {job.company?.name}
        </Text>
        <View style={compactStyles.meta}>
          <Text style={compactStyles.metaText}>{job.city}</Text>
          <Text style={compactStyles.metaDot}>•</Text>
          <Text style={compactStyles.metaText}>{job.work_mode}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  companyLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  companyMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  jobTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
  },
  salaryTag: {
    backgroundColor: 'rgba(201,162,39,0.3)',
  },
  salaryText: {
    color: colors.accent,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  thumbnailContainer: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  company: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  metaDot: {
    color: colors.textTertiary,
    marginHorizontal: 4,
  },
});
