// MUX Video Integration
// Handles video uploads and playback URLs

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

// Base64 encode credentials for Basic Auth
const getMuxAuthHeader = () => {
  const credentials = `${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`;
  return `Basic ${btoa(credentials)}`;
};

interface MuxUploadResponse {
  data: {
    id: string;
    url: string;
    status: string;
    new_asset_settings: {
      playback_policy: string[];
    };
  };
}

interface MuxAssetResponse {
  data: {
    id: string;
    status: string;
    playback_ids: Array<{
      id: string;
      policy: string;
    }>;
    duration: number;
    aspect_ratio: string;
  };
}

/**
 * Create a direct upload URL for video
 * User uploads directly to MUX, avoiding our server as intermediary
 */
export async function createMuxUpload(): Promise<{
  uploadUrl: string;
  uploadId: string;
} | null> {
  try {
    const response = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getMuxAuthHeader(),
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ['public'],
          max_resolution_tier: '1080p',
          encoding_tier: 'baseline', // Faster encoding
        },
        cors_origin: '*',
      }),
    });

    if (!response.ok) {
      console.error('MUX upload creation failed:', await response.text());
      return null;
    }

    const data: MuxUploadResponse = await response.json();
    return {
      uploadUrl: data.data.url,
      uploadId: data.data.id,
    };
  } catch (error) {
    console.error('Error creating MUX upload:', error);
    return null;
  }
}

/**
 * Upload video file to MUX using the direct upload URL
 */
export async function uploadVideoToMux(
  uploadUrl: string,
  videoUri: string,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {
    // For React Native, we need to read the file
    const response = await fetch(videoUri);
    const blob = await response.blob();

    // Upload to MUX
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'video/mp4',
      },
    });

    // MUX returns 200 on success
    return uploadResponse.ok;
  } catch (error) {
    console.error('Error uploading video to MUX:', error);
    return false;
  }
}

/**
 * Get upload status and asset ID once upload is complete
 */
export async function getMuxUploadStatus(uploadId: string): Promise<{
  status: string;
  assetId?: string;
} | null> {
  try {
    const response = await fetch(
      `https://api.mux.com/video/v1/uploads/${uploadId}`,
      {
        headers: {
          Authorization: getMuxAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      status: data.data.status,
      assetId: data.data.asset_id,
    };
  } catch (error) {
    console.error('Error getting MUX upload status:', error);
    return null;
  }
}

/**
 * Get asset details including playback ID
 */
export async function getMuxAsset(assetId: string): Promise<{
  playbackId: string;
  duration: number;
  status: string;
} | null> {
  try {
    const response = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        headers: {
          Authorization: getMuxAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: MuxAssetResponse = await response.json();
    const publicPlayback = data.data.playback_ids?.find(
      (p) => p.policy === 'public'
    );

    return {
      playbackId: publicPlayback?.id || '',
      duration: data.data.duration,
      status: data.data.status,
    };
  } catch (error) {
    console.error('Error getting MUX asset:', error);
    return null;
  }
}

/**
 * Poll for asset to be ready (after upload completes)
 */
export async function waitForAssetReady(
  uploadId: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<{
  assetId: string;
  playbackId: string;
  duration: number;
} | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // First check upload status
    const uploadStatus = await getMuxUploadStatus(uploadId);

    if (!uploadStatus) {
      await sleep(intervalMs);
      continue;
    }

    if (uploadStatus.status === 'asset_created' && uploadStatus.assetId) {
      // Now check asset status
      const asset = await getMuxAsset(uploadStatus.assetId);

      if (asset && asset.status === 'ready') {
        return {
          assetId: uploadStatus.assetId,
          playbackId: asset.playbackId,
          duration: asset.duration,
        };
      }
    }

    await sleep(intervalMs);
  }

  return null;
}

/**
 * Get the HLS stream URL for a video
 */
export function getMuxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Get thumbnail URL for a video
 */
export function getMuxThumbnailUrl(
  playbackId: string,
  options?: {
    width?: number;
    height?: number;
    time?: number;
    format?: 'jpg' | 'png' | 'gif';
  }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.time) params.set('time', options.time.toString());

  const format = options?.format || 'jpg';
  const queryString = params.toString();

  return `https://image.mux.com/${playbackId}/thumbnail.${format}${
    queryString ? `?${queryString}` : ''
  }`;
}

/**
 * Get animated GIF preview URL
 */
export function getMuxGifUrl(
  playbackId: string,
  options?: {
    width?: number;
    fps?: number;
    start?: number;
    end?: number;
  }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.set('width', options.width.toString());
  if (options?.fps) params.set('fps', options.fps.toString());
  if (options?.start) params.set('start', options.start.toString());
  if (options?.end) params.set('end', options.end.toString());

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/animated.gif${
    queryString ? `?${queryString}` : ''
  }`;
}

/**
 * Delete a MUX asset
 */
export async function deleteMuxAsset(assetId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: getMuxAuthHeader(),
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting MUX asset:', error);
    return false;
  }
}

// Helper function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ COMPLETE VIDEO UPLOAD FLOW ============

/**
 * Complete video upload flow:
 * 1. Create upload URL
 * 2. Upload video
 * 3. Wait for processing
 * 4. Return playback info
 */
export async function uploadVideo(
  videoUri: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<{
  success: boolean;
  assetId?: string;
  playbackId?: string;
  duration?: number;
  thumbnailUrl?: string;
  streamUrl?: string;
  error?: string;
}> {
  try {
    // Step 1: Create upload URL
    onProgress?.('creating', 0);
    const upload = await createMuxUpload();
    if (!upload) {
      return { success: false, error: 'Failed to create upload URL' };
    }

    // Step 2: Upload video
    onProgress?.('uploading', 20);
    const uploaded = await uploadVideoToMux(upload.uploadUrl, videoUri);
    if (!uploaded) {
      return { success: false, error: 'Failed to upload video' };
    }

    // Step 3: Wait for processing
    onProgress?.('processing', 60);
    const asset = await waitForAssetReady(upload.uploadId);
    if (!asset) {
      return { success: false, error: 'Video processing timed out' };
    }

    // Step 4: Return result
    onProgress?.('complete', 100);
    return {
      success: true,
      assetId: asset.assetId,
      playbackId: asset.playbackId,
      duration: asset.duration,
      thumbnailUrl: getMuxThumbnailUrl(asset.playbackId),
      streamUrl: getMuxStreamUrl(asset.playbackId),
    };
  } catch (error) {
    console.error('Video upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
