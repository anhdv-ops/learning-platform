export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: number; // Duration in minutes/seconds (using number)
  url: string;
  description: string;
  status: 'not-started' | 'completed';
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  kindOfCourse: string;
  totalLessons: number;
  progress: number;
  status?: string;
  lessons: Lesson[];
}
