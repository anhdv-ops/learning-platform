export interface Comment {
  id: string
  lessonId: string
  userId: string
  parentId: string | null
  content: string
  createdAt: string
  userEmail: string
  replies?: Comment[]
}
