export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userFullName?: string;
}

export interface CourseRatingStats {
  ratingAvg: number;
  ratingCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
