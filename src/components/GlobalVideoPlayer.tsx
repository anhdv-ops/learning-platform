'use client'

import React, { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useVideo } from '@/contexts/VideoContext'
import Hls from 'hls.js'

function getEmbedUrl(url: string) {
  let videoId = ''

  if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || ''
  } else if (url.includes('youtube.com/watch')) {
    try {
      const parsedUrl = new URL(url)
      videoId = parsedUrl.searchParams.get('v') || ''
    } catch {}
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`
  }

  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
}

export default function GlobalVideoPlayer() {
  const { currentVideo, closeVideo } = useVideo()
  const pathname = usePathname()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  // HLS handler
  useEffect(() => {
    if (!currentVideo || !currentVideo.url.endsWith('.m3u8')) return

    const video = videoRef.current
    if (!video) return

    let hls: Hls

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30,
      })
      hls.loadSource(currentVideo.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('HLS play blocked', e))
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentVideo.url
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('HLS native play blocked', e))
      })
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [currentVideo])

  if (!currentVideo) return null

  const lessonPath = `/courses/${currentVideo.courseId}/lessons/${currentVideo.lessonId}`
  const isOnLessonPage = pathname === lessonPath

  const handleMiniPlayerClick = () => {
    if (!isOnLessonPage) {
      router.push(lessonPath)
    }
  }

  const containerClasses = isOnLessonPage
    ? 'w-full max-w-4xl mx-auto aspect-video mt-8 mb-4 px-4 sm:px-6 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out relative z-40'
    : 'fixed bottom-6 right-6 w-80 sm:w-96 aspect-video z-50 overflow-hidden transition-all duration-500 ease-in-out hover:scale-[1.02] cursor-pointer group shadow-xl shadow-black/40'

  const isHls = currentVideo.url.endsWith('.m3u8')

  return (
    <div
      className={containerClasses}
      onClick={!isOnLessonPage ? handleMiniPlayerClick : undefined}
      style={{ borderRadius: isOnLessonPage ? 'var(--radius-2xl)' : 'var(--radius-xl)' }}
    >
      {/* Header bar */}
      <div className={`absolute top-0 left-0 right-0 p-2 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300 ${isOnLessonPage ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        {!isOnLessonPage && (
          <h4 className="text-white text-sm font-semibold truncate pr-4 pl-2 drop-shadow-md">
            {currentVideo.title}
          </h4>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            closeVideo()
          }}
          className={`w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-colors cursor-pointer ${isOnLessonPage ? 'ml-auto' : ''}`}
          title="Đóng video"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!isOnLessonPage && (
        <div className="absolute inset-0 z-0 bg-transparent" />
      )}

      {/* Mini-player glow border */}
      {!isOnLessonPage && (
        <div className="absolute inset-0 rounded-[inherit] border border-purple-500/30 pointer-events-none z-20" />
      )}

      <div className="w-full h-full bg-black overflow-hidden" style={{ borderRadius: 'inherit' }}>
        {isHls ? (
          <video
            ref={videoRef}
            controls={isOnLessonPage}
            className="w-full h-full object-contain pointer-events-auto"
            playsInline
          />
        ) : (
          <iframe
            src={getEmbedUrl(currentVideo.url)}
            title={currentVideo.title}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}
