import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Text,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { getVideoUrl, getThumbnailUrl } from '@/hooks/useVideo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  playbackId?: string | null;
  uri?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  style?: object;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  onError?: (error: string) => void;
}

export default function VideoPlayer({
  playbackId,
  uri,
  thumbnailUrl,
  autoplay = false,
  loop = true,
  muted = false,
  showControls = true,
  style,
  onPlaybackStatusUpdate,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(muted);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Get video source
  const videoSource = uri || (playbackId ? getVideoUrl(playbackId) : null);
  const posterSource = thumbnailUrl || (playbackId ? getThumbnailUrl(playbackId) : undefined);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setIsLoading(false);
        setIsPlaying(status.isPlaying);
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);

        if (status.didJustFinish && !loop) {
          videoRef.current?.setPositionAsync(0);
        }
      } else if (status.error) {
        setError(status.error);
        onError?.(status.error);
      }

      onPlaybackStatusUpdate?.(status);
    },
    [loop, onError, onPlaybackStatusUpdate]
  );

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  }, [isMuted]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  if (!videoSource) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Ionicons name="videocam-off-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>No video available</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Failed to load video</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri: videoSource }}
        posterSource={posterSource ? { uri: posterSource } : undefined}
        usePoster={!!posterSource}
        posterStyle={styles.poster}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={autoplay}
        isLooping={loop}
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Controls overlay */}
      {showControls && (
        <TouchableOpacity
          style={styles.controlsOverlay}
          activeOpacity={1}
          onPress={togglePlayPause}
        >
          {/* Play/Pause button */}
          {!isPlaying && !isLoading && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={40} color="#fff" />
            </View>
          )}

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>

            {/* Time and mute */}
            <View style={styles.controlsRow}>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>

              <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Simplified video player for feed (auto-plays, minimal controls)
export function FeedVideoPlayer({
  playbackId,
  isVisible = true,
  onPress,
}: {
  playbackId?: string | null;
  isVisible?: boolean;
  onPress?: () => void;
}) {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoSource = playbackId ? getVideoUrl(playbackId) : null;

  if (!videoSource) {
    return (
      <View style={styles.feedContainer}>
        <View style={styles.feedPlaceholder}>
          <Ionicons name="videocam-outline" size={64} color={colors.textSecondary} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.feedContainer}
      activeOpacity={1}
      onPress={onPress}
    >
      <Video
        ref={videoRef}
        source={{ uri: videoSource }}
        style={styles.feedVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isVisible}
        isLooping
        isMuted={false}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  poster: {
    flex: 1,
    resizeMode: 'cover',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  muteButton: {
    padding: 4,
  },
  feedContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  feedVideo: {
    flex: 1,
  },
  feedPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});
