import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { useVideoRecorder } from '@/hooks/useVideo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoRecorderProps {
  onVideoRecorded: (uri: string, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number;
}

export default function VideoRecorder({
  onVideoRecorded,
  onCancel,
  maxDuration = APP_CONFIG.video.maxDuration,
}: VideoRecorderProps) {
  const {
    cameraRef,
    cameraType,
    isRecording,
    recordedUri,
    duration,
    hasPermission,
    requestPermissions,
    startRecording,
    stopRecording,
    flipCamera,
    resetRecording,
  } = useVideoRecorder({
    maxDuration,
    onRecordingComplete: (uri) => {
      // Will be handled by the useEffect below
    },
  });

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (recordedUri) {
      onVideoRecorded(recordedUri, duration);
    }
  }, [recordedUri, duration, onVideoRecorded]);

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // No permission
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.permissionText}>Camera access is required</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in your device settings
        </Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressPercentage = (duration / maxDuration) * 100;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        ratio="16:9"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onCancel} style={styles.topButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <View style={styles.timerDot} />
            <Text style={styles.timerText}>
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.timerMax}> / {maxDuration}s</Text>
          </View>

          <TouchableOpacity onPress={flipCamera} style={styles.topButton}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>

        {/* Recording prompt */}
        {!isRecording && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>
              Tell employers about yourself
            </Text>
            <Text style={styles.promptSubtext}>
              Share your experience, skills, and what you're looking for
            </Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {/* Record button */}
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={[styles.recordInner, isRecording && styles.recordingInner]} />
          </TouchableOpacity>
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        )}
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  permissionText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  permissionSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cancelButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerMax: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  promptText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  promptSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordingButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
  },
  recordingInner: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
