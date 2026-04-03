'use client'

import { VideoRecorder } from '@/components/video/video-recorder'

export default function RecordPage() {
  const handleRecordComplete = (videoUrl: string) => {
    console.log('Recording complete:', videoUrl)
    // Handle video upload and application logic here
  }

  const handleRecordCancel = () => {
    console.log('Recording cancelled')
    // Handle cancel logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Record Your Video</h1>
          <p className="text-secondary text-lg">Tell us about yourself in 60 seconds</p>
        </div>

        <VideoRecorder onRecordComplete={handleRecordComplete} onRecordCancel={handleRecordCancel} />
      </div>
    </div>
  )
}