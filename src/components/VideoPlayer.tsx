'use client'

import React from 'react'
import { useVideo } from '@/contexts/VideoContext'

type VideoPlayerProps = {
  url: string
  title: string
  lessonId: string
  courseId: string
}

export default function VideoPlayer({ url, title, lessonId, courseId }: VideoPlayerProps) {
  const { currentVideo, playVideo } = useVideo()

  if (currentVideo?.lessonId === lessonId) {
    return null
  }

  return (
    <div
      className="w-full aspect-video bg-bg-secondary rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center border border-border-subtle cursor-pointer group transition-all duration-300 hover:border-border-accent hover:shadow-lg hover:shadow-accent-violet/10"
      style={{ borderRadius: 'var(--radius-2xl)' }}
      onClick={() => playVideo({ url, title, lessonId, courseId })}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 pointer-events-none" />
      <div className="flex flex-col items-center gap-4 relative z-10">
        <button className="w-14 h-14 bg-white/5 group-hover:bg-purple-600/30 backdrop-blur-md rounded-full flex items-center justify-center text-text-primary group-hover:text-purple-400 transition-all group-hover:scale-110 border border-border-subtle group-hover:border-purple-500/40 shadow-lg">
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div className="text-text-tertiary text-sm font-medium tracking-wide group-hover:text-text-secondary transition-colors">
          Phát Video Bài Học
        </div>
      </div>
    </div>
  )
}
