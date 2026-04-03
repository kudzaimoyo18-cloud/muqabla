'use client'

import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl: string
  className?: string
}

export function VideoPlayer({ videoUrl, className }: VideoPlayerProps) {
  return (
    <div className={cn("bg-black rounded-lg overflow-hidden", className)}>
      <video
        src={videoUrl}
        controls
        autoPlay
        playsInline
        className="w-full aspect-video"
      />
    </div>
  )
}