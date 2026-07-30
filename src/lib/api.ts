import { Course, Lesson } from '@/types/course'

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'IELTS Intensive 7.5+',
    description: 'Khóa học chuyên sâu luyện thi IELTS mục tiêu 7.5+',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    level: 'MTC',
    kindOfCourse: 'IELTS',
    totalLessons: 20,
    progress: 5,
    lessons: []
  },
  {
    id: 'c2',
    title: 'TOEIC 850 Mastery',
    description: 'Chinh phục TOEIC 850 dễ dàng và nhanh chóng.',
    thumbnail: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80',
    level: 'TC',
    kindOfCourse: 'TOEIC',
    totalLessons: 15,
    progress: 0,
    lessons: []
  },
  {
    id: 'c3',
    title: 'VSTEP Bậc 3-5 (B1-C1)',
    description: 'Luyện thi VSTEP cấp tốc hiệu quả cao.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    level: 'S',
    kindOfCourse: 'VSTEP',
    totalLessons: 30,
    progress: 10,
    lessons: []
  },
  {
    id: 'c4',
    title: 'English 4 Skills Starter',
    description: 'Phát triển toàn diện 4 kỹ năng tiếng Anh cơ bản.',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    level: 'Pres',
    kindOfCourse: '4SKILLS',
    totalLessons: 25,
    progress: 20,
    lessons: []
  },
  {
    id: 'c5',
    title: 'IELTS Foundation',
    description: 'Xây dựng nền tảng vững chắc cho IELTS 5.0+.',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    level: 'Pres',
    kindOfCourse: 'IELTS',
    totalLessons: 40,
    progress: 0,
    lessons: []
  },
  {
    id: 'c6',
    title: 'TOEIC 500+ Target',
    description: 'Dành cho người mất gốc muốn đạt TOEIC 500.',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    level: 'S',
    kindOfCourse: 'TOEIC',
    totalLessons: 18,
    progress: 18,
    status: 'completed',
    lessons: []
  },
  {
    id: 'c7',
    title: 'IELTS Speaking Pro',
    description: 'Nâng cao kỹ năng nói IELTS cùng chuyên gia bản ngữ.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    level: 'TC',
    kindOfCourse: 'IELTS',
    totalLessons: 12,
    progress: 2,
    lessons: []
  },
  {
    id: 'c8',
    title: '4 Skills Advanced',
    description: 'Làm chủ 4 kỹ năng tiếng Anh ở mức độ nâng cao.',
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    level: 'MTC',
    kindOfCourse: '4SKILLS',
    totalLessons: 50,
    progress: 25,
    lessons: []
  },
  {
    id: 'c9',
    title: 'VSTEP Speaking & Writing',
    description: 'Chuyên sâu kỹ năng Speaking và Writing cho VSTEP.',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    level: 'TC',
    kindOfCourse: 'VSTEP',
    totalLessons: 20,
    progress: 0,
    lessons: []
  },
  {
    id: 'c10',
    title: 'TOEIC Listening Practice',
    description: 'Thực hành kỹ năng nghe TOEIC với đề thi thực tế.',
    thumbnail: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=800&q=80',
    level: 'MTC',
    kindOfCourse: 'TOEIC',
    totalLessons: 15,
    progress: 15,
    status: 'completed',
    lessons: []
  },
  {
    id: 'c11',
    title: 'IELTS Writing Task 1',
    description: 'Cách viết IELTS Task 1 (biểu đồ, bảng biểu) chuẩn xác.',
    thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    level: 'TC',
    kindOfCourse: 'IELTS',
    totalLessons: 8,
    progress: 4,
    lessons: []
  },
  {
    id: 'c12',
    title: 'IELTS Writing Task 2',
    description: 'Tuyệt chiêu ăn trọn điểm IELTS Task 2 Essay.',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    level: 'MTC',
    kindOfCourse: 'IELTS',
    totalLessons: 10,
    progress: 0,
    lessons: []
  }
]

export interface GetCoursesResponse {
  courses: Course[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getCourses(
  page: number,
  q?: string,
  level?: string
): Promise<GetCoursesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredCourses = [...MOCK_COURSES]

  if (q) {
    const searchKeyword = q.toLowerCase()
    filteredCourses = filteredCourses.filter(course =>
      course.title.toLowerCase().includes(searchKeyword)
    )
  }

  if (level) {
    filteredCourses = filteredCourses.filter(course => course.level === level)
  }

  const PAGE_SIZE = 9
  const startIndex = (page - 1) * PAGE_SIZE
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE)
  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE)

  return {
    courses: paginatedCourses,
    total: filteredCourses.length,
    totalPages,
    currentPage: page
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const course = MOCK_COURSES.find(c => c.id === id)
  if (!course) return null

  const mockLessons: Lesson[] = [
    {
      id: `l1-${course.id}`,
      courseId: course.id,
      title: 'Bài 1: Giới thiệu tổng quan',
      duration: 300,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Tổng quan chi tiết về mục tiêu và nội dung khóa học.',
      status: 'not-started',
      order: 1
    },
    {
      id: `l2-${course.id}`,
      courseId: course.id,
      title: 'Bài 2: Chiến thuật làm bài',
      duration: 900,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Các kỹ năng cốt lõi và mẹo làm bài để tiết kiệm thời gian.',
      status: 'not-started',
      order: 2
    },
    {
      id: `l3-${course.id}`,
      courseId: course.id,
      title: 'Bài 3: Thực hành bài tập mẫu',
      duration: 1200,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Áp dụng các kỹ năng đã học vào đề thi thực tế.',
      status: 'not-started',
      order: 3
    },
    {
      id: `l4-${course.id}`,
      courseId: course.id,
      title: 'Bài 4: Chữa bài và rút kinh nghiệm',
      duration: 1500,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Phân tích kỹ càng các lỗi sai học viên thường mắc phải.',
      status: 'not-started',
      order: 4
    }
  ]

  return { ...course, lessons: mockLessons }
}

export async function getLessonById(courseId: string, lessonId: string): Promise<Lesson | null> {
  const course = await getCourseById(courseId)
  if (!course) return null

  const lesson = course.lessons.find(l => l.id === lessonId)
  return lesson || null
}
