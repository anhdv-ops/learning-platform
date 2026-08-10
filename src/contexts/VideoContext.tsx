'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type VideoData = {
  url: string
  title: string
  lessonId: string
  courseId: string
}

type VideoContextType = {
  currentVideo: VideoData | null
  playVideo: (video: VideoData) => void
  closeVideo: () => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null)

  const playVideo = (video: VideoData) => {
    setCurrentVideo(video)
  }

  const closeVideo = () => {
    setCurrentVideo(null)
  }

  return (
    <VideoContext.Provider value={{ currentVideo, playVideo, closeVideo }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}
