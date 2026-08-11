'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CourseReview, CourseRatingStats } from '@/types/review'

export async function getCourseReviews(courseId: string): Promise<{
  reviews: CourseReview[];
  stats: CourseRatingStats;
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  const emptyStats: CourseRatingStats = {
    ratingAvg: 0,
    ratingCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  }

  if (error || !data) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error)
    return { reviews: [], stats: emptyStats }
  }

  // Calculate distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  const userIds = [...new Set(data.map((r: any) => r.user_id))]
  const nameMap: Record<string, string> = {}

  for (const uid of userIds) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', uid)
        .maybeSingle()

      if (profileData?.full_name || profileData?.email) {
        nameMap[uid] = profileData.full_name || profileData.email
      } else {
        nameMap[uid] = `Học viên ...${uid.slice(-4)}`
      }
    } catch {
      nameMap[uid] = `Học viên ...${uid.slice(-4)}`
    }
  }

  const reviews: CourseReview[] = data.map((r: any) => {
    const star = Math.min(5, Math.max(1, Number(r.rating) || 5))
    if (star >= 1 && star <= 5) {
      distribution[star as 1|2|3|4|5] = (distribution[star as 1|2|3|4|5] || 0) + 1
    }
    sum += star

    return {
      id: r.id,
      courseId: r.course_id,
      userId: r.user_id,
      rating: star,
      comment: r.comment || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userEmail: nameMap[r.user_id] || 'Học viên ẩn danh',
    }
  })

  const ratingCount = reviews.length
  const ratingAvg = ratingCount > 0 ? Number((sum / ratingCount).toFixed(1)) : 0

  return {
    reviews,
    stats: {
      ratingAvg,
      ratingCount,
      distribution,
    },
  }
}

export async function getUserCourseReview(courseId: string): Promise<CourseReview | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    courseId: data.course_id,
    userId: data.user_id,
    rating: data.rating,
    comment: data.comment || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userEmail: user.email || 'Tôi',
  }
}

export async function addOrUpdateReview(
  courseId: string,
  rating: number,
  comment: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để gửi đánh giá' }
  }

  // 2. Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { ok: false, error: 'Chỉ học viên đã đăng ký khóa học mới có thể viết đánh giá' }
  }

  // 3. Validate rating and comment
  if (rating < 1 || rating > 5) {
    return { ok: false, error: 'Số sao đánh giá phải từ 1 đến 5' }
  }

  const trimmedComment = comment.trim()
  if (trimmedComment.length > 2000) {
    return { ok: false, error: 'Nội dung nhận xét không được vượt quá 2000 ký tự' }
  }

  // 4. Upsert review
  const { error: upsertError } = await supabase
    .from('course_reviews')
    .upsert(
      {
        course_id: courseId,
        user_id: user.id,
        rating,
        comment: trimmedComment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'course_id,user_id' }
    )

  if (upsertError) {
    console.error('Lỗi khi gửi đánh giá:', upsertError)
    return { ok: false, error: upsertError.message }
  }

  // Defense-in-depth: explicit sync recalculation to guarantee courses table is updated
  try {
    const { data: aggregateData } = await supabase
      .from('course_reviews')
      .select('rating')
      .eq('course_id', courseId)

    if (aggregateData) {
      const count = aggregateData.length
      const avg = count > 0 ? Number((aggregateData.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / count).toFixed(2)) : 0

      await supabase
        .from('courses')
        .update({ rating_avg: avg, rating_count: count })
        .eq('id', courseId)
    }
  } catch (calcErr) {
    console.warn('Lỗi khi tự động cập nhật thống kê khóa học:', calcErr)
  }

  revalidatePath('/courses')
  revalidatePath('/my-courses')
  revalidatePath(`/courses/${courseId}`)
  return { ok: true }
}

export async function deleteReview(
  courseId: string,
  reviewId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập' }
  }

  const { data: review } = await supabase
    .from('course_reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single()

  if (!review || review.user_id !== user.id) {
    return { ok: false, error: 'Bạn không có quyền xóa đánh giá này' }
  }

  const { error: deleteError } = await supabase
    .from('course_reviews')
    .delete()
    .eq('id', reviewId)

  if (deleteError) {
    console.error('Lỗi khi xóa đánh giá:', deleteError)
    return { ok: false, error: deleteError.message }
  }

  // Defense-in-depth: explicit sync recalculation after delete
  try {
    const { data: aggregateData } = await supabase
      .from('course_reviews')
      .select('rating')
      .eq('course_id', courseId)

    const count = aggregateData ? aggregateData.length : 0
    const avg = count > 0 ? Number((aggregateData!.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / count).toFixed(2)) : 0

    await supabase
      .from('courses')
      .update({ rating_avg: avg, rating_count: count })
      .eq('id', courseId)
  } catch (calcErr) {
    console.warn('Lỗi khi tự động cập nhật thống kê khóa học:', calcErr)
  }

  revalidatePath('/courses')
  revalidatePath('/my-courses')
  revalidatePath(`/courses/${courseId}`)
  return { ok: true }
}
