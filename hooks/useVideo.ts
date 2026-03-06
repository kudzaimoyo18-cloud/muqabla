import { useState, useCallback, useRef } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { uploadVideo } from '@/lib/mux';
import { createVideoRecord, updateVideoRecord, updateCandidateProfile } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { VideoType } from '@/types';
import { APP_CONFIG } from '@/constants/config';

interface UseVideoRecorderOptions {
  maxDuration?: number;
  onRecordingComplete?: (uri: string) => void;
}

export function useVideoRecorder(options: UseVideoRecorderOptions = {}) {
  const { maxDuration = APP_CONFIG.video.maxDuration } = options;

  const cameraRef = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.front);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request camera permissions
  const requestPermissions = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
    setHasPermission(status === 'granted' && audioStatus === 'granted');
    return status === 'granted' && audioStatus === 'granted';
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      const interval = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            clearInterval(interval);
          }
          return prev + 1;
        });
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration,
        quality: '1080p',
        mute: false,
      });

      clearInterval(interval);
      setRecordedUri(video.uri);
      options.onRecordingComplete?.(video.uri);
    } catch (error) {
      console.error('Recording error:', error);
    } finally {
      setIsRecording(false);
    }
  }, [isRecording, maxDuration, options]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  }, [isRecording]);

  // Flip camera
  const flipCamera = useCallback(() => {
    setCameraType((prev) =>
      prev === CameraType.front ? CameraType.back : CameraType.front
    );
  }, []);

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordedUri(null);
    setDuration(0);
  }, []);

  return {
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
  };
}

// Hook for uploading videos
export function useVideoUpload() {
  const { user, loadUserProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      videoUri: string,
      type: VideoType,
      duration: number
    ): Promise<{ success: boolean; videoId?: string }> => {
      if (!user) {
        setError('You must be logged in to upload videos');
        return { success: false };
      }

      try {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        // Upload to MUX
        const result = await uploadVideo(videoUri, (stage, progress) => {
          setUploadStage(stage);
          setUploadProgress(progress);
        });

        if (!result.success || !result.playbackId) {
          setError(result.error || 'Upload failed');
          return { success: false };
        }

        // Create video record in Supabase
        const { data: videoData, error: dbError } = await createVideoRecord({
          owner_id: user.id,
          type,
          duration: result.duration || duration,
          mux_asset_id: result.assetId,
          mux_playback_id: result.playbackId,
        });

        if (dbError || !videoData) {
          setError('Failed to save video record');
          return { success: false };
        }

        // Update video status to ready
        await updateVideoRecord(videoData.id, {
          status: 'ready',
          thumbnail_url: result.thumbnailUrl,
        });

        // If this is a profile video, update the candidate profile
        if (type === 'profile') {
          await updateCandidateProfile(user.id, {
            profile_video_id: videoData.id,
          });
          await loadUserProfile(user.id);
        }

        setUploadProgress(100);
        return { success: true, videoId: videoData.id };
      } catch (err) {
        console.error('Upload error:', err);
        setError('Upload failed');
        return { success: false };
      } finally {
        setIsUploading(false);
      }
    },
    [user, loadUserProfile]
  );

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStage('');
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    uploadProgress,
    uploadStage,
    error,
    resetUpload,
  };
}

// Get video playback URL from MUX playback ID
export function getVideoUrl(playbackId: string | null | undefined): string | null {
  if (!playbackId) return null;
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

// Get thumbnail URL from MUX playback ID
export function getThumbnailUrl(
  playbackId: string | null | undefined,
  options?: { width?: number; time?: number }
): string | null {
  if (!playbackId) return null;

  const params = new URLSearchParams();
  if (options?.width) params.set('width', options.width.toString());
  if (options?.time) params.set('time', options.time.toString());

  const query = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${query ? `?${query}` : ''}`;
}
