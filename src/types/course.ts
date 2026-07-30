export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: number;
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
  level: 'S' | 'Pres' | 'TC' | 'MTC';
  kindOfCourse: 'IELTS' | 'TOEIC' | '4SKILLS' | 'VSTEP';
  totalLessons: number;
  progress: number;
  status?: string;
  lessons: Lesson[];
}
