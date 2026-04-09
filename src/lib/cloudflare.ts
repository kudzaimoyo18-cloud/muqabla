const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const STREAM_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

// R2 public bucket URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-a1ade910a8c54509a8de1f2e5e864e7a.r2.dev';

// Supabase Storage public URL base
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export function isDirectVideo(cloudflareUid: string): boolean {
  return cloudflareUid.startsWith('r2://') || cloudflareUid.startsWith('supabase://');
}

// Keep old name as alias for backward compat in existing code
export const isR2Video = isDirectVideo;

export function getVideoUrl(cloudflareUid: string): string {
  if (cloudflareUid.startsWith('supabase://')) {
    const path = cloudflareUid.replace('supabase://', '');
    return `${SUPABASE_URL}/storage/v1/object/public/videos/${path}`;
  }
  if (cloudflareUid.startsWith('r2://')) {
    const filename = cloudflareUid.replace('r2://', '');
    return `${R2_PUBLIC_URL}/${encodeURIComponent(filename)}`;
  }
  // Cloudflare Stream embed URL
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${cloudflareUid}/iframe`;
}

export async function getDirectUploadUrl(): Promise<{ uploadUrl: string; videoId: string } | null> {
  try {
    const response = await fetch(`${STREAM_URL}/direct_upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxDurationSeconds: 300, requireSignedURLs: false }),
    });

    const data = await response.json();
    if (data.success && data.result) {
      return { uploadUrl: data.result.uploadURL, videoId: data.result.uid };
    }
    return null;
  } catch (error) {
    console.error('Cloudflare direct upload error:', error);
    return null;
  }
}

export async function getVideoDetails(videoId: string) {
  try {
    const response = await fetch(`${STREAM_URL}/${videoId}`, {
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
    });
    const data = await response.json();
    return data.success ? data.result : null;
  } catch {
    return null;
  }
}

export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`${STREAM_URL}/${videoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getPlaybackUrl(videoId: string): string {
  if (isDirectVideo(videoId)) return getVideoUrl(videoId);
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
}

export function getThumbnailUrl(videoId: string, time = 1): string {
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=${time}s`;
}

export function getEmbedUrl(videoId: string): string {
  return getVideoUrl(videoId);
}
