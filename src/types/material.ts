export interface LessonMaterial {
  id: string
  lessonId: string
  userId: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'pdf' | 'video' | 'document' | 'other'
  fileSize: number // in bytes
  createdAt: string
}
