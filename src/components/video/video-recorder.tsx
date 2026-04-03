'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VideoRecorderProps {
  onRecordComplete: (videoUrl: string) => void
  onRecordCancel: () => void
}

export function VideoRecorder({ onRecordComplete, onRecordCancel }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)

      const mediaRecorder = new MediaRecorder(mediaStream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        onRecordComplete(url)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setRecordingTime(0)
    setIsRecording(false)
    onRecordCancel()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Record Your Video</h2>
        <p className="text-secondary">Tell us about yourself in 60 seconds</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-black rounded-lg"
            src={videoUrl || undefined}
          />
        </div>

        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
            >
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={stopRecording}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600"
              >
                Stop Recording
              </button>
              <button
                onClick={cancelRecording}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="text-center">
            <p className="text-lg font-semibold text-primary">
              Recording: {Math.floor(recordingTime)}s / 60s
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(recordingTime / 60) * 100}%` }}
              />
            </div>
          </div>
        )}

        {videoUrl && !isRecording && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-green-600 font-semibold">Recording complete!</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onRecordComplete(videoUrl)}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
              >
                Use This Video
              </button>
              <button
                onClick={cancelRecording}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600"
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}